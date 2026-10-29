import React, { useState, useEffect } from 'react';
import {
  Users, CheckCircle2, MessageSquare, ExternalLink, ArrowRight,
  ShieldCheck, AlertCircle, FileText
} from 'lucide-react';
import { api } from '../services/api';

export const MentorPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review project submission modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [feedback, setFeedback] = useState('');
  const [submissionId, setSubmissionId] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await api.getMentorStudents();
      setStudents(data);
    } catch (err) {
      console.warn('Failed to load mentor students', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionId) return;
    try {
      await api.reviewProject(submissionId, reviewStatus, feedback);
      alert('Review feedback recorded!');
      setReviewModalOpen(false);
      setFeedback('');
    } catch (err: any) {
      alert(err.message || 'Review failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          Mentor & Faculty Oversight
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review students who have explicitly shared their progress, inspect milestones, and approve project deliverables.
        </p>
      </div>

      {/* Shared Students Grid */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Assigned & Shared Students ({students.length})</h2>
          </div>
        </div>

        {students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((st) => (
              <div key={st.share_id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{st.student_name}</h3>
                    <p className="text-slate-500 text-[11px]">{st.student_email}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                    {st.target_career}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Roadmap Progress:</span>
                    <span className="font-bold text-slate-900">{st.roadmap_progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${st.roadmap_progress}%` }} />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Assessments Completed: <b>{st.assessments_completed}</b>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
            No students have shared their roadmap with your account yet. Have students input your email in their Profile &gt; Faculty Sharing section.
          </div>
        )}
      </div>
    </div>
  );
};
