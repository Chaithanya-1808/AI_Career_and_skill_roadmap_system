import React, { useState, useEffect } from 'react';
import {
  FolderGit2, ExternalLink, CheckCircle2, Clock, AlertCircle,
  FileCode, Send, MessageSquare, BookOpen, Star
} from 'lucide-react';
import { api } from '../services/api';
import { Project, ProjectSubmission } from '../types';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Submit Modal
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [p, s] = await Promise.all([
        api.getProjects(),
        api.getMySubmissions(),
      ]);
      setProjects(p);
      setSubmissions(s);
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    if (!repoUrl.includes('github.com')) {
      alert('Please enter a valid GitHub repository URL.');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitProject({
        project_id: selectedProject.id,
        repository_url: repoUrl,
        live_demo_url: demoUrl,
        submission_notes: notes,
      });
      alert('Project submitted for mentor/faculty evaluation!');
      setSelectedProject(null);
      setRepoUrl('');
      setDemoUrl('');
      setNotes('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getSubmissionForProject = (projectId: string) => {
    return submissions.find((s) => s.project_id === projectId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          Practical Projects & Portfolio
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Reinforce theoretical knowledge through verifiable GitHub deliverables and mentor-reviewed milestones.
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.map((proj) => {
          const sub = getSubmissionForProject(proj.id);
          const isApproved = sub?.status === 'approved';
          const isPending = sub?.status === 'pending';

          return (
            <div
              key={proj.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                    {proj.level} Level
                  </span>
                  {sub ? (
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isPending
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sub.status.replace('_', ' ')}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-semibold">Not Submitted</span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-1.5">{proj.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {proj.problem_statement}
                </p>

                {/* Required Skills */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {proj.required_skills.map((s, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Rubric Points */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-1">
                  <span className="font-bold text-slate-800 block text-[11px] mb-1">Evaluation Rubric:</span>
                  {proj.rubric.map((r, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>• {r.criterion}</span>
                      <span className="font-semibold">{r.points} pts</span>
                    </div>
                  ))}
                </div>

                {/* Feedback Display if available */}
                {sub?.reviewer_feedback && (
                  <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                    <span className="font-bold block mb-0.5">Faculty Feedback:</span>
                    <span>{sub.reviewer_feedback}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {sub?.repository_url ? (
                  <a
                    href={sub.repository_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>View Repository</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">Ready to build</span>
                )}

                <button
                  onClick={() => setSelectedProject(proj)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sub ? 'Update Submission' : 'Submit Deliverable'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submission Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 relative">
            <h3 className="text-base font-bold text-slate-900 mb-1">Submit Deliverable</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedProject.title}</p>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Public GitHub Repository URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/username/project-repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Live Deployed URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://project.vercel.app"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Implementation Notes & Self-Evaluation
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your architecture, challenges resolved, and how test criteria were satisfied."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="px-3.5 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl shadow-sm transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
