import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass, Target, Map, Calendar, Award, ArrowRight, CheckCircle2,
  Clock, Sparkles, BookOpen, AlertCircle, TrendingUp
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Roadmap, SkillGapReport, RoadmapTask } from '../types';

export const OverviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [gapReport, setGapReport] = useState<SkillGapReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [r, g] = await Promise.all([
          api.getCurrentRoadmap(),
          api.getGapReport(),
        ]);
        setRoadmap(r);
        setGapReport(g);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const nextTask: RoadmapTask | undefined = roadmap?.tasks?.find(
    (t) => t.status === 'in_progress' || t.status === 'available'
  );

  const completedTasksCount = roadmap?.tasks?.filter((t) => t.status === 'completed').length || 0;
  const totalTasksCount = roadmap?.tasks?.length || 0;

  // Prepare radar chart data
  const radarData = (gapReport?.recommended_priority_skills || gapReport?.strong_skills || [])
    .slice(0, 6)
    .map((s) => ({
      skill: s.skill_name.length > 12 ? s.skill_name.substring(0, 10) + '..' : s.skill_name,
      current: s.current_proficiency,
      target: s.target_proficiency,
    }));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-blue-100 text-[11px] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Target Role: {user?.target_job_role || 'Full-Stack Developer'}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.full_name || 'Student'}!
          </h1>
          <p className="text-xs md:text-sm text-blue-100 mt-1 max-w-xl">
            You're scheduled for {user?.available_hours_per_week || 14} hours/week over {user?.target_timeline_weeks || 16} weeks. Keep building your verifiable portfolio milestones!
          </p>
        </div>
        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={() => navigate('/roadmap')}
            className="flex-1 md:flex-initial bg-white text-blue-700 hover:bg-blue-50 font-semibold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Roadmap Progress</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {roadmap?.overall_progress_percentage || 0}%
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${roadmap?.overall_progress_percentage || 0}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tasks Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {completedTasksCount} / {totalTasksCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {totalTasksCount - completedTasksCount} pending milestones
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Weekly Study Target</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {user?.available_hours_per_week || 14}h / wk
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            ~{Math.round((user?.available_hours_per_week || 14) / 7)} hours per day
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Overall Match</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {gapReport?.overall_match_percentage || 50}%
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Based on verified diagnostic evidence
          </p>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Next Recommended Task & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Recommended Task Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  <Map className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Next Recommended Action</h2>
                  <p className="text-[11px] text-slate-500">Prerequisite-unlocked priority learning task</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 uppercase">
                {nextTask?.status || 'Active'}
              </span>
            </div>

            {nextTask ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Stage {nextTask.stage_number}: {nextTask.stage_title}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{nextTask.title}</h3>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{nextTask.estimated_hours}h</span>
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {nextTask.description}
                </p>

                {nextTask.recommendation_reason && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><b>Why this now:</b> {nextTask.recommendation_reason}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => navigate('/roadmap')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <span>Resume Learning</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => navigate('/planner')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>View in Weekly Planner</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-900">All current stage tasks completed!</p>
                <p className="text-xs text-slate-500 mt-1">Check your roadmap or claim eligible certificates.</p>
              </div>
            )}
          </div>

          {/* Quick Modules Shortcuts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              to="/assessments"
              className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-center group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                <Target className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900">Diagnostic</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Assess Skills</p>
            </Link>

            <Link
              to="/skill-gap"
              className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-center group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900">Skill Gaps</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Radar Analysis</p>
            </Link>

            <Link
              to="/projects"
              className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-center group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900">Projects</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Portfolio Proof</p>
            </Link>

            <Link
              to="/certificates"
              className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-center group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                <Award className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900">Certificates</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Verifiable PDF</p>
            </Link>
          </div>
        </div>

        {/* Right Column: Skill Radar Chart */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Skill Mastery Radar</h2>
              <p className="text-[11px] text-slate-500">Current vs Target Proficiency</p>
            </div>
            <Link to="/skill-gap" className="text-xs text-blue-600 hover:underline font-semibold">
              Full Report
            </Link>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 9 }} />
                  <Radar name="Current" dataKey="current" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.4} />
                  <Radar name="Target" dataKey="target" stroke="#93c5fd" fill="#93c5fd" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400">
                Complete a diagnostic assessment to generate your skill radar.
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-center gap-6 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600" />
              <span>Current Level</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-200" />
              <span>Target Level</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
