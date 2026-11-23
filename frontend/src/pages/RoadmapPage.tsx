import React, { useState, useEffect } from 'react';
import {
  Map, CheckCircle2, Lock, PlayCircle, Clock, Sparkles, BookOpen,
  ArrowRight, RefreshCw, ChevronDown, ChevronRight, AlertCircle, ExternalLink,
  Layers, CheckSquare
} from 'lucide-react';
import { api } from '../services/api';
import { Roadmap, RoadmapTask } from '../types';
import { useAuth } from '../context/AuthContext';

export const RoadmapPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<RoadmapTask | null>(null);

  // Task Completion Modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [taskHoursSpent, setTaskHoursSpent] = useState<number>(5);
  const [taskEvidenceNotes, setTaskEvidenceNotes] = useState('');
  const [submittingTask, setSubmittingTask] = useState(false);

  // Adapt Roadmap Modal state
  const [showAdaptModal, setShowAdaptModal] = useState(false);
  const [newHours, setNewHours] = useState(user?.available_hours_per_week || 14);
  const [newTimeline, setNewTimeline] = useState(user?.target_timeline_weeks || 16);
  const [adaptReason, setAdaptReason] = useState('Adjusting weekly study pace based on semester schedule');
  const [adapting, setAdapting] = useState(false);

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    try {
      const data = await api.getCurrentRoadmap();
      setRoadmap(data);
      if (data.tasks.length > 0 && !selectedTask) {
        const firstActive = data.tasks.find((t) => t.status === 'in_progress' || t.status === 'available') || data.tasks[0];
        setSelectedTask(firstActive);
      }
    } catch (err) {
      console.error('Failed to load roadmap', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const updated = await api.updateTaskStatus(taskId, newStatus);
      setRoadmap(updated);
      setSelectedTask(updated.tasks.find((t) => t.id === taskId) || null);
    } catch (err: any) {
      alert(err.message || 'Failed to update task status');
    }
  };

  const handleConfirmCompletion = async () => {
    if (!selectedTask) return;
    setSubmittingTask(true);
    try {
      const updated = await api.updateTaskStatus(
        selectedTask.id,
        'completed',
        taskHoursSpent,
        taskEvidenceNotes
      );
      setRoadmap(updated);
      setSelectedTask(updated.tasks.find((t) => t.id === selectedTask.id) || null);
      setShowCompleteModal(false);
      setTaskEvidenceNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to complete task');
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleAdaptRoadmap = async () => {
    setAdapting(true);
    try {
      const updated = await api.adaptRoadmap({
        new_available_hours_per_week: newHours,
        new_target_timeline_weeks: newTimeline,
        adaptation_reason: adaptReason,
      });
      setRoadmap(updated);
      updateUser({ available_hours_per_week: newHours, target_timeline_weeks: newTimeline });
      setShowAdaptModal(false);
      alert('Roadmap successfully adapted to your updated schedule!');
    } catch (err: any) {
      alert(err.message || 'Failed to adapt roadmap');
    } finally {
      setAdapting(false);
    }
  };

  if (loading || !roadmap) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 text-xs">
        Loading personalized roadmap...
      </div>
    );
  }

  // Group tasks by stage
  const stages: { stage_number: number; stage_title: string; tasks: RoadmapTask[] }[] = [];
  roadmap.tasks.forEach((task) => {
    let stage = stages.find((s) => s.stage_number === task.stage_number);
    if (!stage) {
      stage = {
        stage_number: task.stage_number,
        stage_title: task.stage_title,
        tasks: [],
      };
      stages.push(stage);
    }
    stage.tasks.push(task);
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
              {roadmap.career_title || 'Full-Stack Developer'}
            </span>
            {roadmap.is_fallback ? (
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                <span>Deterministic Rule Engine</span>
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded flex items-center gap-1 border border-indigo-200/60">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>{roadmap.ai_model_used || 'Google Gemini AI'}</span>
              </span>
            )}
            {roadmap.adaptation_count > 0 && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                v{roadmap.adaptation_count + 1} Adapted
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            {roadmap.title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {roadmap.total_stages} Stages • ~{roadmap.total_hours} Total Study Hours • {roadmap.estimated_weeks} Weeks Schedule
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={() => setShowAdaptModal(true)}
            className="flex-1 md:flex-initial bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3.5 py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Adapt Schedule</span>
          </button>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-slate-700">Curriculum Completion Progress</span>
          <span className="text-blue-600 font-bold">{roadmap.overall_progress_percentage}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(249,115,22,0.4)]"
            style={{ width: `${roadmap.overall_progress_percentage}%` }}
          />
        </div>
      </div>

      {/* Main Two Column Roadmap View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stages & Task Nodes */}
        <div className="lg:col-span-7 space-y-5">
          {stages.map((stage) => {
            const completedInStage = stage.tasks.filter((t) => t.status === 'completed').length;
            const isStageDone = completedInStage === stage.tasks.length;

            return (
              <div
                key={stage.stage_number}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center ${
                        isStageDone
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {stage.stage_number}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{stage.stage_title}</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {completedInStage} / {stage.tasks.length} Completed
                  </span>
                </div>

                {/* Tasks in Stage */}
                <div className="space-y-2">
                  {stage.tasks.map((task) => {
                    const isSelected = selectedTask?.id === task.id;
                    const isLocked = task.status === 'locked';
                    const isCompleted = task.status === 'completed';
                    const isInProgress = task.status === 'in_progress';

                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                            : 'border-slate-200/70 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : isInProgress ? (
                            <PlayCircle className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                          ) : isLocked ? (
                            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-blue-600 shrink-0" />
                          )}

                          <div className="min-w-0">
                            <p
                              className={`font-semibold truncate ${
                                isCompleted
                                  ? 'text-slate-500 line-through'
                                  : isLocked
                                  ? 'text-slate-400'
                                  : 'text-slate-900'
                              }`}
                            >
                              {task.title}
                            </p>
                            <span className="text-[10px] text-slate-500 block truncate">
                              {task.skill_category} • ~{task.estimated_hours}h
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : isInProgress
                              ? 'bg-amber-100 text-amber-800'
                              : isLocked
                              ? 'bg-slate-100 text-slate-400'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Task Detail View */}
        <div className="lg:col-span-5">
          {selectedTask ? (
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm sticky top-20 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Task Details
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-0.5">{selectedTask.title}</h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 flex items-center gap-1 shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{selectedTask.estimated_hours} hrs</span>
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedTask.description}
              </p>

              {/* Learning Objectives Checklist */}
              {selectedTask.learning_objectives.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-2">Learning Objectives</h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {selectedTask.learning_objectives.map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Deliverable */}
              {selectedTask.deliverable && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                  <span className="font-bold text-slate-800 block mb-0.5">Tangible Milestone Deliverable:</span>
                  <span className="text-slate-600">{selectedTask.deliverable}</span>
                </div>
              )}

              {/* Recommended Curated Resources */}
              {selectedTask.resources.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-2">Curated Learning Resources</h4>
                  <div className="space-y-1.5">
                    {selectedTask.resources.map((res, idx) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-blue-600 flex items-center justify-between transition-colors"
                      >
                        <span className="truncate">{res.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Prerequisite status notice */}
              {selectedTask.prerequisite_task_ids.length > 0 && (
                <div className="text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Prerequisites: </span>
                  <span>{selectedTask.prerequisite_task_ids.join(', ')}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                {selectedTask.status === 'locked' && (
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-500 text-xs flex items-center gap-2">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>Locked: Complete prior prerequisite foundation tasks to unlock.</span>
                  </div>
                )}

                {selectedTask.status === 'available' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedTask.id, 'in_progress')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Start This Task (In Progress)</span>
                  </button>
                )}

                {selectedTask.status === 'in_progress' && (
                  <button
                    onClick={() => setShowCompleteModal(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Task & Unlock Next</span>
                  </button>
                )}

                {selectedTask.status === 'completed' && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Task Completed!</span>
                    </span>
                    <button
                      onClick={() => handleUpdateStatus(selectedTask.id, 'in_progress')}
                      className="text-[11px] text-slate-500 underline"
                    >
                      Reopen
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
              Select any task from the roadmap to review objectives and resources.
            </div>
          )}
        </div>
      </div>

      {/* Task Completion Modal */}
      {showCompleteModal && selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 relative">
            <h3 className="text-base font-bold text-slate-900 mb-1">Complete Task</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedTask.title}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Actual Study Hours Spent
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="40"
                  step="0.5"
                  value={taskHoursSpent}
                  onChange={(e) => setTaskHoursSpent(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Evidence Notes / Code Deliverable Link
                </label>
                <textarea
                  rows={3}
                  value={taskEvidenceNotes}
                  onChange={(e) => setTaskEvidenceNotes(e.target.value)}
                  placeholder="e.g. Completed semantic portfolio HTML layout and committed to GitHub."
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCompletion}
                  disabled={submittingTask}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 text-xs rounded-xl shadow-sm transition-colors"
                >
                  {submittingTask ? 'Saving...' : 'Verify & Mark Complete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adapt Roadmap Modal */}
      {showAdaptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 relative">
            <h3 className="text-base font-bold text-slate-900 mb-1">Adapt Learning Schedule</h3>
            <p className="text-xs text-slate-500 mb-4">
              Recalculate your weekly pace while preserving all completed work.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Available Study Hours Per Week
                </label>
                <input
                  type="number"
                  min="2"
                  max="60"
                  value={newHours}
                  onChange={(e) => setNewHours(parseInt(e.target.value) || 14)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  ~{Math.round(newHours / 7)} hours per day
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Timeline (Weeks)
                </label>
                <input
                  type="number"
                  min="4"
                  max="52"
                  value={newTimeline}
                  onChange={(e) => setNewTimeline(parseInt(e.target.value) || 16)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Adaptation
                </label>
                <input
                  type="text"
                  value={adaptReason}
                  onChange={(e) => setAdaptReason(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAdaptModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdaptRoadmap}
                  disabled={adapting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 text-xs rounded-xl shadow-sm transition-colors"
                >
                  {adapting ? 'Recalculating...' : 'Apply Adaptive Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

