import React, { useState, useEffect } from 'react';
import {
  User, Settings, Save, Users, Key, RotateCcw, CheckCircle2,
  Share2, Shield, Clock, BookOpen, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, demoLogin } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [qualification, setQualification] = useState(user?.qualification || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [currentSemester, setCurrentSemester] = useState(user?.current_semester || '');
  const [branch, setBranch] = useState(user?.branch || '');
  const [targetJobRole, setTargetJobRole] = useState(user?.target_job_role || 'Full-Stack Developer');
  const [weeklyHours, setWeeklyHours] = useState(user?.available_hours_per_week || 14);
  const [timelineWeeks, setTimelineWeeks] = useState(user?.target_timeline_weeks || 16);
  const [learningFormat, setLearningFormat] = useState(user?.preferred_learning_format || 'interactive');

  const [saving, setSaving] = useState(false);

  // Mentor Sharing state
  const [mentorEmail, setMentorEmail] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shares, setShares] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setQualification(user.qualification || '');
      setInstitution(user.institution || '');
      setCurrentSemester(user.current_semester || '');
      setBranch(user.branch || '');
      setTargetJobRole(user.target_job_role || 'Full-Stack Developer');
      setWeeklyHours(user.available_hours_per_week || 14);
      setTimelineWeeks(user.target_timeline_weeks || 16);
      setLearningFormat(user.preferred_learning_format || 'interactive');
    }
    loadShares();
  }, [user]);

  const loadShares = async () => {
    try {
      const data = await api.getMyShares();
      setShares(data);
    } catch (err) {
      console.warn('Failed to load mentor shares', err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateProfile({
        full_name: fullName,
        qualification,
        institution,
        current_semester: currentSemester,
        branch,
        target_job_role: targetJobRole,
        available_hours_per_week: weeklyHours,
        target_timeline_weeks: timelineWeeks,
        preferred_learning_format: learningFormat,
      });
      updateUser(updated);
      alert('Profile updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleShareWithMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorEmail) return;
    setSharing(true);
    try {
      await api.shareWithMentor(mentorEmail);
      alert(`Progress shared with mentor (${mentorEmail})!`);
      setMentorEmail('');
      loadShares();
    } catch (err: any) {
      alert(err.message || 'Failed to share with mentor');
    } finally {
      setSharing(false);
    }
  };

  const handleLoadAnanyaDemo = async () => {
    try {
      await demoLogin();
      alert('Switched to Ananya Demo Student profile!');
    } catch (err: any) {
      alert(err.message || 'Failed to switch to demo');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Profile & Learning Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your academic background, study pace, target goals, and mentor authorizations.
          </p>
        </div>
        <button
          onClick={handleLoadAnanyaDemo}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Ananya Demo Profile</span>
        </button>
      </div>

      {/* Main Profile Form Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address (Read-Only)</label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Qualification</label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. B.Tech Computer Science"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Institution / College</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Government Engineering College"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Semester / Year</label>
              <input
                type="text"
                value={currentSemester}
                onChange={(e) => setCurrentSemester(e.target.value)}
                placeholder="e.g. Semester 4 (Year 2)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Job Role</label>
              <select
                value={targetJobRole}
                onChange={(e) => setTargetJobRole(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Full-Stack Developer">Full-Stack Developer</option>
                <option value="Software Developer">Software Developer</option>
                <option value="AI/ML Engineer">AI/ML Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                <option value="Cloud Engineer">Cloud Engineer</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Study Hours Per Week ({weeklyHours}h = ~{Math.round(weeklyHours / 7)}h/day)
              </label>
              <input
                type="number"
                min="2"
                max="60"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(parseInt(e.target.value) || 14)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Timeline (Weeks)</label>
              <input
                type="number"
                min="4"
                max="52"
                value={timelineWeeks}
                onChange={(e) => setTimelineWeeks(parseInt(e.target.value) || 16)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm shadow-blue-500/20 transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Mentor Sharing Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Faculty & Mentor Sharing</h2>
        </div>
        <p className="text-xs text-slate-500">
          Explicitly grant faculty or designated mentors access to review your learning roadmaps and provide milestone project feedback.
        </p>

        <form onSubmit={handleShareWithMentor} className="flex gap-2">
          <input
            type="email"
            required
            placeholder="mentor@college.edu"
            value={mentorEmail}
            onChange={(e) => setMentorEmail(e.target.value)}
            className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-slate-200"
          />
          <button
            type="submit"
            disabled={sharing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-sm transition-colors shrink-0"
          >
            {sharing ? 'Sharing...' : 'Authorize Mentor'}
          </button>
        </form>

        {shares.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Authorized Mentors:</h4>
            <div className="space-y-1.5 text-xs">
              {shares.map((s) => (
                <div key={s.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <span className="font-medium text-slate-800">{s.mentor_email}</span>
                  <span className="text-[10px] font-mono text-slate-500">{s.share_token}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
