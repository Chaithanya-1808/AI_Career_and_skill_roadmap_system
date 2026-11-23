import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Award, Map,
  CheckCircle2, Compass, UserCheck, AlertCircle, Palette,
  LayoutDashboard, Target, Calendar, CheckSquare, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type AestheticTheme = 'eclipse' | 'midnight' | 'lavender' | 'sunset' | 'sage';

const THEMES: Record<AestheticTheme, {
  name: string;
  iconBg: string;
  pageBg: string;
  ambientSpotlight: string;
  orb1: string;
  orb2: string;
  orb3: string;
  arcBorder: string;
  arcGlow: string;
  titleGradient: string;
  primaryBtn: string;
  cardBg: string;
  headerBg: string;
  headerBorder: string;
  badge: string;
  textPrimary: string;
  textSecondary: string;
  tableBg: string;
  tableBorder: string;
  tableHeader: string;
  tableRowHover: string;
  navBtn: string;
  footerBg: string;
  footerBorder: string;
  footerText: string;
}> = {
  eclipse: {
    name: 'Eclipse Obsidian (Pinterest)',
    iconBg: 'bg-gradient-to-tr from-orange-600 to-amber-500 shadow-[0_0_20px_rgba(249,115,22,0.45)]',
    pageBg: 'bg-[#05060b]',
    ambientSpotlight: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(249, 115, 22, 0.18) 0%, transparent 75%)',
    orb1: 'from-orange-600/35 via-amber-600/25 to-transparent',
    orb2: 'from-amber-500/25 via-orange-700/20 to-transparent',
    orb3: 'from-rose-600/20 via-orange-500/15 to-transparent',
    arcBorder: 'border-t-2 border-orange-500/90',
    arcGlow: 'shadow-[0_-20px_70px_rgba(249,115,22,0.65),0_-3px_25px_rgba(251,146,60,0.9)]',
    titleGradient: 'from-orange-400 via-amber-300 to-orange-500 drop-shadow-[0_0_40px_rgba(249,115,22,0.4)]',
    primaryBtn: 'bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 hover:from-orange-500 hover:via-amber-400 hover:to-orange-500 text-white shadow-[0_0_35px_rgba(249,115,22,0.5)] hover:shadow-[0_0_45px_rgba(249,115,22,0.7)] border border-orange-400/40',
    cardBg: 'bg-[#0c101b]/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] hover:border-orange-500/40 hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.25)]',
    headerBg: 'bg-[#05060b]/85 backdrop-blur-xl',
    headerBorder: 'border-white/[0.08]',
    badge: 'bg-orange-950/70 border border-orange-500/40 text-orange-300 shadow-[0_0_20px_rgba(249,115,22,0.2)]',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-400',
    tableBg: 'bg-[#0c101b]/85 backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/80',
    tableBorder: 'border-white/[0.06]',
    tableHeader: 'text-slate-400 border-white/[0.08]',
    tableRowHover: 'hover:bg-white/[0.03]',
    navBtn: 'text-slate-300 hover:text-white hover:bg-white/[0.05]',
    footerBg: 'bg-[#05060b]/95 backdrop-blur-xl',
    footerBorder: 'border-white/[0.08]',
    footerText: 'text-slate-500',
  },
  midnight: {
    name: 'Midnight Cyber AI',
    iconBg: 'bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-[0_0_20px_rgba(99,102,241,0.45)]',
    pageBg: 'bg-[#070a14]',
    ambientSpotlight: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99, 102, 241, 0.18) 0%, transparent 75%)',
    orb1: 'from-indigo-600/35 via-purple-600/30 to-transparent',
    orb2: 'from-blue-600/25 via-violet-700/20 to-transparent',
    orb3: 'from-cyan-500/20 via-indigo-600/15 to-transparent',
    arcBorder: 'border-t-2 border-indigo-500/90',
    arcGlow: 'shadow-[0_-20px_70px_rgba(99,102,241,0.65),0_-3px_25px_rgba(129,140,248,0.9)]',
    titleGradient: 'from-indigo-400 via-blue-300 to-violet-400 drop-shadow-[0_0_40px_rgba(99,102,241,0.4)]',
    primaryBtn: 'bg-gradient-to-r from-indigo-600 via-blue-500 to-violet-600 hover:from-indigo-500 hover:via-blue-400 hover:to-violet-500 text-white shadow-[0_0_35px_rgba(99,102,241,0.5)] border border-indigo-400/40',
    cardBg: 'bg-slate-900/75 backdrop-blur-2xl border border-white/[0.08] shadow-2xl hover:border-indigo-400/50 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.25)]',
    headerBg: 'bg-[#070a14]/85 backdrop-blur-xl',
    headerBorder: 'border-white/[0.08]',
    badge: 'bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.2)]',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-400',
    tableBg: 'bg-slate-900/80 backdrop-blur-2xl border border-white/[0.08] shadow-2xl',
    tableBorder: 'border-white/[0.06]',
    tableHeader: 'text-slate-400 border-white/[0.08]',
    tableRowHover: 'hover:bg-white/[0.03]',
    navBtn: 'text-slate-300 hover:text-white hover:bg-white/[0.05]',
    footerBg: 'bg-[#070a14]/95 backdrop-blur-xl',
    footerBorder: 'border-white/[0.08]',
    footerText: 'text-slate-500',
  },
  lavender: {
    name: 'Lavender Frost (Light)',
    iconBg: 'bg-indigo-600',
    pageBg: 'bg-[#faf8ff]',
    ambientSpotlight: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99, 102, 241, 0.12) 0%, transparent 75%)',
    orb1: 'from-purple-400/35 via-indigo-300/30 to-pink-300/25',
    orb2: 'from-blue-400/30 via-violet-300/25 to-cyan-300/20',
    orb3: 'from-indigo-300/25 to-pink-200/20',
    arcBorder: 'border-t-2 border-indigo-400/70',
    arcGlow: 'shadow-[0_-15px_50px_rgba(99,102,241,0.35)]',
    titleGradient: 'from-blue-600 via-indigo-600 to-violet-600',
    primaryBtn: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 border border-indigo-300/30',
    cardBg: 'bg-white/85 backdrop-blur-xl border border-indigo-100/90 shadow-[0_8px_30px_rgb(99,102,241,0.06)] hover:border-indigo-300/80 hover:shadow-indigo-500/15',
    headerBg: 'bg-white/75 backdrop-blur-md',
    headerBorder: 'border-indigo-100/80',
    badge: 'bg-indigo-50/90 border border-indigo-200/80 text-indigo-700 shadow-sm shadow-indigo-100/50',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    tableBg: 'bg-white/85 backdrop-blur-xl border border-indigo-100/80 shadow-md shadow-indigo-500/5',
    tableBorder: 'border-indigo-100/80',
    tableHeader: 'text-slate-500 border-indigo-100/80',
    tableRowHover: 'hover:bg-indigo-50/40',
    navBtn: 'text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60',
    footerBg: 'bg-white/70 backdrop-blur-md',
    footerBorder: 'border-indigo-100/80',
    footerText: 'text-slate-500',
  },
  sunset: {
    name: 'Sunset Glow',
    iconBg: 'bg-orange-500',
    pageBg: 'bg-[#fffaf6]',
    ambientSpotlight: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(249, 115, 22, 0.12) 0%, transparent 75%)',
    orb1: 'from-rose-400/35 via-orange-300/30 to-amber-200/25',
    orb2: 'from-purple-400/25 via-pink-300/25 to-yellow-200/20',
    orb3: 'from-orange-300/25 to-rose-200/20',
    arcBorder: 'border-t-2 border-orange-400/70',
    arcGlow: 'shadow-[0_-15px_50px_rgba(249,115,22,0.35)]',
    titleGradient: 'from-rose-500 via-orange-500 to-amber-500',
    primaryBtn: 'bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 border border-orange-300/30',
    cardBg: 'bg-white/85 backdrop-blur-xl border border-orange-100/90 shadow-[0_8px_30px_rgb(251,146,60,0.06)] hover:border-orange-300/80 hover:shadow-orange-500/15',
    headerBg: 'bg-white/75 backdrop-blur-md',
    headerBorder: 'border-orange-100/80',
    badge: 'bg-orange-50/90 border border-orange-200/80 text-orange-700 shadow-sm shadow-orange-100/50',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    tableBg: 'bg-white/85 backdrop-blur-xl border border-orange-100/80 shadow-md shadow-orange-500/5',
    tableBorder: 'border-orange-100/80',
    tableHeader: 'text-slate-500 border-orange-100/80',
    tableRowHover: 'hover:bg-orange-50/40',
    navBtn: 'text-slate-700 hover:text-orange-600 hover:bg-orange-50/60',
    footerBg: 'bg-white/70 backdrop-blur-md',
    footerBorder: 'border-orange-100/80',
    footerText: 'text-slate-500',
  },
  sage: {
    name: 'Emerald Sage',
    iconBg: 'bg-emerald-600',
    pageBg: 'bg-[#f7fcf9]',
    ambientSpotlight: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(16, 185, 129, 0.12) 0%, transparent 75%)',
    orb1: 'from-emerald-400/30 via-teal-300/25 to-cyan-200/20',
    orb2: 'from-green-400/25 via-lime-200/25 to-sky-200/20',
    orb3: 'from-teal-300/20 to-emerald-200/20',
    arcBorder: 'border-t-2 border-emerald-400/70',
    arcGlow: 'shadow-[0_-15px_50px_rgba(16,185,129,0.35)]',
    titleGradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    primaryBtn: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-lg shadow-emerald-500/25 border border-emerald-300/30',
    cardBg: 'bg-white/85 backdrop-blur-xl border border-emerald-100/90 shadow-[0_8px_30px_rgb(16,185,129,0.06)] hover:border-emerald-300/80 hover:shadow-emerald-500/15',
    headerBg: 'bg-white/75 backdrop-blur-md',
    headerBorder: 'border-emerald-100/80',
    badge: 'bg-emerald-50/90 border border-emerald-200/80 text-emerald-700 shadow-sm shadow-emerald-100/50',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    tableBg: 'bg-white/85 backdrop-blur-xl border border-emerald-100/80 shadow-md shadow-emerald-500/5',
    tableBorder: 'border-emerald-100/80',
    tableHeader: 'text-slate-500 border-emerald-100/80',
    tableRowHover: 'hover:bg-emerald-50/40',
    navBtn: 'text-slate-700 hover:text-emerald-600 hover:bg-emerald-50/60',
    footerBg: 'bg-white/70 backdrop-blur-md',
    footerBorder: 'border-emerald-100/80',
    footerText: 'text-slate-500',
  }
};

export const LandingPage: React.FC = () => {
  const { user, login, register, demoLogin } = useAuth();
  const navigate = useNavigate();

  // Default to 'eclipse' matching the Pinterest reference image!
  const [theme, setTheme] = useState<AestheticTheme>(() => {
    return (localStorage.getItem('ai_careerpath_theme') as AestheticTheme) || 'eclipse';
  });

  const [showPaletteMenu, setShowPaletteMenu] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = THEMES[theme] || THEMES.eclipse;

  const handleThemeChange = (newTheme: AestheticTheme) => {
    setTheme(newTheme);
    localStorage.setItem('ai_careerpath_theme', newTheme);
    setShowPaletteMenu(false);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let sanitizedEmail = email.trim();
    if (!sanitizedEmail.includes('@')) {
      setError('Please enter a valid email address with @ (e.g. bhuvan@gmail.com)');
      return;
    }
    // Auto-complete if domain extension was omitted (e.g. bhuvan@123 -> bhuvan@123.com)
    if (sanitizedEmail.includes('@') && !sanitizedEmail.split('@')[1].includes('.')) {
      sanitizedEmail = `${sanitizedEmail}.com`;
    }

    setLoading(true);
    try {
      if (authMode === 'register') {
        await register(sanitizedEmail, password, fullName.trim() || 'Student');
      } else {
        await login(sanitizedEmail, password);
      }
      navigate('/overview');
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Registration failed. Please check your credentials.');
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
      <div className={`min-h-screen ${t.pageBg} relative overflow-hidden flex flex-col items-center justify-center p-4 transition-colors duration-500`}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none -z-10" style={{ background: t.ambientSpotlight }} />
        <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-orange-600/30 via-amber-500/20 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className={`${t.cardBg} p-8 rounded-3xl border max-w-md w-full text-center relative z-10 transition-all duration-300`}>
          <div className={`w-14 h-14 rounded-2xl ${t.iconBg} text-white flex items-center justify-center mx-auto mb-4 font-bold text-xl`}>
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className={`text-2xl font-bold ${t.textPrimary} mb-2 tracking-tight`}>Welcome back, {user.full_name}</h2>
          <p className={`text-sm ${t.textSecondary} mb-6`}>Your personalized career roadmap session is ready.</p>
          <button
            onClick={() => navigate('/overview')}
            className={`w-full ${t.primaryBtn} py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5`}
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${t.pageBg} relative overflow-hidden flex flex-col font-sans transition-colors duration-500 selection:bg-orange-500 selection:text-white`}>
      {/* Top Ambient Cosmic Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 transition-all duration-700"
        style={{ background: t.ambientSpotlight }}
      />

      {/* Radiant Glow Halos in Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[700px] pointer-events-none -z-10 overflow-hidden">
        <div className={`absolute -top-36 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr ${t.orb1} blur-[110px]`} />
        <div className={`absolute -top-20 right-1/4 w-[550px] h-[550px] rounded-full bg-gradient-to-bl ${t.orb2} blur-[110px]`} />
        <div className={`absolute top-64 left-1/3 w-[650px] h-[450px] rounded-full bg-gradient-to-r ${t.orb3} blur-[130px]`} />
      </div>

      {/* Cyber Dot-Grid Pattern */}
      <div
        className="absolute inset-0 bg-[radial-gradient(#ffffff0f_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10"
      />

      {/* Navigation Header */}
      <header className={`border-b ${t.headerBorder} ${t.headerBg} sticky top-0 z-40 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl ${t.iconBg} text-white flex items-center justify-center font-bold text-lg`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className={`font-bold ${t.textPrimary} text-base tracking-tight leading-none`}>Smart Roadmap</span>
              <span className={`block text-[11px] ${t.textSecondary} font-medium`}>AI Career Guidance System</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Aesthetic Theme Palette Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowPaletteMenu(!showPaletteMenu)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border ${t.headerBorder} ${t.navBtn} transition-all shadow-sm`}
                title="Change aesthetic background theme"
              >
                <Palette className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{t.name}</span>
              </button>

              {showPaletteMenu && (
                <div className={`absolute right-0 mt-2 w-52 rounded-2xl ${t.cardBg} border ${t.headerBorder} p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200`}>
                  <div className={`px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider ${t.textSecondary}`}>
                    Aesthetic Themes
                  </div>
                  {(Object.keys(THEMES) as AestheticTheme[]).map((themeKey) => (
                    <button
                      key={themeKey}
                      onClick={() => handleThemeChange(themeKey)}
                      className={`w-full text-left px-2.5 py-2 text-xs font-medium rounded-xl flex items-center justify-between transition-colors ${
                        theme === themeKey
                          ? 'bg-orange-500 text-white font-semibold shadow-md shadow-orange-500/30'
                          : `${t.textPrimary} hover:bg-white/[0.08]`
                      }`}
                    >
                      <span>{THEMES[themeKey].name}</span>
                      {theme === themeKey && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/verify-certificate"
              className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors hidden sm:inline-block ${t.navBtn}`}
            >
              Verify Certificate
            </Link>

            <button
              onClick={() => { setAuthMode('login'); setError(''); }}
              className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${t.navBtn}`}
            >
              Sign In
            </button>

            <button
              onClick={() => { setAuthMode('register'); setError(''); }}
              className={`text-xs font-semibold ${t.primaryBtn} px-4 py-2 rounded-xl transition-all`}
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-12 md:pt-24 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 flex flex-col justify-center text-center relative z-10">
        <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold ${t.textPrimary} tracking-tight max-w-4xl mx-auto leading-[1.15] transition-colors`}>
          Navigate Your Tech Career with{' '}
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${t.titleGradient}`}>
            Adaptive AI Roadmaps
          </span>
        </h1>

        <p className={`mt-6 text-base sm:text-lg ${t.textSecondary} max-w-2xl mx-auto leading-relaxed transition-colors`}>
          Solve real career uncertainty with server-scored diagnostic assessments, evidence-based skill gap analysis, prerequisite-ordered roadmaps, and verifiable milestone certificates.
        </p>

        {/* CTA Buttons */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto w-full">
          <button
            onClick={handleDemoAccess}
            disabled={loading}
            className={`w-full sm:w-auto ${t.primaryBtn} px-7 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-semibold`}
          >
            <UserCheck className="w-5 h-5" />
            <span>Explore Demo: Chaithanya (3rd Year CSE)</span>
          </button>

          <button
            onClick={() => { setAuthMode('register'); setError(''); }}
            className={`w-full sm:w-auto ${t.cardBg} ${t.textPrimary} font-semibold px-6 py-3.5 rounded-xl border flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-sm`}
          >
            <span>Create Student Account</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* CELESTIAL ECLIPSE HORIZON ARC & EMERGING DASHBOARD (FROM PINTEREST REFERENCE) */}
        <div className="relative w-full max-w-5xl mx-auto mt-12 sm:mt-16">
          {/* Glowing Planetary Curved Horizon Arc */}
          <div className="relative w-full h-[100px] sm:h-[130px] overflow-hidden pointer-events-none">
            {/* The burning curved arc border */}
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-[700px] sm:w-[950px] md:w-[1100px] h-[700px] sm:h-[950px] md:h-[1100px] rounded-full ${t.arcBorder} ${t.arcGlow} bg-gradient-to-b from-orange-500/20 via-transparent to-transparent transition-all duration-700`}
            >
              {/* Inner rim light */}
              <div className="w-full h-full rounded-full border-t border-amber-200/90 blur-[1px]" />
            </div>
            {/* Soft upward spotlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[90px] bg-gradient-to-b from-orange-500/35 to-transparent blur-3xl pointer-events-none" />
          </div>

          {/* Futuristic Dark Glass Dashboard Preview Card */}
          <div className={`relative rounded-3xl ${t.cardBg} p-6 sm:p-8 text-left transition-all duration-500 shadow-2xl border border-white/[0.1]`}>
            {/* Top Bar of Dashboard Preview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-white/[0.08] gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`font-bold text-sm sm:text-base ${t.textPrimary}`}>Welcome, Chaithanya C!</h4>
                  <p className={`text-xs ${t.textSecondary}`}>3rd Year CSE • Target: Full-Stack Developer</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Roadmap Active</span>
              </div>
            </div>

            {/* Dashboard Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <span className={`block text-[11px] font-medium ${t.textSecondary}`}>Roadmap Progress</span>
                <span className="text-xl sm:text-2xl font-extrabold text-white mt-1 block">10%</span>
                <div className="w-full h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
                  <div className="w-[10%] h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <span className={`block text-[11px] font-medium ${t.textSecondary}`}>Tasks Completed</span>
                <span className="text-xl sm:text-2xl font-extrabold text-white mt-1 block">1 / 10</span>
                <p className="text-[10px] text-amber-400 mt-1">9 milestones pending</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <span className={`block text-[11px] font-medium ${t.textSecondary}`}>Weekly Study Target</span>
                <span className="text-xl sm:text-2xl font-extrabold text-white mt-1 block">14h / wk</span>
                <p className="text-[10px] text-slate-400 mt-1">~2 hours per day</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <span className={`block text-[11px] font-medium ${t.textSecondary}`}>Overall Career Match</span>
                <span className="text-xl sm:text-2xl font-extrabold text-orange-400 mt-1 block">32.9%</span>
                <p className="text-[10px] text-slate-400 mt-1">Based on diagnostic</p>
              </div>
            </div>

            {/* Next Recommended Action Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-transparent border border-orange-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block mb-1">
                  STAGE 1: FOUNDATIONS • NEXT RECOMMENDED TASK
                </span>
                <h5 className={`font-semibold text-sm ${t.textPrimary}`}>
                  Git &amp; GitHub Version Control Workflow
                </h5>
                <p className={`text-xs ${t.textSecondary} mt-0.5`}>
                  Establish command-line Git proficiency: branches, commits, staging, and pull requests.
                </p>
              </div>
              <button
                onClick={handleDemoAccess}
                className="shrink-0 bg-white/[0.08] hover:bg-orange-500 text-white hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border border-white/10 hover:border-orange-500 flex items-center gap-1.5 shadow-sm"
              >
                <span>Resume Learning</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className={`p-6 rounded-3xl ${t.cardBg} transition-all duration-300 hover:-translate-y-1`}>
            <div className="w-11 h-11 rounded-2xl bg-orange-500/15 border border-orange-500/25 text-orange-400 flex items-center justify-center mb-4 font-bold shadow-[0_0_15px_rgba(249,115,22,0.2)]">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className={`font-bold ${t.textPrimary} text-base mb-1.5`}>Explainable Career Matching</h3>
            <p className={`text-xs ${t.textSecondary} leading-relaxed`}>
              Explore 12 major engineering domains. Get transparent match estimates based on your academic interests, existing skills, and assessment evidence.
            </p>
          </div>

          <div className={`p-6 rounded-3xl ${t.cardBg} transition-all duration-300 hover:-translate-y-1`}>
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center mb-4 font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Map className="w-5 h-5" />
            </div>
            <h3 className={`font-bold ${t.textPrimary} text-base mb-1.5`}>Prerequisite-Aware Roadmaps</h3>
            <p className={`text-xs ${t.textSecondary} leading-relaxed`}>
              Stage-by-stage learning schedules generated with Google Gemini and verified rule fallbacks. Locked tasks automatically unlock as dependencies are mastered.
            </p>
          </div>

          <div className={`p-6 rounded-3xl ${t.cardBg} transition-all duration-300 hover:-translate-y-1`}>
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center mb-4 font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Award className="w-5 h-5" />
            </div>
            <h3 className={`font-bold ${t.textPrimary} text-base mb-1.5`}>Verifiable PDF Certificates</h3>
            <p className={`text-xs ${t.textSecondary} leading-relaxed`}>
              Earn downloadable certificates with unique verification IDs and QR codes. Verifiable on a dedicated public verification portal.
            </p>
          </div>
        </div>

        {/* Problem vs Solution Comparison Table */}
        <div className={`mt-16 rounded-3xl ${t.tableBg} p-6 md:p-8 text-left transition-all duration-300`}>
          <h2 className={`text-xl font-bold ${t.textPrimary} mb-2 tracking-tight`}>College Problem Solving Architecture</h2>
          <p className={`text-xs ${t.textSecondary} mb-6`}>Designed to replace generic career advice with measurable, transparent learning.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={`border-b ${t.tableHeader} font-semibold uppercase tracking-wider text-[11px]`}>
                  <th className="py-3 px-4 text-left">Real Problem Students Face</th>
                  <th className="py-3 px-4 text-left">Our Implemented Solution</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${t.tableBorder} ${t.textSecondary}`}>
                <tr className={`transition-colors ${t.tableRowHover}`}>
                  <td className={`py-3.5 px-4 font-medium ${t.textPrimary}`}>Generic career recommendations</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Explainable scoring model with matching &amp; missing skills breakdown</span>
                  </td>
                </tr>
                <tr className={`transition-colors ${t.tableRowHover}`}>
                  <td className={`py-3.5 px-4 font-medium ${t.textPrimary}`}>Unknown baseline skill level</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Server-scored diagnostic assessment with protected answer keys</span>
                  </td>
                </tr>
                <tr className={`transition-colors ${t.tableRowHover}`}>
                  <td className={`py-3.5 px-4 font-medium ${t.textPrimary}`}>Random learning without sequence</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Prerequisite-locked roadmap stages adapted to student's weekly study budget</span>
                  </td>
                </tr>
                <tr className={`transition-colors ${t.tableRowHover}`}>
                  <td className={`py-3.5 px-4 font-medium ${t.textPrimary}`}>Unverifiable resume certificates</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Cryptographically hashed certificates with public verification portal</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t ${t.footerBorder} ${t.footerBg} py-6 text-center text-xs ${t.footerText} relative z-10 transition-colors`}>
        <p>AI Career &amp; Smart Roadmap System</p>
      </footer>

      {/* Authentication Modal */}
      {authMode && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e1320] rounded-3xl border border-white/10 shadow-2xl max-w-md w-full p-6 sm:p-7 relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-1 tracking-tight">
              {authMode === 'register' ? 'Create Student Account' : 'Welcome Back'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              {authMode === 'register' ? 'Register to start your personalized roadmap.' : 'Enter your credentials to access your dashboard.'}
            </p>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Chaithanya C"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all bg-white/[0.04] text-white placeholder-slate-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. bhuvan@gmail.com"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all bg-white/[0.04] text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all bg-white/[0.04] text-white placeholder-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 hover:from-orange-500 hover:to-orange-500 text-white font-semibold py-3 rounded-xl text-xs shadow-lg shadow-orange-500/25 transition-all mt-2 active:scale-[0.99] border border-orange-400/40"
              >
                {loading ? 'Processing...' : (authMode === 'register' ? 'Register Account' : 'Sign In')}
              </button>
            </form>

            <div className="mt-4 text-center">
              {authMode === 'register' ? (
                <button
                  onClick={() => setAuthMode('login')}
                  className="text-xs text-orange-400 hover:text-orange-300 hover:underline font-semibold"
                >
                  Already have an account? Sign in
                </button>
              ) : (
                <button
                  onClick={() => setAuthMode('register')}
                  className="text-xs text-orange-400 hover:text-orange-300 hover:underline font-semibold"
                >
                  Need an account? Register
                </button>
              )}
            </div>

            <button
              onClick={() => setAuthMode(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-sm font-bold transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
