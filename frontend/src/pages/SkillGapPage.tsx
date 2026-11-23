import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target, TrendingUp, CheckCircle2, AlertTriangle, AlertCircle,
  HelpCircle, ArrowRight, Clock, Sparkles, Compass, BookOpen,
  ShieldCheck, BarChart3, Layers
} from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { api } from '../services/api';
import { SkillGapReport, SkillGapItem, CareerSummary } from '../types';

export const SkillGapPage: React.FC = () => {
  const navigate = useNavigate();
  const [careers, setCareers] = useState<CareerSummary[]>([]);
  const [selectedCareerId, setSelectedCareerId] = useState<string>('full-stack-developer');
  const [gapReport, setGapReport] = useState<SkillGapReport | null>(null);
  const [loading, setLoading] = useState(true);

  // Load available careers on initial mount
  useEffect(() => {
    async function loadCareers() {
      try {
        const list = await api.getCareers();
        setCareers(list);
      } catch (err) {
        console.warn('Failed to load career list', err);
      }
    }
    loadCareers();
  }, []);

  // Load gap report whenever selected career changes
  useEffect(() => {
    async function loadGap() {
      setLoading(true);
      try {
        const data = await api.getGapReport(selectedCareerId);
        setGapReport(data);
      } catch (err) {
        console.error('Failed to load skill gap report', err);
      } finally {
        setLoading(false);
      }
    }
    loadGap();
  }, [selectedCareerId]);

  if (loading && !gapReport) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-500 text-xs">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <span>Evaluating multi-dimensional skill gaps...</span>
      </div>
    );
  }

  // Combine ALL skills so visualizations are never empty
  const allSkills: SkillGapItem[] = gapReport ? [
    ...gapReport.strong_skills,
    ...gapReport.developing_skills,
    ...gapReport.skills_needing_attention,
    ...gapReport.unassessed_skills,
  ] : [];

  // Bar chart data
  const barData = allSkills.map((s) => ({
    name: s.skill_name.length > 15 ? s.skill_name.substring(0, 13) + '..' : s.skill_name,
    fullName: s.skill_name,
    Current: s.current_proficiency,
    Target: s.target_proficiency,
    Gap: s.gap,
    Confidence: s.confidence,
  }));

  // Radar chart data
  const radarData = allSkills.map((s) => ({
    skill: s.skill_name.length > 13 ? s.skill_name.substring(0, 11) + '..' : s.skill_name,
    current: s.current_proficiency,
    target: s.target_proficiency,
  }));

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-950/60 via-[#121625] to-[#0c101b] border border-orange-500/30 text-white shadow-[0_0_35px_rgba(249,115,22,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-[11px] font-semibold mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Explainable Evaluation Model • Verified Diagnostic Metrics</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Skill-Gap Analysis Engine
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Target Role: <b className="text-white font-bold">{gapReport?.target_career_title}</b>. Compare your current verified competencies against production job expectations.
          </p>
        </div>

        {/* Career Selector Dropdown */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/15">
            <select
              value={selectedCareerId}
              onChange={(e) => setSelectedCareerId(e.target.value)}
              className="w-full sm:w-auto bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {careers.length > 0 ? (
                careers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.title}
                  </option>
                ))
              ) : (
                <>
                  <option value="full-stack-developer">Full-Stack Developer</option>
                  <option value="software-developer">Software Developer</option>
                  <option value="ai-ml-engineer">AI/ML Engineer</option>
                  <option value="data-scientist">Data Scientist</option>
                  <option value="cybersecurity-analyst">Cybersecurity Analyst</option>
                  <option value="cloud-engineer">Cloud Engineer</option>
                </>
              )}
            </select>
          </div>

          <button
            onClick={() => navigate('/roadmap')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Bridge Gaps in Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Role Match Summary & Formula Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-500">Overall Match</span>
              <span className="font-bold text-blue-600 text-sm">{gapReport?.overall_match_percentage || 0}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-600 to-amber-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]"
                style={{ width: `${gapReport?.overall_match_percentage || 0}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Based on verified diagnostic evidence</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Estimated Study Effort</span>
            <span className="text-lg font-bold text-slate-900 mt-0.5 block">
              ~{gapReport?.total_estimated_study_hours || 0} Hours
            </span>
            <span className="text-[10px] text-slate-400 block">To bridge all target competencies</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Transparent Scoring Logic</span>
            <code className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded mt-1 inline-block">
              Gap = Target − Current
            </code>
            <span className="text-[10px] text-slate-400 block mt-1">Scores scale from 1.0 (Novice) to 5.0 (Master)</span>
          </div>
        </div>
      </div>

      {/* 4 Categorized Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Strong Skills */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-bold mb-1.5">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Strong Skills</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
              {gapReport?.strong_skills.length || 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">Gap ≤ 0.5 • Ready for production tasks</p>
          <div className="flex flex-wrap gap-1.5 min-h-[44px]">
            {gapReport?.strong_skills.map((s) => (
              <span
                key={s.skill_id}
                className="bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-emerald-200/60"
              >
                {s.skill_name}
              </span>
            ))}
            {(!gapReport?.strong_skills || gapReport.strong_skills.length === 0) && (
              <span className="text-[11px] text-slate-400 italic">None yet — pass assessments to qualify</span>
            )}
          </div>
        </div>

        {/* Developing Skills */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-blue-700 text-xs font-bold mb-1.5">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Developing</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px]">
              {gapReport?.developing_skills.length || 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">Gap ≤ 1.5 • Moderate familiarity</p>
          <div className="flex flex-wrap gap-1.5 min-h-[44px]">
            {gapReport?.developing_skills.map((s) => (
              <span
                key={s.skill_id}
                className="bg-blue-50 text-blue-800 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-blue-200/60"
              >
                {s.skill_name}
              </span>
            ))}
            {(!gapReport?.developing_skills || gapReport.developing_skills.length === 0) && (
              <span className="text-[11px] text-slate-400 italic">None currently developing</span>
            )}
          </div>
        </div>

        {/* Attention Needed */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between text-amber-700 text-xs font-bold mb-1.5">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Attention Needed</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
              {gapReport?.skills_needing_attention.length || 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">Gap &gt; 1.5 • Priority learning focus</p>
          <div className="flex flex-wrap gap-1.5 min-h-[44px]">
            {gapReport?.skills_needing_attention.map((s) => (
              <span
                key={s.skill_id}
                className="bg-amber-50 text-amber-800 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-amber-200/60"
              >
                {s.skill_name}
              </span>
            ))}
            {(!gapReport?.skills_needing_attention || gapReport.skills_needing_attention.length === 0) && (
              <span className="text-[11px] text-slate-400 italic">None critical</span>
            )}
          </div>
        </div>

        {/* Unassessed / Baseline Skills */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-700 text-xs font-bold mb-1.5">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>Unassessed Baseline</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
              {gapReport?.unassessed_skills.length || 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">Assigned 1.0 baseline proficiency</p>
          <div className="flex flex-wrap gap-1.5 min-h-[44px]">
            {gapReport?.unassessed_skills.map((s) => (
              <span
                key={s.skill_id}
                className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2.5 py-1 rounded-lg border border-slate-200"
              >
                {s.skill_name}
              </span>
            ))}
            {(!gapReport?.unassessed_skills || gapReport.unassessed_skills.length === 0) && (
              <span className="text-[11px] text-slate-400 italic">All skills assessed!</span>
            )}
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Current vs Target Proficiency */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-orange-400" />
                <span>Current vs Target Proficiency</span>
              </h3>
              <p className="text-[11px] text-slate-500">Scale: 1.0 (Novice) to 5.0 (Industry Master)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-orange-500 inline-block" /> Current Level
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-slate-600 inline-block" /> Target Level
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 15, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#cbd5e1' }} angle={-25} textAnchor="end" interval={0} stroke="rgba(255,255,255,0.15)" />
                <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: '#cbd5e1' }} stroke="rgba(255,255,255,0.15)" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-[#0c101b] border border-orange-500/30 text-white rounded-xl text-xs shadow-xl space-y-1">
                          <p className="font-bold text-orange-400">{data.fullName}</p>
                          <p>Current Level: <b className="text-white">{data.Current} / 5.0</b></p>
                          <p>Target Level: <b className="text-white">{data.Target} / 5.0</b></p>
                          <p>Skill Gap: <b className="text-amber-300">+{data.Gap}</b></p>
                          <p className="text-[10px] text-slate-400">Confidence: {data.Confidence}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="Current" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Target" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart: Proficiency Coverage */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-400" />
                <span>Proficiency Radar Coverage</span>
              </h3>
              <p className="text-[11px] text-slate-500">Competency perimeter vs target role benchmark</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.12)" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 9, fill: '#cbd5e1' }} />
                <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 9, fill: '#94a3b8' }} stroke="rgba(255,255,255,0.15)" />
                <Radar name="Current Proficiency" dataKey="current" stroke="#f97316" fill="#f97316" fillOpacity={0.4} />
                <Radar name="Target Expectation" dataKey="target" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comprehensive Skill Gap Breakdown Table */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Detailed Skill Gap Matrix & Action Bridges</h3>
            <p className="text-[11px] text-slate-500">
              Evaluated for <b>{gapReport?.target_career_title}</b>. Take assessments to verify and close each gap.
            </p>
          </div>
          <button
            onClick={() => navigate('/assessments')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors flex items-center gap-1.5"
          >
            <span>Take Diagnostic Assessment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3 text-left">Skill Name</th>
                <th className="py-2.5 px-3 text-left">Proficiency Progress</th>
                <th className="py-2.5 px-3 text-center">Current</th>
                <th className="py-2.5 px-3 text-center">Target</th>
                <th className="py-2.5 px-3 text-center">Gap Size</th>
                <th className="py-2.5 px-3 text-center">Confidence</th>
                <th className="py-2.5 px-3 text-center">Est. Effort</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allSkills.map((item) => {
                const percent = Math.min(100, Math.round((item.current_proficiency / item.target_proficiency) * 100));
                return (
                  <tr key={item.skill_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">{item.skill_name}</td>
                    <td className="py-3 px-3 w-44">
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            item.gap <= 0.5 ? 'bg-emerald-500' : item.gap <= 1.5 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">{percent}% of target achieved</span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">{item.current_proficiency}</td>
                    <td className="py-3 px-3 text-center text-slate-500">{item.target_proficiency}</td>
                    <td className="py-3 px-3 text-center font-bold">
                      {item.gap <= 0.5 ? (
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] border border-emerald-200">
                          Ready
                        </span>
                      ) : (
                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-[11px] border border-amber-200">
                          +{item.gap}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.confidence === 'high' ? 'bg-emerald-100 text-emerald-800' :
                        item.confidence === 'medium' ? 'bg-blue-100 text-blue-800' :
                        item.confidence === 'self-reported' ? 'bg-purple-100 text-purple-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {item.confidence}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-700">
                      <div className="inline-flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.estimated_study_hours} hrs</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => navigate('/assessments')}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Assess
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
