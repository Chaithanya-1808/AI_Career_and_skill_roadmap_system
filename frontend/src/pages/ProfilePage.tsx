import React, { useState, useEffect } from 'react';
import {
  User as UserIcon, Settings, Save, Users, Key, RotateCcw, CheckCircle2,
  Share2, Shield, Clock, BookOpen, Sparkles, GraduationCap, Code2,
  Briefcase, Plus, X, Award, Building, Compass, AlertCircle, Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const COMMON_SKILL_SUGGESTIONS = [
  'HTML5 & Modern CSS',
  'JavaScript (ES6+)',
  'Python Programming',
  'C Programming',
  'React.js',
  'Node.js & Express',
  'SQL Databases',
  'Git & GitHub',
  'Data Structures & Algorithms',
  'Docker & Containers',
  'REST APIs',
  'Linux & Bash'
];

const COMMON_INTEREST_SUGGESTIONS = [
  'Full-Stack Web Development',
  'Software Engineering',
  'Artificial Intelligence & ML',
  'Cloud Systems & Microservices',
  'Cybersecurity & Network Defense',
  'Database Architecture & SQL',
  'Competitive Coding & DSA'
];

const AVAILABLE_CAREERS = [
  'Full-Stack Developer',
  'Software Developer',
  'AI/ML Engineer',
  'Data Scientist',
  'Cybersecurity Analyst',
  'Cloud Engineer',
  'DevOps Engineer',
  'UI/UX Designer'
];

export const ProfilePage: React.FC = () => {
  const { user, updateUser, demoLogin } = useAuth();

  // Basic info
  const [fullName, setFullName] = useState(user?.full_name || 'Chaithanya C');
  const [qualification, setQualification] = useState(user?.qualification || 'B.Tech Computer Science & Engineering (CSE)');
  const [institution, setInstitution] = useState(user?.institution || 'Nagarjuna College of Engineering and Technology (NCET)');
  const [currentSemester, setCurrentSemester] = useState(user?.current_semester || 'Semester 6 (3rd Year CSE)');
  const [branch, setBranch] = useState(user?.branch || 'Computer Science & Engineering');
  const [targetJobRole, setTargetJobRole] = useState(user?.target_job_role || 'Full-Stack Developer');
  const [weeklyHours, setWeeklyHours] = useState(user?.available_hours_per_week || 14);
  const [timelineWeeks, setTimelineWeeks] = useState(user?.target_timeline_weeks || 16);
  const [learningFormat, setLearningFormat] = useState(user?.preferred_learning_format || 'interactive');

  // Tag arrays
  const [existingSkills, setExistingSkills] = useState<string[]>(
    user?.existing_skills && user.existing_skills.length > 0
      ? user.existing_skills
      : ['HTML5 & Modern CSS', 'Python Programming', 'JavaScript (ES6+)', 'C Programming']
  );
  const [academicInterests, setAcademicInterests] = useState<string[]>(
    user?.academic_interests && user.academic_interests.length > 0
      ? user.academic_interests
      : ['Full-Stack Web Development', 'Software Engineering', 'Cloud & APIs', 'Problem Solving']
  );
  const [preferredCareers, setPreferredCareers] = useState<string[]>(
    user?.preferred_careers && user.preferred_careers.length > 0
      ? user.preferred_careers
      : ['Full-Stack Developer', 'Software Developer', 'AI/ML Engineer']
  );

  // New tag input states
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newInterestInput, setNewInterestInput] = useState('');

  // States
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Mentor Sharing state
  const [mentorEmail, setMentorEmail] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shares, setShares] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || 'Chaithanya C');
      setQualification(user.qualification || 'B.Tech Computer Science & Engineering (CSE)');
      setInstitution(user.institution || 'Nagarjuna College of Engineering and Technology (NCET)');
      setCurrentSemester(user.current_semester || 'Semester 6 (3rd Year CSE)');
      setBranch(user.branch || 'Computer Science & Engineering');
      setTargetJobRole(user.target_job_role || 'Full-Stack Developer');
      setWeeklyHours(user.available_hours_per_week || 14);
      setTimelineWeeks(user.target_timeline_weeks || 16);
      setLearningFormat(user.preferred_learning_format || 'interactive');
      if (user.existing_skills && user.existing_skills.length > 0) {
        setExistingSkills(user.existing_skills);
      }
      if (user.academic_interests && user.academic_interests.length > 0) {
        setAcademicInterests(user.academic_interests);
      }
      if (user.preferred_careers && user.preferred_careers.length > 0) {
        setPreferredCareers(user.preferred_careers);
      }
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

  // Skill tag add/remove
  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !existingSkills.includes(trimmed)) {
      setExistingSkills([...existingSkills, trimmed]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setExistingSkills(existingSkills.filter((s) => s !== skillToRemove));
  };

  // Interest tag add/remove
  const handleAddInterest = (interest: string) => {
    const trimmed = interest.trim();
    if (trimmed && !academicInterests.includes(trimmed)) {
      setAcademicInterests([...academicInterests, trimmed]);
      setNewInterestInput('');
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setAcademicInterests(academicInterests.filter((i) => i !== interestToRemove));
  };

  // Preferred careers toggle
  const handleTogglePreferredCareer = (career: string) => {
    if (preferredCareers.includes(career)) {
      if (preferredCareers.length > 1) {
        setPreferredCareers(preferredCareers.filter((c) => c !== career));
      }
    } else {
      setPreferredCareers([...preferredCareers, career]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
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
        existing_skills: existingSkills,
        academic_interests: academicInterests,
        preferred_careers: preferredCareers,
      });
      updateUser(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
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

  const handleLoadChaithanyaDemo = async () => {
    try {
      await demoLogin();
      alert('Loaded verified Chaithanya (3rd Year CSE) student profile!');
    } catch (err: any) {
      alert(err.message || 'Failed to switch to demo');
    }
  };

  // User initials for avatar
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'CC';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 1. Student Identity Hero Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl md:text-3xl shadow-lg border-2 border-white/20 shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
                {fullName}
              </h1>
              <span className="bg-blue-500/30 text-blue-200 border border-blue-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Student Profile
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 3rd Year CSE
              </span>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <span>{user?.email || '1nc24cs034@ncetmail.com'}</span>
              <span>•</span>
              <span className="text-slate-400">{institution}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto">
          <button
            onClick={handleLoadChaithanyaDemo}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-300" />
            <span>Reset Demo Profile</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Target Role</span>
            <span className="text-xs font-bold text-slate-800 block truncate">{targetJobRole}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Weekly Study</span>
            <span className="text-xs font-bold text-slate-800 block">{weeklyHours} hrs/week</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Verified Skills</span>
            <span className="text-xs font-bold text-slate-800 block">{existingSkills.length} Skills Listed</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Current Status</span>
            <span className="text-xs font-bold text-slate-800 block">Semester 6 (Active)</span>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span><b>Profile Updated Successfully!</b> Your skills, goals, and academic credentials have been saved.</span>
        </div>
      )}

      {/* Main Form Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Section 1: Academic Background */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Academic Background & Institution</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Email Address (Read-Only)</label>
              <input
                type="text"
                disabled
                value={user?.email || '1nc24cs034@ncetmail.com'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Qualification / Degree</label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. B.Tech Computer Science & Engineering"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Institution / College</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Nagarjuna College of Engineering and Technology"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Semester & Year</label>
              <input
                type="text"
                value={currentSemester}
                onChange={(e) => setCurrentSemester(e.target.value)}
                placeholder="e.g. Semester 6 (3rd Year CSE)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Technical Skills Management */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Your Technical Skills & Baseline Competencies</h2>
            </div>
            <span className="text-[11px] text-slate-400">Used for initial skill-gap evaluation</span>
          </div>

          {/* Current Skill Chips */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Currently Added Skills:</label>
            <div className="flex flex-wrap gap-2 min-h-[38px] p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              {existingSkills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 bg-white text-slate-800 text-xs font-semibold px-3 py-1 rounded-lg border border-slate-200 shadow-2xs"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    className="text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {existingSkills.length === 0 && (
                <span className="text-xs text-slate-400 italic p-1">No skills added yet. Add from suggestions below or type your own.</span>
              )}
            </div>
          </div>

          {/* Custom Skill Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a new skill (e.g. Tailwind CSS, MongoDB, Java)..."
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill(newSkillInput);
                }
              }}
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => handleAddSkill(newSkillInput)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Skill</span>
            </button>
          </div>

          {/* Quick Suggestions */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Quick Add Suggestions:</span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SKILL_SUGGESTIONS.map((skill) => {
                const isAdded = existingSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => (isAdded ? handleRemoveSkill(skill) : handleAddSkill(skill))}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all ${
                      isAdded
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {isAdded ? `✓ ${skill}` : `+ ${skill}`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 3: Academic Interests & Preferred Careers */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Compass className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-bold text-slate-900">Academic Interests & Target Engineering Domains</h2>
          </div>

          {/* Academic Interests */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Areas of Engineering Interest:</label>
            <div className="flex flex-wrap gap-2 min-h-[38px] p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              {academicInterests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1.5 bg-white text-purple-900 text-xs font-semibold px-3 py-1 rounded-lg border border-purple-200 shadow-2xs"
                >
                  <span>{interest}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(interest)}
                    className="text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Quick Suggestions for Interests */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COMMON_INTEREST_SUGGESTIONS.map((interest) => {
                const isAdded = academicInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => (isAdded ? handleRemoveInterest(interest) : handleAddInterest(interest))}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all ${
                      isAdded
                        ? 'bg-purple-50 border-purple-200 text-purple-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {isAdded ? `✓ ${interest}` : `+ ${interest}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Careers Multi-Select */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-slate-700">Preferred Career Tracks (Select multiple):</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AVAILABLE_CAREERS.map((career) => {
                const isSelected = preferredCareers.includes(career);
                return (
                  <button
                    key={career}
                    type="button"
                    onClick={() => handleTogglePreferredCareer(career)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 text-blue-900 ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{career}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 4: Learning Pace & Study Budget */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Career Goal & Study Schedule Configuration</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Primary Target Role</label>
              <select
                value={targetJobRole}
                onChange={(e) => setTargetJobRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {AVAILABLE_CAREERS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Weekly Study Target ({weeklyHours} hrs/week • ~{Math.round(weeklyHours / 7)}h/day)
              </label>
              <input
                type="number"
                min="2"
                max="60"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(parseInt(e.target.value) || 14)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Target Timeline (Weeks)</label>
              <input
                type="number"
                min="4"
                max="52"
                value={timelineWeeks}
                onChange={(e) => setTimelineWeeks(parseInt(e.target.value) || 16)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div className="pt-2 text-xs">
            <label className="block font-semibold text-slate-700 mb-1.5">Preferred Learning Format</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'interactive', label: 'Interactive & Hands-on', desc: 'Code exercises & quizzes' },
                { id: 'project-based', label: 'Project-Based Building', desc: 'Real-world repository tasks' },
                { id: 'video-reading', label: 'Video & Documentation', desc: 'Deep-dive references' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setLearningFormat(fmt.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    learningFormat === fmt.id
                      ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500 text-blue-900'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="font-bold block text-xs">{fmt.label}</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">{fmt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 text-xs"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Section 5: Faculty & Mentor Sharing */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Faculty & Mentor Sharing</h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Explicitly grant faculty or designated academic mentors access to review your learning roadmaps and provide milestone project feedback.
        </p>

        <form onSubmit={handleShareWithMentor} className="flex gap-2">
          <input
            type="email"
            required
            placeholder="mentor@faculty.college.edu"
            value={mentorEmail}
            onChange={(e) => setMentorEmail(e.target.value)}
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={sharing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-colors shrink-0 flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{sharing ? 'Authorizing...' : 'Authorize Mentor'}</span>
          </button>
        </form>

        {shares.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Authorized Mentors:</h4>
            <div className="space-y-1.5 text-xs">
              {shares.map((s) => (
                <div key={s.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{s.mentor_email}</span>
                  <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                    Token: {s.share_token}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
