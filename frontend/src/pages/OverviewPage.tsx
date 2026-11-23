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
      {/* Top Banner with Pinterest-inspired Celestial Obsidian Glow */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-orange-950/60 via-[#121625] to-[#0c101b] border border-orange-500/30 text-white shadow-[0_0_35px_rgba(249,115,22,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-b from-orange-500/15 to-transparent blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-semibold mb-3 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Target Role: {user?.target_job_role || 'Full-Stack Developer'}</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Welcome, {user?.full_name || 'Student'}!
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1.5 max-w-xl leading-relaxed">
            You're scheduled for {user?.available_hours_per_week || 14} hours/week over {user?.target_timeline_weeks || 16} weeks. Keep building your verifiable portfolio milestones!
          </p>
        </div>
        <div className="flex items-center gap-2 self-stretch md:self-auto relative z-10">
          <button
            onClick={() => navigate('/roadmap')}
            className="flex-1 md:flex-initial bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 hover:from-orange-500 hover:via-amber-400 text-white font-semibold px-5 py-3 rounded-xl text-xs shadow-lg shadow-orange-500/30 border border-orange-400/40 transition-all flex items-center justify-center gap-2"
          >
            <span>View Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0c101b]/80 backdrop-blur-xl border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Roadmap Progress</span>
            <Target className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {roadmap?.overall_progress_percentage || 0}%
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${roadmap?.overall_progress_percentage || 0}%` }}
            />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0c101b]/80 backdrop-blur-xl border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Tasks Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {completedTasksCount} / {totalTasksCount}
          </div>
          <p className="text-[11px] text-amber-400/90 mt-2 font-medium">
            {totalTasksCount - completedTasksCount} pending milestones
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0c101b]/80 backdrop-blur-xl border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Weekly Study Target</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {user?.available_hours_per_week || 14}h / wk
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            ~{Math.round((user?.available_hours_per_week || 14) / 7)} hours per day
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0c101b]/80 backdrop-blur-xl border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Overall Match</span>
            <TrendingUp className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-orange-400">
            {gapReport?.overall_match_percentage || 50}%
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Based on verified diagnostic evidence
          </p>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Next Recommended Task & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Recommended Task Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#0c101b]/80 backdrop-blur-xl border border-white/[0.08] shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-xs shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                  <Map className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Next Recommended Action</h2>
                  <p className="text-[11px] text-slate-400">Prerequisite-unlocked priority learning task</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 uppercase">
                {nextTask?.status || 'Active'}
              </span>
            </div>

            {nextTask ? (
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-semibold text-orange-400/90 uppercase tracking-wider">
                      Stage {nextTask.stage_number}: {nextTask.stage_title}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">{nextTask.title}</h3>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-slate-300 bg-white/[0.06] border border-white/[0.08] px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    <span>{nextTask.estimated_hours}h</span>
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {nextTask.description}
                </p>

                {nextTask.recommendation_reason && (
                  <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-200 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <span><b>Why this now:</b> {nextTask.recommendation_reason}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => navigate('/roadmap')}
                    className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 hover:from-orange-500 hover:via-amber-400 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-orange-500/25 transition-all flex items-center gap-1.5"
                  >
                    <span>Resume Learning</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => navigate('/planner')}
                    className="bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-xs border border-white/[0.1] transition-colors flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>View in Weekly Planner</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-white">All current stage tasks completed!</p>
                <p className="text-xs text-slate-400 mt-1">Check your roadmap or claim eligible certificates.</p>
              </div>
            )}
          </div>

          {/* Quick Modules Shortcuts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              to="/assessments"
              className="p-3.5 rounded-2xl bg-[#0c101b]/80 backdrop-blur-xl border border-white/[0.08] shadow-sm hover:border-orange-500/40 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all text-center group"
            >
              <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/25 text-orange-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                <Target className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white">Diagnostic</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Assess Skills</p>
            </Link>

            <Link
              to="/skill-gap"
              className="p-3.5 rounded-2xl bg-[#0c101b]/80 backdrop-blur-xl border border-white/[0.08] shadow-sm hover:border-orange-500/40 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all text-center group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white">Skill Gaps</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Radar Analysis</p>
            </Link>

            <Link
              to="/projects"
              className="p-3.5 rounded-2xl bg-[#0c101b]/80 backdrop-blur-xl border border-white/[0.08] shadow-sm hover:border-orange-500/40 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all text-center group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white">Projects</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Portfolio Proof</p>
            </Link>

            <Link
              to="/certificates"
              className="p-3.5 rounded-2xl bg-[#0c101b]/80 backdrop-blur-xl border border-white/[0.08] shadow-sm hover:border-orange-500/40 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all text-center group"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                <Award className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white">Certificates</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Verifiable PDF</p>
            </Link>
          </div>
        </div>

        {/* Right Column: Skill Radar Chart */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#0c101b]/80 backdrop-blur-xl border border-white/[0.08] shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
            <div>
              <h2 className="text-sm font-bold text-white">Skill Mastery Radar</h2>
              <p className="text-[11px] text-slate-400">Current vs Target Proficiency</p>
            </div>
            <Link to="/skill-gap" className="text-xs text-orange-400 hover:text-orange-300 hover:underline font-semibold">
              Full Report
            </Link>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.12)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: '#cbd5e1' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="rgba(255,255,255,0.08)" tick={{ fontSize: 9, fill: '#64748b' }} />
                  <Radar name="Current" dataKey="current" stroke="#f97316" fill="#f97316" fillOpacity={0.4} />
                  <Radar name="Target" dataKey="target" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400">
                Complete a diagnostic assessment to generate your skill radar.
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-center gap-6 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)]" />
              <span>Current Level</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-sky-400/60" />
              <span>Target Level</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
