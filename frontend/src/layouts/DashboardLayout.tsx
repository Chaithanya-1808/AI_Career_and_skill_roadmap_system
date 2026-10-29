import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Compass, CheckSquare, Target, Map, Calendar,
  FolderGit2, BookOpen, Award, ShieldCheck, UserCheck, Settings,
  LogOut, Menu, X, Users, ShieldAlert, Sparkles, ExternalLink
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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 fixed inset-y-0 z-30">
        {/* Brand */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link to="/overview" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm tracking-tight leading-none">Smart Roadmap</h1>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Career Guidance System</p>
            </div>
          </Link>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-3.5 mx-3 mt-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
              {user.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{user.full_name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user.target_job_role || 'Student'}</p>
            </div>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
              {roles[0] || 'Student'}
            </span>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Main Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
              <p className="px-3 pt-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Faculty & Mentorship</p>
              <NavLink
                to="/mentor"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Mentor Dashboard</span>
              </NavLink>
            </>
          )}

          {isAdmin && (
            <>
              <p className="px-3 pt-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Administration</p>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-amber-50 text-amber-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Admin & Audits</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          <Link
            to="/verify-certificate"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Verify Certificates</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <Link to="/overview" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">Smart Roadmap</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-64 bg-white h-full flex flex-col py-4 px-3" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 px-2">
                <span className="font-bold text-slate-900 text-sm">Navigation</span>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-5 h-5 text-slate-500" />
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
                        `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg ${
                          isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 rounded-lg"
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
