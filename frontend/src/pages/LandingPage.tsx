import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, ShieldCheck, Award, Target, Map, BookOpen,
  CheckCircle2, Compass, Lock, UserCheck, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user, login, register, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (authMode === 'register') {
        await register(email, password, fullName);
      } else {
        await login(email, password);
      }
      navigate('/overview');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setError('');
    setLoading(true);
    try {
      await demoLogin();
      navigate('/overview');
    } catch (err: any) {
      setError(err.message || 'Demo student login failed. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Welcome back, {user.full_name}</h2>
          <p className="text-sm text-slate-500 mb-6">Your active session is ready.</p>
          <button
            onClick={() => navigate('/overview')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base tracking-tight leading-none">Smart Roadmap</span>
              <span className="block text-[11px] text-slate-500 font-medium">AI Career Guidance System</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/verify-certificate"
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 px-3 py-2 rounded-lg transition-colors hidden sm:inline-block"
            >
              Verify Certificate
            </Link>
            <button
              onClick={() => { setAuthMode('login'); setError(''); }}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('register'); setError(''); }}
              className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm shadow-blue-500/20 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 flex flex-col justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold mx-auto mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>College Mini-Project Demonstration & Portfolio</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Navigate Your Tech Career with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Adaptive AI Roadmaps</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Solve real career uncertainty with server-scored diagnostic assessments, evidence-based skill gap analysis, prerequisite-ordered roadmaps, and verifiable milestone certificates.
        </p>

        {/* Call to action & Demo Student Button */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto w-full">
          <button
            onClick={handleDemoAccess}
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3.5 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <UserCheck className="w-5 h-5" />
            <span>Explore Demo: Ananya (2nd Year CS)</span>
          </button>
          <button
            onClick={() => { setAuthMode('register'); setError(''); }}
            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 font-semibold px-6 py-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition-colors"
          >
            <span>Create Student Account</span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Explainable Career Matching</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore 12 major engineering domains. Get transparent match estimates based on your academic interests, existing skills, and assessment evidence.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 font-bold">
              <Map className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Prerequisite-Aware Roadmaps</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Stage-by-stage learning schedules generated with Google Gemini and verified rule fallbacks. Locked tasks automatically unlock as dependencies are mastered.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Verifiable PDF Certificates</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Earn downloadable certificates with unique verification IDs and QR codes. Verifiable on a dedicated public verification portal.
            </p>
          </div>
        </div>

        {/* Problem vs Solution Comparison Table */}
        <div className="mt-20 bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 text-left shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-2">College Problem Solving Architecture</h2>
          <p className="text-xs text-slate-500 mb-6">Designed to replace generic career advice with measurable, transparent learning.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 text-left">Real Problem Students Face</th>
                  <th className="py-3 px-4 text-left">Our Implemented Solution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Generic career recommendations</td>
                  <td className="py-3 px-4 text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Explainable scoring model with matching & missing skills breakdown</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Unknown baseline skill level</td>
                  <td className="py-3 px-4 text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Server-scored diagnostic assessment with protected answer keys</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Random learning without sequence</td>
                  <td className="py-3 px-4 text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Prerequisite-locked roadmap stages adapted to student's weekly study budget</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-900">Unverifiable resume certificates</td>
                  <td className="py-3 px-4 text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Cryptographically hashed certificates with public verification portal</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <p>AI Career & Smart Roadmap System — College Mini-Project Demonstration</p>
      </footer>

      {/* Authentication Modal */}
      {authMode && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 relative">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {authMode === 'register' ? 'Create Student Account' : 'Welcome Back'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              {authMode === 'register' ? 'Register to start your personalized roadmap.' : 'Enter your credentials to access your dashboard.'}
            </p>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-xs shadow-sm shadow-blue-500/20 transition-colors mt-2"
              >
                {loading ? 'Processing...' : (authMode === 'register' ? 'Register Account' : 'Sign In')}
              </button>
            </form>

            <div className="mt-4 text-center">
              {authMode === 'register' ? (
                <button
                  onClick={() => setAuthMode('login')}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Already have an account? Sign in
                </button>
              ) : (
                <button
                  onClick={() => setAuthMode('register')}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Need an account? Register
                </button>
              )}
            </div>

            <button
              onClick={() => setAuthMode(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
