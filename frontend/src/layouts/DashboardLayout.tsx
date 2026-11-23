import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Compass, CheckSquare, Target, Map, Calendar,
  FolderGit2, BookOpen, Award, ShieldCheck, UserCheck, Settings,
  LogOut, Menu, X, Users, ShieldAlert, Sparkles, ExternalLink, Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/overview', label: 'Overview', icon: LayoutDashboard },
    { to: '/careers', label: 'Career Explorer', icon: Compass },
    { to: '/assessments', label: 'Assessments', icon: CheckSquare },
    { to: '/skill-gap', label: 'Skill Gap Analysis', icon: Target },
    { to: '/roadmap', label: 'My Roadmap', icon: Map },
    { to: '/planner', label: 'Weekly Study Planner', icon: Calendar },
    { to: '/projects', label: 'Projects & Portfolio', icon: FolderGit2 },
    { to: '/resources', label: 'Learning Resources', icon: BookOpen },
    { to: '/certificates', label: 'Certificates', icon: Award },
    { to: '/integrity', label: 'Integrity & Privacy', icon: ShieldCheck },
    { to: '/profile', label: 'Profile & Settings', icon: Settings },
  ];

  const roles = user?.roles || [];
  const isAdmin = roles.includes('admin');
  const isMentor = roles.includes('mentor');

  return (
    <div className="min-h-screen bg-[#05060b] text-slate-100 flex relative selection:bg-orange-500 selection:text-white">
      {/* Subtle top ambient spotlight */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(249, 115, 22, 0.08) 0%, transparent 70%)'
        }}
      />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#080b14]/95 backdrop-blur-2xl border-r border-white/[0.08] fixed inset-y-0 z-30 shadow-2xl">
        {/* Brand */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <Link to="/overview" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-[0_0_20px_rgba(249,115,22,0.45)] group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm tracking-tight leading-none">Smart Roadmap</h1>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Career Guidance System</p>
            </div>
          </Link>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-3.5 mx-3 mt-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3 shadow-inner">
            <div className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 font-bold flex items-center justify-center text-sm shadow-[0_0_15px_rgba(249,115,22,0.3)]">
              {user.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.target_job_role || 'Student'}</p>
            </div>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30">
              {roles[0] || 'Student'}
            </span>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Main Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-transparent text-orange-400 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)] font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}

          {/* Role specific navigation */}
          {(isMentor || isAdmin) && (
            <>
              <p className="px-3 pt-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Faculty & Mentorship</p>
              <NavLink
                to="/mentor"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500/20 to-transparent text-orange-400 border border-orange-500/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`
                }
              >
                <Users className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Mentor Dashboard</span>
              </NavLink>
            </>
          )}

          {isAdmin && (
            <>
              <p className="px-3 pt-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Administration</p>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500/20 to-transparent text-orange-400 border border-orange-500/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`
                }
              >
                <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Admin & Audits</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-white/[0.08] space-y-1.5">
          <a
            href="/AI_CareerPath_Complete_Project_Report.pdf"
            download="AI_CareerPath_Complete_Project_Report.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-orange-400 bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 rounded-xl transition-colors shadow-sm"
            title="Download the official comprehensive Project Report (Chapters 1-9 & Appendices)"
          >
            <Download className="w-4 h-4 text-orange-400 shrink-0" />
            <span>Download Project Report</span>
          </a>
          <Link
            to="/verify-certificate"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] rounded-xl transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Verify Certificates</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-950/30 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden bg-[#080b14]/95 backdrop-blur-xl border-b border-white/[0.08] px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <Link to="/overview" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(249,115,22,0.4)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm">Smart Roadmap</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-white/[0.06]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/75 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-64 bg-[#080b14] h-full flex flex-col py-4 px-3 border-r border-white/[0.08]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] px-2">
                <span className="font-bold text-white text-sm">Navigation</span>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="flex-1 py-3 overflow-y-auto space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl ${
                          isActive ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold' : 'text-slate-400'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-white/[0.08] space-y-1">
                <a
                  href="/AI_CareerPath_Complete_Project_Report.pdf"
                  download="AI_CareerPath_Complete_Project_Report.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-orange-400 bg-orange-500/15 rounded-xl"
                >
                  <Download className="w-4 h-4 text-orange-400" />
                  <span>Download Project Report</span>
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Outlet */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
