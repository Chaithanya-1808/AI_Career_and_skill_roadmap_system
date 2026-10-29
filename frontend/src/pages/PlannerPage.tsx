import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, CheckCircle2, CheckSquare, Square, ArrowRight,
  Sparkles, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { WeeklyPlan, RoadmapTask } from '../types';

export const PlannerPage: React.FC = () => {
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      const data = await api.getWeeklyPlan();
      setWeeklyPlan(data);
    } catch (err) {
      console.error('Failed to load weekly plan', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (task: RoadmapTask) => {
    const newStatus = task.status === 'completed' ? 'in_progress' : 'completed';
    try {
      await api.updateTaskStatus(task.id, newStatus, newStatus === 'completed' ? task.estimated_hours : 0);
      loadPlan();
    } catch (err: any) {
      alert(err.message || 'Failed to update task status');
    }
  };

  if (loading || !weeklyPlan) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 text-xs">
        Loading weekly study planner...
      </div>
    );
  }

  const completionPct = weeklyPlan.scheduled_tasks_count > 0
    ? Math.round((weeklyPlan.completed_tasks_count / weeklyPlan.scheduled_tasks_count) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Weekly Study Planner
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Distributed daily study allocations tailored to your weekly availability budget.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/60">
            {weeklyPlan.weekly_target_hours} Hours Target
          </span>
        </div>
      </div>

      {/* Weekly Progress Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              Week {weeklyPlan.current_week} Milestone Pace
            </span>
            <span className="text-[11px] text-slate-500">
              {weeklyPlan.completed_tasks_count} of {weeklyPlan.scheduled_tasks_count} tasks completed ({completionPct}%)
            </span>
          </div>
        </div>

        <div className="w-full md:w-64 bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* 7 Days Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
        {weeklyPlan.days.map((day, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between min-h-[220px]"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                <span className="font-bold text-slate-900 text-xs">{day.day_name}</span>
                <span className="text-[10px] text-slate-500 font-semibold bg-slate-50 px-1.5 py-0.5 rounded">
                  {day.allocated_hours}h
                </span>
              </div>

              <div className="space-y-2">
                {day.tasks.map((task) => {
                  const isDone = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTaskCompletion(task)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        isDone
                          ? 'bg-emerald-50/50 border-emerald-200 text-slate-500'
                          : 'bg-white border-slate-200 hover:border-blue-300 text-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <p className={`font-semibold text-[11px] leading-tight ${isDone ? 'line-through text-slate-400' : ''}`}>
                            {task.title}
                          </p>
                          <span className="text-[9px] text-slate-400 block mt-1">
                            {task.skill_category} • {task.estimated_hours}h
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {day.tasks.length === 0 && (
                  <p className="text-[11px] text-slate-400 text-center py-6">
                    Rest or Review Buffer
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-400 text-center border-t border-slate-50">
              {day.tasks.filter((t) => t.status === 'completed').length} / {day.tasks.length} done
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
