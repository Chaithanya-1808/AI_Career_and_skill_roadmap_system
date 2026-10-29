import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare, Camera, ShieldAlert, Clock, ArrowRight, ArrowLeft,
  CheckCircle2, XCircle, AlertCircle, HelpCircle, Eye, EyeOff, RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { AssessmentAttempt, AssessmentResult, AssessmentQuestion } from '../types';
import { useAuth } from '../context/AuthContext';

export const AssessmentsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mode: 'launcher' | 'testing' | 'results'
  const [mode, setMode] = useState<'launcher' | 'testing' | 'results'>('launcher');

  // Pre-test configuration
  const [selectedCareerId, setSelectedCareerId] = useState(user?.target_job_role ? 'full-stack-developer' : 'full-stack-developer');
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [consentChecked, setConsentChecked] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean | null>(null);

  // Active Test State
  const [currentAttempt, setCurrentAttempt] = useState<AssessmentAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(900); // 15 mins
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);

  // Results State
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Webcam Video Ref
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const past = await api.getAssessmentHistory();
      setHistory(past);
    } catch (err) {
      console.error('Failed to load assessment history', err);
    }
  };

  // Setup webcam preview during launcher if cameraEnabled is on
  useEffect(() => {
    if (cameraEnabled && mode === 'launcher') {
      startCameraPreview();
    } else if (!cameraEnabled && mediaStreamRef.current) {
      stopCameraTracks();
      setCameraPermissionGranted(false);
    }
    return () => {
      if (mode !== 'testing') {
        stopCameraTracks();
      }
    };
  }, [cameraEnabled, mode]);

  const startCameraPreview = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraPermissionGranted(true);
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable', err);
      setCameraPermissionGranted(false);
    }
  };

  const stopCameraTracks = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  // Tab switch & Window Blur Integrity Listener during active test
  useEffect(() => {
    if (mode !== 'testing' || !currentAttempt) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchWarnings((prev) => prev + 1);
        api.logIntegrityEvent({
          attempt_id: currentAttempt.id,
          event_type: 'tab_switch',
          details: { timestamp: new Date().toISOString() },
        });
      }
    };

    const handleBlur = () => {
      api.logIntegrityEvent({
        attempt_id: currentAttempt.id,
        event_type: 'window_blur',
        details: { timestamp: new Date().toISOString() },
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [mode, currentAttempt]);

  // Server-synced countdown timer
  useEffect(() => {
    if (mode !== 'testing' || !currentAttempt) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expires = new Date(currentAttempt.expires_at).getTime();
      const remaining = Math.max(0, Math.floor((expires - now) / 1000));
      setTimeRemainingSeconds(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        handleAutoSubmit();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, currentAttempt]);

  const handleStartExam = async () => {
    if (cameraEnabled && !consentChecked) {
      alert('Please confirm your consent to camera-monitored integrity checking, or select Non-Camera alternative mode.');
      return;
    }

    try {
      const attempt = await api.startAssessment({
        career_id: selectedCareerId,
        camera_monitoring_enabled: cameraEnabled && cameraPermissionGranted === true,
      });
      setCurrentAttempt(attempt);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setTabSwitchWarnings(0);
      setMode('testing');
    } catch (err: any) {
      alert(err.message || 'Failed to start assessment');
    }
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleAutoSubmit = () => {
    handleSubmitExam();
  };

  const handleSubmitExam = async () => {
    if (!currentAttempt) return;
    const timeSpent = (currentAttempt.time_limit_minutes * 60) - timeRemainingSeconds;

    try {
      const result = await api.submitAssessment({
        attempt_id: currentAttempt.id,
        answers,
        time_spent_seconds: Math.max(timeSpent, 10),
      });
      setAssessmentResult(result);
      stopCameraTracks();
      setMode('results');
      loadHistory();
    } catch (err: any) {
      alert(err.message || 'Failed to submit assessment');
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* ---------------- 1. LAUNCHER SCREEN ---------------- */}
      {mode === 'launcher' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Diagnostic Skill Assessment
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Identify your baseline competencies with randomized server-scored questions and protected answer keys.
            </p>
          </div>

          {/* Configuration Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Career Focus
              </label>
              <select
                value={selectedCareerId}
                onChange={(e) => setSelectedCareerId(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="full-stack-developer">Full-Stack Developer (Web, React, SQL, APIs)</option>
                <option value="software-developer">Software Developer (C, Algorithms, Memory, OOP)</option>
                <option value="ai-ml-engineer">AI/ML Engineer (Python, Scikit-learn, Neural Nets)</option>
                <option value="data-scientist">Data Scientist (Statistics, Pandas, SQL)</option>
                <option value="cybersecurity-analyst">Cybersecurity Analyst (OWASP, Auth, Cryptography)</option>
                <option value="cloud-engineer">Cloud Engineer (Infrastructure, VPC, IAM, Containers)</option>
              </select>
            </div>

            {/* Assessment Integrity & Camera Consent Module */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">Consent-Based Assessment Integrity</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
                    <input
                      type="radio"
                      name="camera_mode"
                      checked={cameraEnabled}
                      onChange={() => setCameraEnabled(true)}
                      className="text-blue-600"
                    />
                    <span>Monitored Mode</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 ml-2">
                    <input
                      type="radio"
                      name="camera_mode"
                      checked={!cameraEnabled}
                      onChange={() => setCameraEnabled(false)}
                      className="text-blue-600"
                    />
                    <span>Standard Mode (No Camera)</span>
                  </label>
                </div>
              </div>

              {cameraEnabled ? (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Camera preview is used solely to verify active student presence. <b>No video recordings or audio are stored on our servers.</b> All camera streams are strictly terminated immediately upon test completion.
                  </p>

                  {/* Camera Live Preview */}
                  <div className="flex items-center gap-4">
                    <div className="w-36 h-24 rounded-lg bg-slate-900 overflow-hidden relative border border-slate-300 flex items-center justify-center shrink-0">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {cameraPermissionGranted === false && (
                        <span className="text-[10px] text-red-400 font-semibold p-1 text-center">
                          Camera access denied
                        </span>
                      )}
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold">
                        {cameraPermissionGranted ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Camera Ready
                          </span>
                        ) : (
                          <span className="text-amber-600 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Testing Camera Permissions...
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Ensure your face is clearly visible in the preview box.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-start gap-2 pt-1 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className="rounded mt-0.5 text-blue-600"
                    />
                    <span>
                      I give explicit consent to active webcam presence monitoring and tab-visibility logging during this diagnostic.
                    </span>
                  </label>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Standard mode selected. Tab-switch logs and server timers remain active for integrity auditing.
                </p>
              )}
            </div>

            {/* Test Rules Banner */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-600 pt-2">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block text-sm">10</span>
                <span>Questions</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block text-sm">15 min</span>
                <span>Time Limit</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block text-sm">60%</span>
                <span>Passing Grade</span>
              </div>
            </div>

            <button
              onClick={handleStartExam}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Begin Diagnostic Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* History Table */}
          {history.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Past Assessment History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                      <th className="py-2 px-3 text-left">Title</th>
                      <th className="py-2 px-3 text-center">Score</th>
                      <th className="py-2 px-3 text-center">Status</th>
                      <th className="py-2 px-3 text-center">Integrity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((h) => (
                      <tr key={h.id}>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{h.title}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-blue-600">
                          {h.score_percentage !== null ? `${h.score_percentage}%` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {h.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            h.integrity_status === 'flagged' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {h.integrity_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- 2. ACTIVE TEST INTERFACE ---------------- */}
      {mode === 'testing' && currentAttempt && (
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Top Exam Status Bar */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-900 text-sm">{currentAttempt.title}</span>
              <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200/60">
                Question {currentQuestionIndex + 1} of {currentAttempt.questions.length}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {currentAttempt.camera_monitoring_enabled && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Monitored</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span className={timeRemainingSeconds < 180 ? 'text-red-600 animate-pulse' : ''}>
                  {formatTime(timeRemainingSeconds)}
                </span>
              </div>

              <button
                onClick={handleSubmitExam}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
              >
                Submit Exam
              </button>
            </div>
          </div>

          {/* Tab Switch Alert Notice */}
          {tabSwitchWarnings > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                <b>Integrity Signal:</b> Window focus change was detected ({tabSwitchWarnings} time(s)). Please remain on the assessment screen.
              </span>
            </div>
          )}

          {/* Question Body */}
          {(() => {
            const q = currentAttempt.questions[currentQuestionIndex];
            const selectedOpt = answers[q.id];

            return (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Main Question Card */}
                <div className="lg:col-span-3 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      {q.category} • {q.difficulty}
                    </span>
                    <button
                      onClick={() => {
                        const newAnswers = { ...answers };
                        delete newAnswers[q.id];
                        setAnswers(newAnswers);
                      }}
                      className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear selection</span>
                    </button>
                  </div>

                  <h3 className="text-sm md:text-base font-semibold text-slate-900 leading-snug">
                    {q.question_text}
                  </h3>

                  {q.code_snippet && (
                    <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                      <code>{q.code_snippet}</code>
                    </pre>
                  )}

                  {/* Options Radio List */}
                  <div className="space-y-2.5 pt-2">
                    {q.options.map((opt) => {
                      const isChosen = selectedOpt === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectOption(q.id, opt.id)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-start gap-3 ${
                            isChosen
                              ? 'bg-blue-50/70 border-blue-500 text-blue-900 ring-1 ring-blue-500'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                              isChosen ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span className="leading-relaxed">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Previous / Next Controls */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    <button
                      disabled={currentQuestionIndex === currentAttempt.questions.length - 1}
                      onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-40 flex items-center gap-1"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Right Side Palette & Camera Feed */}
                <div className="space-y-4">
                  {currentAttempt.camera_monitoring_enabled && (
                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm text-center">
                      <div className="w-full h-24 rounded-lg bg-slate-900 overflow-hidden relative">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium block mt-1.5">
                        Live Monitor Active
                      </span>
                    </div>
                  )}

                  {/* Question Palette */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-900 mb-3">Question Palette</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {currentAttempt.questions.map((ques, idx) => {
                        const isAns = Boolean(answers[ques.id]);
                        const isCurr = idx === currentQuestionIndex;
                        return (
                          <button
                            key={ques.id}
                            onClick={() => setCurrentQuestionIndex(idx)}
                            className={`h-8 rounded-lg font-bold text-xs transition-all ${
                              isCurr
                                ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                                : isAns
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ---------------- 3. RESULTS SCREEN ---------------- */}
      {mode === 'results' && assessmentResult && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-2xl ${
              assessmentResult.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
            }`}>
              {assessmentResult.passed ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Diagnostic Score Report
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {assessmentResult.score_percentage}% Score
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {assessmentResult.correct_answers_count} of {assessmentResult.total_questions} questions answered correctly
              </p>
            </div>

            <p className="text-xs text-slate-600 max-w-md mx-auto">
              {assessmentResult.next_recommended_action}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate('/roadmap')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span>View Adapted Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMode('launcher')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors"
              >
                Return to Assessments
              </button>
            </div>
          </div>

          {/* Detailed Question Review Accordion */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Question Explanations & Review</h3>
            <div className="space-y-3">
              {assessmentResult.review_items.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    item.is_correct ? 'bg-emerald-50/40 border-emerald-200' : 'bg-red-50/40 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900">
                      Q{idx + 1}: {item.question_text}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.is_correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 flex items-center gap-4">
                    <span>Your Choice: <b>Option {item.selected_option_id || 'None'}</b></span>
                    <span>Correct Answer: <b>Option {item.correct_option_id}</b></span>
                  </div>

                  {item.explanation && (
                    <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                      <b>Explanation:</b> {item.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
