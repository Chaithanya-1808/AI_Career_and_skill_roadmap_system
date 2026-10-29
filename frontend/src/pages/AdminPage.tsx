import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Users, Award, Target, FolderGit2, AlertTriangle,
  CheckCircle2, RefreshCw, BarChart2
} from 'lucide-react';
import { api } from '../services/api';
import { AdminStats } from '../types';

export const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [flaggedAttempts, setFlaggedAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [s, f] = await Promise.all([
        api.getAdminStats(),
        api.getFlaggedAssessments(),
      ]);
      setStats(s);
      setFlaggedAttempts(f);
    } catch (err) {
      console.error('Failed to load admin metrics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewFlag = async (attemptId: string, action: 'reviewed' | 'clean') => {
    try {
      await api.markIntegrityReviewed(attemptId, action);
      alert(`Attempt marked as ${action}!`);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 text-xs">
        Loading platform administrator audit metrics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          System Administration & Audit
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Aggregated student telemetry, examination integrity review, and system-wide analytics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Students</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.total_students}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Assessments</span>
          <p className="text-xl font-bold text-blue-600 mt-1">{stats.total_assessments_taken}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Roadmaps</span>
          <p className="text-xl font-bold text-indigo-600 mt-1">{stats.total_roadmaps_generated}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Projects</span>
          <p className="text-xl font-bold text-emerald-600 mt-1">{stats.total_projects_submitted}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Certificates</span>
          <p className="text-xl font-bold text-amber-600 mt-1">{stats.total_certificates_issued}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Flagged</span>
          <p className="text-xl font-bold text-red-600 mt-1">{stats.integrity_flagged_count}</p>
        </div>
      </div>

      {/* Flagged Assessments Table */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <h2 className="text-base font-bold text-slate-900">
            Assessment Integrity Review Flags ({flaggedAttempts.length})
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Assessments flagged due to exceeding window-blur or tab-switch thresholds. Review notes before making determinations.
        </p>

        {flaggedAttempts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                  <th className="py-2.5 px-3 text-left">Student</th>
                  <th className="py-2.5 px-3 text-left">Assessment Title</th>
                  <th className="py-2.5 px-3 text-center">Score</th>
                  <th className="py-2.5 px-3 text-left">Signals Logged</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {flaggedAttempts.map((f) => (
                  <tr key={f.attempt_id}>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{f.student_name}</span>
                      <span className="text-[10px] text-slate-500">{f.student_email}</span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">{f.assessment_title}</td>
                    <td className="py-3 px-3 text-center font-bold text-blue-600">
                      {f.score_percentage !== null ? `${f.score_percentage}%` : '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px]">
                      {f.integrity_summary?.tab_switches || 0} tab switches • {f.integrity_summary?.window_blurs || 0} window blurs
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => handleReviewFlag(f.attempt_id, 'clean')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleReviewFlag(f.attempt_id, 'reviewed')}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px]"
                      >
                        Mark Reviewed
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
            No active integrity violations or review flags logged.
          </div>
        )}
      </div>
    </div>
  );
};
