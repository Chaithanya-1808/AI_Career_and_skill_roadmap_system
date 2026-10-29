import React, { useState, useEffect } from 'react';
import {
  Compass, Search, ArrowRight, CheckCircle2, AlertCircle, Sparkles,
  Layers, ExternalLink, HelpCircle, Scale, X, BookOpen, Clock, Award
} from 'lucide-react';
import { api } from '../services/api';
import { CareerSummary, CareerProfile, CareerRecommendationResponse } from '../types';
import { useAuth } from '../context/AuthContext';

export const CareerExplorerPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [careers, setCareers] = useState<CareerSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCareer, setSelectedCareer] = useState<CareerProfile | null>(null);
  const [loadingCareer, setLoadingCareer] = useState(false);

  // Compare mode
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareProfiles, setCompareProfiles] = useState<CareerProfile[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Recommendation engine state
  const [showRecModal, setShowRecModal] = useState(false);
  const [recInterests, setRecInterests] = useState(user?.academic_interests.join(', ') || 'Website development, Problem-solving');
  const [recSkills, setRecSkills] = useState(user?.existing_skills.join(', ') || 'HTML5 & Modern CSS, C Programming');
  const [recResult, setRecResult] = useState<CareerRecommendationResponse | null>(null);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    async function loadCareers() {
      try {
        const data = await api.getCareers();
        setCareers(data);
      } catch (err) {
        console.error('Failed to load careers', err);
      }
    }
    loadCareers();
  }, []);

  const handleSelectCareer = async (id: string) => {
    setLoadingCareer(true);
    try {
      const fullProfile = await api.getCareer(id);
      setSelectedCareer(fullProfile);
    } catch (err) {
      console.error('Failed to load career profile', err);
    } finally {
      setLoadingCareer(false);
    }
  };

  const toggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter((c) => c !== id));
    } else {
      if (compareIds.length >= 3) {
        alert('You can compare at most 3 careers simultaneously.');
        return;
      }
      setCompareIds([...compareIds, id]);
    }
  };

  const openCompareModal = async () => {
    if (compareIds.length < 2) {
      alert('Please select at least 2 careers to compare.');
      return;
    }
    const profiles = await Promise.all(compareIds.map((id) => api.getCareer(id)));
    setCompareProfiles(profiles);
    setShowCompareModal(true);
  };

  const handleRunRecommendation = async () => {
    setRecLoading(true);
    try {
      const interests = recInterests.split(',').map((s) => s.trim()).filter(Boolean);
      const skills = recSkills.split(',').map((s) => s.trim()).filter(Boolean);
      const result = await api.getRecommendations({
        academic_interests: interests,
        existing_skills: skills,
      });
      setRecResult(result);
    } catch (err) {
      console.error('Recommendation calculation failed', err);
    } finally {
      setRecLoading(false);
    }
  };

  const handleSetTargetCareer = async (careerId: string, careerTitle: string) => {
    try {
      await api.updateProfile({ target_job_role: careerTitle, preferred_careers: [careerTitle] });
      updateUser({ target_job_role: careerTitle, preferred_careers: [careerTitle] });
      // Generate new roadmap for this career
      await api.generateRoadmap(careerId, true);
      alert(`Target career updated to ${careerTitle}! Your roadmap has been configured.`);
    } catch (err) {
      console.error('Failed to set target career', err);
    }
  };

  const filteredCareers = careers.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.overview.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.technical_skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Career Explorer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover roles, skill expectations, recommended projects, and compare paths.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {compareIds.length >= 2 && (
            <button
              onClick={openCompareModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Scale className="w-4 h-4" />
              <span>Compare ({compareIds.length})</span>
            </button>
          )}
          <button
            onClick={() => setShowRecModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm shadow-blue-500/20 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Career Matcher</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search careers, technologies, or keywords (e.g. React, SQL, DevOps, Embedded)..."
          className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Careers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCareers.map((c) => {
          const isSelected = compareIds.includes(c.id);
          const isCurrentTarget = user?.target_job_role?.toLowerCase() === c.title.toLowerCase();

          return (
            <div
              key={c.id}
              className={`rounded-2xl bg-white border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                isCurrentTarget ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 text-base">{c.title}</h3>
                  {isCurrentTarget && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      Target Role
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {c.overview}
                </p>

                {/* Technical Skills Badges */}
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Core Technical Skills
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {c.technical_skills.slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                    {c.technical_skills.length > 4 && (
                      <span className="text-[11px] font-medium text-slate-400 px-1 py-0.5">
                        +{c.technical_skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Entry Level Roles */}
                {c.entry_level_roles.length > 0 && (
                  <div className="mb-4 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Entry Roles: </span>
                    <span>{c.entry_level_roles.slice(0, 2).join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => toggleCompare(c.id)}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>{isSelected ? 'Selected' : 'Compare'}</span>
                </button>

                <button
                  onClick={() => handleSelectCareer(c.id)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Explore Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Career Profile Detail Modal */}
      {selectedCareer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Career Profile Specification
                </span>
                <h2 className="text-xl font-bold text-slate-900">{selectedCareer.title}</h2>
              </div>
              <button
                onClick={() => setSelectedCareer(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              {selectedCareer.overview}
            </p>

            <div className="space-y-5 text-xs">
              {/* Responsibilities */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Typical Responsibilities</h4>
                <ul className="space-y-1.5 text-slate-600">
                  {selectedCareer.responsibilities.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <h4 className="font-bold text-slate-900 mb-2">Technical Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedCareer.technical_skills.map((s, idx) => (
                      <span key={idx} className="bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <h4 className="font-bold text-slate-900 mb-2">Foundational & Soft Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {[...selectedCareer.foundational_skills, ...selectedCareer.soft_skills].map((s, idx) => (
                      <span key={idx} className="bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommended Projects */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Recommended Hands-On Projects</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedCareer.recommended_projects.map((proj, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{proj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roadmap Outline */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Suggested Learning Stages</h4>
                <div className="space-y-2">
                  {selectedCareer.roadmap_outline.map((stage) => (
                    <div key={stage.stage} className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                          {stage.stage}
                        </span>
                        <span className="font-medium text-slate-800">{stage.title}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Weeks {stage.weeks}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Set as Target Career */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedCareer(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => handleSetTargetCareer(selectedCareer.id, selectedCareer.title)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-sm shadow-blue-500/20"
              >
                Set as My Target Role & Generate Roadmap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Careers Modal */}
      {showCompareModal && compareProfiles.length >= 2 && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                <span>Side-by-Side Career Comparison</span>
              </h2>
              <button onClick={() => setShowCompareModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {compareProfiles.map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm">{p.title}</h3>
                  <p className="text-slate-600 text-[11px]">{p.overview}</p>
                  <div>
                    <span className="font-bold text-slate-700 block mb-1">Technical Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {p.technical_skills.map((s, idx) => (
                        <span key={idx} className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block mb-1">Entry Roles:</span>
                    <p className="text-[11px] text-slate-500">{p.entry_level_roles.join(', ')}</p>
                  </div>
                  <button
                    onClick={() => {
                      handleSetTargetCareer(p.id, p.title);
                      setShowCompareModal(false);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 rounded-lg text-xs transition-colors"
                  >
                    Select this Path
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Career Matcher Modal */}
      {showRecModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span>Explainable Career Recommendation Engine</span>
              </h2>
              <button onClick={() => setShowRecModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Our transparent matching algorithm combines your stated interests, current skills, and diagnostic evidence without black-box claims.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Interests (comma-separated)
                </label>
                <input
                  type="text"
                  value={recInterests}
                  onChange={(e) => setRecInterests(e.target.value)}
                  placeholder="e.g. Website development, Problem-solving, Machine Learning"
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Existing Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={recSkills}
                  onChange={(e) => setRecSkills(e.target.value)}
                  placeholder="e.g. HTML5 & Modern CSS, C Programming, Python"
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleRunRecommendation}
                disabled={recLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-xs shadow-sm transition-colors"
              >
                {recLoading ? 'Calculating Matches...' : 'Compute Explainable Recommendations'}
              </button>
            </div>

            {/* Results Display */}
            {recResult && (
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase text-blue-600">Top Match</span>
                    <span className="text-sm font-extrabold text-blue-700">
                      {recResult.top_recommendation.estimated_match_score}% Match
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">
                    {recResult.top_recommendation.career_title}
                  </h3>
                  <p className="text-xs text-slate-700 mb-2">
                    {recResult.top_recommendation.explanation}
                  </p>
                  <div className="text-[11px] text-slate-600 space-y-1">
                    <div><b>Matching Skills:</b> {recResult.top_recommendation.matching_skills.join(', ') || 'Foundational readiness'}</div>
                    <div><b>Skills to Learn:</b> {recResult.top_recommendation.missing_skills.join(', ')}</div>
                    <div><b>Suggested First Step:</b> {recResult.top_recommendation.suggested_first_step}</div>
                  </div>
                  <button
                    onClick={() => {
                      handleSetTargetCareer(
                        recResult.top_recommendation.career_id,
                        recResult.top_recommendation.career_title
                      );
                      setShowRecModal(false);
                    }}
                    className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 rounded-lg text-xs"
                  >
                    Adopt Top Match as My Goal
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-500">
                  <p className="font-semibold text-slate-700 mb-0.5">Disclaimer:</p>
                  <p>{recResult.disclaimer}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
