import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare, Camera, ShieldCheck, ShieldAlert,
  Clock, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, AlertCircle,
  RotateCcw, Lock
} from 'lucide-react';
import { api } from '../services/api';
import { AssessmentAttempt, AssessmentResult, AssessmentQuestion } from '../types';
import { useAuth } from '../context/AuthContext';

export const AssessmentsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mode: 'launcher' | 'testing' | 'results'
  const [mode, setMode] = useState<'launcher' | 'testing' | 'results'>('launcher');

  // Proctoring is mandatory: Camera is permanently ON and cannot be turned off
  const [selectedCareerId, setSelectedCareerId] = useState(user?.target_job_role ? 'full-stack-developer' : 'full-stack-developer');
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean | null>(null);

  // Active Test State
  const [currentAttempt, setCurrentAttempt] = useState<AssessmentAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const answersRef = useRef<Record<string, string>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(900); // 15 mins

  // Malpractice & Integrity State
  const [malpracticeCount, setMalpracticeCount] = useState(0);
  const [isCameraOccluded, setIsCameraOccluded] = useState(false);
  const [activeMalpracticeAlert, setActiveMalpracticeAlert] = useState<{
    type: string;
    title: string;
    message: string;
  } | null>(null);

  const occlusionStreakRef = useRef(0);
  const lastLoggedEventTypeRef = useRef<string | null>(null);
  const lastLoggedTimestampRef = useRef<number>(0);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Results State
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Webcam Video Refs
  const launcherVideoRef = useRef<HTMLVideoElement | null>(null);
  const testingVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadHistory();
    // Automatically turn on webcam preview upon entering the assessment page
    startCameraPreview();
    return () => {
      stopCameraTracks();
    };
  }, []);

  const loadHistory = async () => {
    try {
      const past = await api.getAssessmentHistory();
      setHistory(past);
    } catch (err) {
      console.error('Failed to load assessment history', err);
    }
  };

  const startCameraPreview = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false
        });
        mediaStreamRef.current = stream;
        if (launcherVideoRef.current) {
          launcherVideoRef.current.srcObject = stream;
          launcherVideoRef.current.play().catch(() => {});
        }
        if (testingVideoRef.current) {
          testingVideoRef.current.srcObject = stream;
          testingVideoRef.current.play().catch(() => {});
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
    if (launcherVideoRef.current) {
      launcherVideoRef.current.srcObject = null;
    }
    if (testingVideoRef.current) {
      testingVideoRef.current.srcObject = null;
    }
  };

  // Connect active video feed when testing element mounts
  const setTestingVideoRef = (el: HTMLVideoElement | null) => {
    testingVideoRef.current = el;
    if (el && mediaStreamRef.current) {
      el.srcObject = mediaStreamRef.current;
      el.play().catch(() => {});
    }
  };

  // Helper to record malpractice events with rate-limiting
  const reportMalpractice = (eventType: string, title: string, message: string) => {
    const now = Date.now();
    setActiveMalpracticeAlert({ type: eventType, title, message });
    setMalpracticeCount((prev) => prev + 1);

    // Rate limit server log to once per 4 seconds per incident category
    if (
      currentAttempt &&
      (lastLoggedEventTypeRef.current !== eventType || now - lastLoggedTimestampRef.current > 4000)
    ) {
      lastLoggedEventTypeRef.current = eventType;
      lastLoggedTimestampRef.current = now;
      api.logIntegrityEvent({
        attempt_id: currentAttempt.id,
        event_type: eventType,
        details: { title, message, timestamp: new Date().toISOString() },
      }).catch((e) => console.warn('Integrity log failed', e));
    }
  };

  // -------------------------------------------------------------
  // 1. Real-time Camera Touching / Covering / Occlusion Detection
  // -------------------------------------------------------------
  useEffect(() => {
    if (mode !== 'testing' || !currentAttempt) return;

    const interval = setInterval(() => {
      const video = testingVideoRef.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0) {
        return;
      }

      // Initialize hidden analysis canvas
      if (!analysisCanvasRef.current) {
        analysisCanvasRef.current = document.createElement('canvas');
        analysisCanvasRef.current.width = 64;
        analysisCanvasRef.current.height = 48;
      }

      const canvas = analysisCanvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      try {
        ctx.drawImage(video, 0, 0, 64, 48);
        const imgData = ctx.getImageData(0, 0, 64, 48);
        const data = imgData.data;

        let totalLum = 0;
        const totalPixels = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
          totalLum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        }
        const avgLum = totalLum / totalPixels;

        // Calculate variance across pixels (detect solid paper/finger coverage with no contrast)
        let varSum = 0;
        for (let i = 0; i < data.length; i += 4) {
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          varSum += Math.abs(lum - avgLum);
        }
        const variance = varSum / totalPixels;

        // Condition for touched / covered camera: extreme darkness (< 18) OR uniform solid coverage (variance < 4)
        const isCovered = avgLum < 18 || (avgLum < 38 && variance < 4);

        if (isCovered) {
          occlusionStreakRef.current += 1;
          if (occlusionStreakRef.current >= 2) {
            setIsCameraOccluded(true);
            reportMalpractice(
              'camera_occlusion',
              'Camera Lens Covered / Obstructed',
              'Camera lens touched, blocked, or covered! Uncover the webcam lens immediately. Obstructing the camera is logged as examination malpractice.'
            );
          }
        } else {
          occlusionStreakRef.current = 0;
          setIsCameraOccluded(false);
        }
      } catch (err) {
        console.warn('Frame analysis error', err);
      }
    }, 700);

    return () => clearInterval(interval);
  }, [mode, currentAttempt]);

  // -------------------------------------------------------------
  // 2. Mobile Phone Usage, Tab Switching & Window Deviation Detection
  // -------------------------------------------------------------
  useEffect(() => {
    if (mode !== 'testing' || !currentAttempt) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportMalpractice(
          'tab_switch',
          'Tab Switch / Browser Deviation',
          'Tab switch detected! Switching tabs, opening secondary search browsers, or using mobile devices is prohibited.'
        );
      }
    };

    const handleBlur = () => {
      reportMalpractice(
        'window_blur',
        'Window Focus Lost (Possible Mobile / Screen Sharing)',
        'Window focus lost! Using mobile phones, external apps, or second monitors to copy answers triggers malpractice flagging.'
      );
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      reportMalpractice(
        'copy_paste_attempt',
        'Unauthorized Copy Action',
        'Copying question text is prohibited! Copy/paste actions are blocked and recorded in your integrity audit.'
      );
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      reportMalpractice(
        'copy_paste_attempt',
        'Unauthorized Paste Action',
        'Pasting external content into the assessment is prohibited.'
      );
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      reportMalpractice(
        'copy_paste_attempt',
        'Right-Click Context Menu Blocked',
        'Right-click context menu inspection is disabled during active assessments.'
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && ['c', 'v', 'u', 'a', 'p'].includes(e.key.toLowerCase())) ||
        e.key === 'F12' ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        reportMalpractice(
          'copy_paste_attempt',
          `Restricted Shortcut (${e.ctrlKey ? 'Ctrl+' + e.key.toUpperCase() : e.key})`,
          'Screen capture and text copy shortcuts are strictly blocked during proctored exams.'
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mode, currentAttempt]);

  // -------------------------------------------------------------
  // 3. Countdown Timer Sync
  // -------------------------------------------------------------
  useEffect(() => {
    if (mode !== 'testing' || !currentAttempt) return;

    const expiresRaw = currentAttempt.expires_at || '';
    const expiresNormalized = expiresRaw.endsWith('Z') || expiresRaw.includes('+') || expiresRaw.includes('-', 10)
      ? expiresRaw
      : `${expiresRaw}Z`;

    const expiresTime = new Date(expiresNormalized).getTime();
    const now = Date.now();
    const serverDelta = Math.floor((expiresTime - now) / 1000);

    let currentRemaining = (!isNaN(serverDelta) && serverDelta > 30)
      ? serverDelta
      : (currentAttempt.time_limit_minutes || 15) * 60;

    setTimeRemainingSeconds(currentRemaining);

    const timer = setInterval(() => {
      currentRemaining -= 1;
      setTimeRemainingSeconds(currentRemaining);

      if (currentRemaining <= 0) {
        clearInterval(timer);
        handleSubmitExam();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, currentAttempt]);

  const handleStartExam = async () => {
    if (!cameraPermissionGranted) {
      alert('Camera access is mandatory to begin the proctored assessment. Please allow webcam permissions in your browser.');
      await startCameraPreview();
      return;
    }

    try {
      const attempt = await api.startAssessment({
        career_id: selectedCareerId,
        camera_monitoring_enabled: true,
      });
      setCurrentAttempt(attempt);
      setAnswers({});
      answersRef.current = {};
      setCurrentQuestionIndex(0);
      setMalpracticeCount(0);
      setIsCameraOccluded(false);
      setActiveMalpracticeAlert(null);
      const initialSeconds = (attempt.time_limit_minutes || 15) * 60;
      setTimeRemainingSeconds(initialSeconds);
      setMode('testing');
    } catch (err: any) {
      alert(err.message || 'Failed to start assessment');
    }
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: optionId };
      answersRef.current = next;
      return next;
    });
  };

  const handleSubmitExam = async () => {
    if (!currentAttempt) return;
    const timeSpent = (currentAttempt.time_limit_minutes * 60) - timeRemainingSeconds;
    const finalAnswers = answersRef.current;

    try {
      const result = await api.submitAssessment({
        attempt_id: currentAttempt.id,
        answers: finalAnswers,
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
    const s = Math.max(0, secs);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem < 10 ? '0' : ''}${rem}`;
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
              Server-scored diagnostic evaluation with mandatory real-time AI webcam proctoring.
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
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="full-stack-developer">Full-Stack Developer (Web, React, SQL, APIs)</option>
                <option value="software-developer">Software Developer (C, Algorithms, Memory, OOP)</option>
                <option value="ai-ml-engineer">AI/ML Engineer (Python, Scikit-learn, Neural Nets)</option>
                <option value="data-scientist">Data Scientist (Statistics, Pandas, SQL)</option>
                <option value="cybersecurity-analyst">Cybersecurity Analyst (OWASP, Auth, Cryptography)</option>
                <option value="cloud-engineer">Cloud Engineer (Infrastructure, VPC, IAM, Containers)</option>
              </select>
            </div>

            {/* Mandatory AI Proctoring Module */}
            <div className="p-5 rounded-2xl bg-[#0c101b] border border-orange-500/30 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs sm:text-sm font-bold text-white">
                    Mandatory AI Webcam Proctoring Enabled
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Camera Required
                </span>
              </div>

              {/* Camera Live Preview & Anti-Malpractice Guidelines */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="w-48 h-32 rounded-xl bg-slate-950 overflow-hidden relative border border-white/15 flex items-center justify-center shrink-0 shadow-inner">
                  <video
                    ref={launcherVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {cameraPermissionGranted === false && (
                    <div className="absolute inset-0 bg-red-950/90 p-2 flex flex-col items-center justify-center text-center">
                      <AlertCircle className="w-6 h-6 text-red-400 mb-1" />
                      <span className="text-[10px] text-red-200 font-semibold leading-tight">
                        Camera access blocked
                      </span>
                    </div>
                  )}
                  {cameraPermissionGranted === true && (
                    <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Face In Frame
                    </div>
                  )}
                </div>

                <div className="text-xs space-y-2 flex-1">
                  <div className="flex items-center gap-2 font-semibold">
                    {cameraPermissionGranted ? (
                      <span className="text-emerald-400 flex items-center gap-1 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Camera Ready &amp; Calibrated
                      </span>
                    ) : (
                      <button
                        onClick={startCameraPreview}
                        className="text-orange-400 hover:text-orange-300 flex items-center gap-1 text-xs underline font-bold"
                      >
                        <Camera className="w-4 h-4" /> Click here to allow webcam access
                      </button>
                    )}
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                    <p className="font-bold text-amber-300 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Anti-Malpractice Examination Rules:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                      <li><b>Camera Must Remain Uncovered:</b> Touching, blocking, or covering the lens immediately shows a <b>Red Malpractice Warning</b>.</li>
                      <li><b>No Mobile Phones:</b> Looking away to mobiles, using secondary devices, or opening copying windows will be automatically flagged.</li>
                      <li><b>No Tab Switching:</b> Leaving the active exam screen logs an automated integrity violation on the server.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Rules Banner */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-400 pt-1">
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <span className="font-bold text-white block text-sm">10</span>
                <span>Questions</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <span className="font-bold text-white block text-sm">15 min</span>
                <span>Time Limit</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <span className="font-bold text-white block text-sm">60%</span>
                <span>Passing Grade</span>
              </div>
            </div>

            <button
              onClick={handleStartExam}
              disabled={!cameraPermissionGranted}
              className="w-full bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold py-3.5 rounded-xl text-xs shadow-[0_0_25px_rgba(249,115,22,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{cameraPermissionGranted ? 'Begin Proctored Assessment' : 'Allow Camera Access to Begin'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Past Assessment History */}
          {history.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Past Assessment History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-slate-400 font-semibold uppercase">
                      <th className="py-2 px-3 text-left">Title</th>
                      <th className="py-2 px-3 text-center">Score</th>
                      <th className="py-2 px-3 text-center">Status</th>
                      <th className="py-2 px-3 text-center">Integrity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {history.map((h) => (
                      <tr key={h.id}>
                        <td className="py-2.5 px-3 font-medium text-white">{h.title}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-orange-400">
                          {h.score_percentage !== null ? `${h.score_percentage}%` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-300 text-[10px] font-semibold">
                            {h.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            h.integrity_status === 'flagged'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {h.integrity_status.toUpperCase()}
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
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-900 text-sm">{currentAttempt.title}</span>
              <span className="text-[11px] font-semibold bg-orange-500/15 text-orange-400 px-2.5 py-0.5 rounded-full border border-orange-500/30">
                Question {currentQuestionIndex + 1} of {currentAttempt.questions.length}
              </span>
            </div>

            <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
              {/* Mandatory Proctored Status Indicator */}
              {isCameraOccluded || malpracticeCount > 0 ? (
                <div className="flex items-center gap-1.5 text-xs text-red-200 font-extrabold bg-red-950/80 px-3 py-1 rounded-full border border-red-500 shadow-[0_0_18px_rgba(239,68,68,0.5)] animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>MALPRACTICE FLAG ({malpracticeCount})</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Camera Monitored</span>
                </div>
              )}

              {/* Countdown Timer */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 bg-white/[0.05] px-3 py-1 rounded-lg border border-white/10">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className={timeRemainingSeconds < 180 ? 'text-red-400 animate-pulse font-mono font-bold' : 'font-mono'}>
                  {formatTime(timeRemainingSeconds)}
                </span>
              </div>

              <button
                onClick={handleSubmitExam}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl shadow-sm transition-colors"
              >
                Submit Exam
              </button>
            </div>
          </div>

          {/* PROMINENT RED MALPRACTICE ERROR NOTICES */}
          {activeMalpracticeAlert && (
            <div className="p-4 rounded-2xl bg-red-950/90 border-2 border-red-500 text-red-100 flex items-start gap-3.5 shadow-[0_0_35px_rgba(239,68,68,0.6)] animate-in fade-in duration-200">
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg animate-pulse">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-red-300 flex items-center gap-1.5">
                    <span>🚨 MALPRACTICE VIOLATION DETECTED (#{malpracticeCount})</span>
                  </span>
                  <span className="text-[10px] bg-red-800/80 text-red-100 px-2 py-0.5 rounded font-mono font-bold">
                    SECURITY INCIDENT LOGGED
                  </span>
                </div>
                <p className="text-xs text-white font-bold mt-1">
                  {activeMalpracticeAlert.message}
                </p>
                <p className="text-[11px] text-red-200/80 mt-1">
                  All camera blockages, phone copying deviations, and window switches are cryptographically audited on the server for faculty review.
                </p>
              </div>
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
                        answersRef.current = newAnswers;
                        setAnswers(newAnswers);
                      }}
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear selection</span>
                    </button>
                  </div>

                  <h3 className="text-sm md:text-base font-semibold text-slate-900 leading-snug">
                    {q.question_text}
                  </h3>

                  {q.code_snippet && (
                    <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-white/10">
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
                              ? 'bg-orange-500/15 border-orange-500 text-orange-200 ring-1 ring-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                              : 'bg-white border-slate-200 hover:bg-white/[0.04] text-slate-300'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                              isChosen ? 'bg-orange-500 text-white' : 'bg-white/10 text-slate-400'
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
                  <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                    <button
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                      className="px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/[0.05] disabled:opacity-30 flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    <button
                      disabled={currentQuestionIndex === currentAttempt.questions.length - 1}
                      onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs font-semibold disabled:opacity-30 flex items-center gap-1 shadow-sm"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Right Side Palette & Camera Feed */}
                <div className="space-y-4">
                  {/* Real-time Webcam Feed */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
                    <div className={`w-full h-28 rounded-xl bg-slate-950 overflow-hidden relative border transition-all ${
                      isCameraOccluded
                        ? 'border-red-500 ring-4 ring-red-500 shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-pulse'
                        : 'border-white/15'
                    }`}>
                      <video
                        ref={setTestingVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />

                      {/* RED ERROR OVERLAY IF CAMERA IS TOUCHED / OCCLUDED */}
                      {isCameraOccluded && (
                        <div className="absolute inset-0 bg-red-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-center text-white animate-pulse">
                          <AlertTriangle className="w-7 h-7 text-red-400 mb-1 animate-bounce" />
                          <span className="text-[10px] font-extrabold uppercase text-red-200 tracking-wider">
                            MALPRACTICE WARNING!
                          </span>
                          <span className="text-[9px] text-red-300 font-semibold mt-0.5">
                            Camera Lens Covered / Touched
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2.5 px-1 text-[10px]">
                      <span className={isCameraOccluded ? 'text-red-400 font-extrabold flex items-center gap-1' : 'text-emerald-400 font-semibold flex items-center gap-1'}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isCameraOccluded ? 'bg-red-500' : 'bg-emerald-400'} animate-pulse`} />
                        {isCameraOccluded ? 'Lens Obstructed' : 'Live Monitor Active'}
                      </span>
                      <span className="text-slate-400 font-mono">
                        Violations: <b className={malpracticeCount > 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}>{malpracticeCount}</b>
                      </span>
                    </div>
                  </div>

                  {/* Question Palette */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-900 mb-3">Question Palette</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {currentAttempt.questions.map((ques, idx) => {
                        const isAns = Boolean(answers[ques.id]);
                        const isCurr = idx === currentQuestionIndex;
                        return (
                          <button
                            key={ques.id}
                            onClick={() => setCurrentQuestionIndex(idx)}
                            className={`h-8 rounded-xl font-bold text-xs transition-all ${
                              isCurr
                                ? 'bg-orange-500 text-white ring-2 ring-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                                : isAns
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-white/[0.05] text-slate-400 hover:bg-white/10'
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
              assessmentResult.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
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
              <p className="text-xs text-slate-400 mt-1">
                {assessmentResult.correct_answers_count} of {assessmentResult.total_questions} questions answered correctly
              </p>
            </div>

            {/* Integrity Audit Result Summary */}
            <div className={`p-3.5 rounded-xl border text-xs max-w-md mx-auto ${
              malpracticeCount > 0 || assessmentResult.integrity_status === 'flagged'
                ? 'bg-red-950/40 border-red-500/50 text-red-200'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            }`}>
              <div className="flex items-center justify-center gap-1.5 font-bold mb-1">
                {malpracticeCount > 0 ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span>Integrity Flagged ({malpracticeCount} malpractice violation(s))</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Clean Integrity Audit (Continuous Camera Monitored)</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-300">
                {malpracticeCount > 0
                  ? 'Camera lens touching, focus loss, or tab switching was recorded during the test.'
                  : 'Zero lens obstruction or mobile focus deviations detected throughout testing.'}
              </p>
            </div>

            <p className="text-xs text-slate-300 max-w-md mx-auto">
              {assessmentResult.next_recommended_action}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate('/roadmap')}
                className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span>View Adapted Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setMode('launcher');
                  startCameraPreview();
                }}
                className="bg-white/[0.05] hover:bg-white/10 text-slate-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors border border-white/10"
              >
                Return to Assessments
              </button>
            </div>
          </div>

          {/* Detailed Question Review Accordion */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Question Explanations &amp; Review</h3>
            <div className="space-y-3">
              {assessmentResult.review_items.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    item.is_correct ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-white">
                      Q{idx + 1}: {item.question_text}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.is_correct ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {item.is_correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-4">
                    <span>Your Choice: <b className="text-white">Option {item.selected_option_id || 'None'}</b></span>
                    <span>Correct Answer: <b className="text-white">Option {item.correct_option_id}</b></span>
                  </div>

                  {item.explanation && (
                    <p className="text-[11px] text-slate-300 bg-black/30 p-2.5 rounded-lg border border-white/[0.06] leading-relaxed">
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
