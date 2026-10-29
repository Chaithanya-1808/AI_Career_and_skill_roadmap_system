import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target, TrendingUp, CheckCircle2, AlertTriangle, AlertCircle,
  HelpCircle, ArrowRight, Clock, Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import { SkillGapReport, SkillGapItem } from '../types';

export const SkillGapPage: React.FC = () => {
  const navigate = useNavigate();
  const [gapReport, setGapReport] = useState<SkillGapReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGap() {
      try {
        const data = await api.getGapReport();
        setGapReport(data);
      } catch (err) {
        console.error('Failed to load skill gap report', err);
      } finally {
        setLoading(false);
      }
    }
    loadGap();
  }, []);

  if (loading || !gapReport) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 text-xs">
        Loading skill gap analysis...
      </div>
    );
  }

  // Bar chart data
  const barData = [
    ...gapReport.skills_needing_attention,
    ...gapReport.developing_skills,
    ...gapReport.strong_skills,
  ].map((s) => ({
    name: s.skill_name.length > 15 ? s.skill_name.substring(0, 13) + '..' : s.skill_name,
    Current: s.current_proficiency,
    Target: s.target_proficiency,
    Gap: s.gap,
  }));

  // Radar chart data
  const radarData = barData.map((b) => ({
    skill: b.name,
    current: b.Current,
    target: b.Target,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Skill-Gap Analysis Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Target Role: <b className="text-slate-800">{gapReport.target_career_title}</b> • Evaluated via Formula: <code className="bg-slate-100 px-1 rounded">Gap = Target − Current Proficiency</code>
          </p>
        </div>
        <button
          onClick={() => navigate('/roadmap')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
        >
          <span>Bridge Gaps in Roadmap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Categorized Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold mb-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Strong Skills ({gapReport.strong_skills.length})</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">Gap ≤ 0.5 • Ready for production</p>
          <div className="flex flex-wrap gap-1">
            {gapReport.strong_skills.map((s) => (
              <span key={s.skill_id} className="bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-200/60">
                {s.skill_name}
              </span>
            ))}
            {gapReport.strong_skills.length === 0 && <span className="text-[11px] text-slate-400">None yet</span>}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 text-blue-700 text-xs font-bold mb-1.5">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Developing ({gapReport.developing_skills.length})</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">Gap ≤ 1.5 • Moderate familiarity</p>
          <div className="flex flex-wrap gap-1">
            {gapReport.developing_skills.map((s) => (
              <span key={s.skill_id} className="bg-blue-50 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-200/60">
                {s.skill_name}
              </span>
            ))}
            {gapReport.developing_skills.length === 0 && <span className="text-[11px] text-slate-400">None yet</span>}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 text-amber-700 text-xs font-bold mb-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Attention Needed ({gapReport.skills_needing_attention.length})</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">Gap &gt; 1.5 • Priority focus</p>
          <div className="flex flex-wrap gap-1">
            {gapReport.skills_needing_attention.map((s) => (
              <span key={s.skill_id} className="bg-amber-50 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-amber-200/60">
                {s.skill_name}
              </span>
            ))}
            {gapReport.skills_needing_attention.length === 0 && <span className="text-[11px] text-slate-400">None</span>}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700 text-xs font-bold mb-1.5">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>Unassessed ({gapReport.unassessed_skills.length})</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">No verified assessment evidence</p>
          <div className="flex flex-wrap gap-1">
            {gapReport.unassessed_skills.map((s) => (
              <span key={s.skill_id} className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded">
                {s.skill_name}
              </span>
            ))}
            {gapReport.unassessed_skills.length === 0 && <span className="text-[11px] text-slate-400">All assessed!</span>}
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart of Gaps */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-1">Current vs Target Proficiency</h3>
          <p className="text-[11px] text-slate-500 mb-4">Scale: 1.0 (Novice) to 5.0 (Industry Master)</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" interval={0} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="Current" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Target" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-1">Proficiency Radar Coverage</h3>
          <p className="text-[11px] text-slate-500 mb-4">Competency perimeter vs target role</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 9, fill: '#64748b' }} />
                <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 9 }} />
                <Radar name="Current" dataKey="current" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.4} />
                <Radar name="Target" dataKey="target" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Priority Action Table */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recommended Priority Skill Bridges</h3>
            <p className="text-[11px] text-slate-500">
              Total estimated learning effort: ~<b>{gapReport.total_estimated_study_hours} hours</b>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                <th className="py-2.5 px-3 text-left">Skill</th>
                <th className="py-2.5 px-3 text-center">Current</th>
                <th className="py-2.5 px-3 text-center">Target</th>
                <th className="py-2.5 px-3 text-center">Gap Size</th>
                <th className="py-2.5 px-3 text-center">Confidence</th>
                <th className="py-2.5 px-3 text-center">Estimated Effort</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gapReport.recommended_priority_skills.map((item) => (
                <tr key={item.skill_id}>
                  <td className="py-3 px-3 font-semibold text-slate-900">{item.skill_name}</td>
                  <td className="py-3 px-3 text-center text-slate-700">{item.current_proficiency}</td>
                  <td className="py-3 px-3 text-center text-slate-700">{item.target_proficiency}</td>
                  <td className="py-3 px-3 text-center font-bold text-amber-600">+{item.gap}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {item.confidence}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-medium text-slate-700 flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.estimated_study_hours} hrs</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
