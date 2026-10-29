import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award, Download, ExternalLink, CheckCircle2, AlertCircle, Copy,
  Sparkles, ShieldCheck, QrCode
} from 'lucide-react';
import { api } from '../services/api';
import { Certificate } from '../types';
import { useAuth } from '../context/AuthContext';

export const CertificatesPage: React.FC = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      const data = await api.getMyCertificates();
      setCertificates(data);
    } catch (err) {
      console.error('Failed to load certificates', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (type: string) => {
    setClaiming(type);
    try {
      const cert = await api.claimCertificate(type);
      alert(`Certificate issued! Unique ID: ${cert.certificate_id}`);
      loadCertificates();
    } catch (err: any) {
      alert(err.message || 'Eligibility check failed');
    } finally {
      setClaiming(null);
    }
  };

  const copyVerificationLink = (certId: string) => {
    const url = `${window.location.origin}/verify-certificate/${certId}`;
    navigator.clipboard.writeText(url);
    alert('Verification URL copied to clipboard: ' + url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          Verifiable Academic & Milestone Certificates
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Credentials issued with cryptographic verification hashes based on server-audited milestone completion.
        </p>
      </div>

      {/* Claim Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Claim Eligible Milestone Certificates</h2>
        </div>
        <p className="text-xs text-slate-500">
          The server validates your genuine assessment scores and verified task completions before generating your PDF certificate.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Diagnostic Distinction */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded">
                Assessment Milestone
              </span>
              <h3 className="font-bold text-slate-900 text-sm mt-1.5">Diagnostic Distinction</h3>
              <p className="text-xs text-slate-500 mt-1">
                Criteria: Score at least 70% in a verified server-scored diagnostic exam.
              </p>
            </div>
            <button
              onClick={() => handleClaim('diagnostic_distinction')}
              disabled={claiming === 'diagnostic_distinction'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl text-xs transition-colors shadow-sm shadow-blue-500/20"
            >
              {claiming === 'diagnostic_distinction' ? 'Checking Criteria...' : 'Check & Claim Certificate'}
            </button>
          </div>

          {/* Stage 1 Foundations Mastery */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-100/60 px-2 py-0.5 rounded">
                Stage Milestone
              </span>
              <h3 className="font-bold text-slate-900 text-sm mt-1.5">Foundations Mastery</h3>
              <p className="text-xs text-slate-500 mt-1">
                Criteria: Complete all Stage 1 foundational tasks and learning deliverables.
              </p>
            </div>
            <button
              onClick={() => handleClaim('stage_completion')}
              disabled={claiming === 'stage_completion'}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-xl text-xs transition-colors shadow-sm shadow-indigo-500/20"
            >
              {claiming === 'stage_completion' ? 'Checking Criteria...' : 'Check & Claim Certificate'}
            </button>
          </div>

          {/* Full Roadmap Track */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded">
                Career Track
              </span>
              <h3 className="font-bold text-slate-900 text-sm mt-1.5">Full Career Track Milestone</h3>
              <p className="text-xs text-slate-500 mt-1">
                Criteria: Complete at least 80% of total roadmap tasks with verified project deliverable.
              </p>
            </div>
            <button
              onClick={() => handleClaim('full_roadmap')}
              disabled={claiming === 'full_roadmap'}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-xl text-xs transition-colors shadow-sm shadow-emerald-500/20"
            >
              {claiming === 'full_roadmap' ? 'Checking Criteria...' : 'Check & Claim Certificate'}
            </button>
          </div>
        </div>
      </div>

      {/* Issued Certificates Gallery */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">Your Earned Certificates ({certificates.length})</h2>
        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-100/40 to-transparent pointer-events-none rounded-bl-full" />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                      {cert.career_title || 'Software Engineering'}
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-slate-500">
                      {cert.certificate_id}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-1">{cert.title}</h3>
                  <p className="text-xs text-slate-500 mb-2">Awarded to: <b>{cert.student_name}</b></p>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {cert.criteria_summary}
                  </p>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Issued On: </span>
                    <span>{new Date(cert.issued_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={cert.pdf_download_url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyVerificationLink(cert.certificate_id)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                      title="Copy Public Verification Link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/verify-certificate/${cert.certificate_id}`}
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Public Verification</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No certificates claimed yet. Complete a diagnostic assessment with 70%+ or finish Stage 1 tasks to claim your first certificate!
          </div>
        )}
      </div>
    </div>
  );
};
