import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, Search, CheckCircle2, Filter } from 'lucide-react';
import { api } from '../services/api';
import { LearningResource } from '../types';

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResources() {
      try {
        const data = await api.getResources();
        setResources(data);
      } catch (err) {
        console.error('Failed to load learning resources', err);
      } finally {
        setLoading(false);
      }
    }
    loadResources();
  }, []);

  const filtered = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiff = selectedDifficulty === 'all' || r.difficulty === selectedDifficulty;
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          Curated Learning Resource Library
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Legitimate, official documentation and open-source tutorials aligned with your roadmap stages.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resources, frameworks, providers (e.g. React, MDN, PostgreSQL)..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0 w-full sm:w-auto"
        >
          <option value="all">All Difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((res) => (
          <div
            key={res.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                  Stage {res.recommended_stage}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 capitalize bg-slate-100 px-2 py-0.5 rounded">
                  {res.difficulty}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm mb-1 leading-snug">{res.title}</h3>
              <p className="text-xs text-slate-500 font-medium mb-3">Provider: {res.provider}</p>

              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="capitalize">{res.format}</span>
                <span>•</span>
                <span>~{res.estimated_hours} hours study time</span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">{res.is_free ? 'Free / Open Access' : 'Verified'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <a
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold py-2 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-200/60"
              >
                <span>Access Resource</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

