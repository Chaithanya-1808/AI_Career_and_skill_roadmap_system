import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck, CheckCircle2, XCircle, Search, Sparkles, ArrowLeft,
  Award, Calendar, User, FileText, AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { CertificateVerify } from '../types';

export const VerifyCertificatePage: React.FC = () => {
  const { certificateId } = useParams<{ certificateId?: string }>();
  const [searchId, setSearchId] = useState(certificateId || '');
  const [certData, setCertData] = useState<CertificateVerify | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (certificateId) {
      verifyId(certificateId);
    }
  }, [certificateId]);

  const verifyId = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    setLoading(true);
    setError(null);
    setCertData(null);
    try {
      const data = await api.verifyCertificate(idToVerify.trim());
      setCertData(data);
    } catch (err: any) {
      setError(err.message || 'Certificate verification failed: Record not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyId(searchId);
  };

  return (
    <div className="min-h-screen bg-[#05060b] text-slate-100 flex flex-col relative selection:bg-orange-500 selection:text-white">
      {/* Top ambient spotlight */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(249, 115, 22, 0.1) 0%, transparent 70%)'
        }}
      />

      {/* Top Header */}
      <header className="border-b border-white/[0.08] bg-[#080b14]/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Platform</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-[0_0_15px_rgba(249,115,22,0.4)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm">Public Certificate Verification</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Official Credential Verification
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Validate the authenticity of milestone certificates issued by the AI Career & Smart Roadmap System.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Certificate ID (e.g. ACR-2026-FSD-7894)..."
              className="w-full text-xs pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-sm transition-colors shrink-0"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        {/* Verification Result Card */}
        {certData && (
          <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-md space-y-5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-emerald-700 text-sm">
                  VERIFIED AUTHENTIC CREDENTIAL
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                {certData.certificate_id}
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Student Name</span>
                  <span className="font-bold text-slate-900 text-base">{certData.student_name}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Award className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Achievement Title</span>
                  <span className="font-bold text-slate-900 text-sm">{certData.achievement_title}</span>
                  {certData.career_title && (
                    <span className="text-slate-500 block text-[11px] mt-0.5">Career Track: {certData.career_title}</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Issue Date</span>
                  <span className="text-slate-700">
                    {new Date(certData.issued_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Verified Criteria</span>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 mt-1">
                    {certData.criteria_summary}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed">
              <p><b>Issuing Entity:</b> {certData.platform_name}</p>
              <p className="mt-0.5">{certData.scope_disclaimer}</p>
            </div>
          </div>
        )}

        {/* Error Card */}
        {error && (
          <div className="p-5 rounded-2xl bg-white border border-red-200 shadow-sm text-center space-y-2">
            <XCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="font-bold text-slate-900 text-sm">Certificate Verification Failed</h3>
            <p className="text-xs text-red-600">{error}</p>
            <p className="text-[11px] text-slate-400">
              Please check the Certificate ID formatting and ensure no characters were omitted.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

