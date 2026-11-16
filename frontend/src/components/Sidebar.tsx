import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ScanSearch,
  Briefcase,
  AlertTriangle,
  Compass,
  Map,
  Sparkles,
  UserCheck,
  BrainCircuit,
  LogOut,
  Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  name: string;
  to: string;
  icon: React.ElementType;
  colorClass: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, colorClass: 'text-sky-400' },
  { name: 'Resume Manager', to: '/resumes', icon: FileText, colorClass: 'text-indigo-400' },
  { name: 'Resume Intelligence', to: '/analysis', icon: ScanSearch, colorClass: 'text-purple-400' },
  { name: 'Job Matcher', to: '/jobs', icon: Briefcase, colorClass: 'text-amber-400' },
  { name: 'Skill Gap Analyser', to: '/skill-gaps', icon: AlertTriangle, colorClass: 'text-rose-400' },
  { name: 'Career Recommendations', to: '/recommendations', icon: Compass, colorClass: 'text-emerald-400' },
  { name: 'Learning Roadmap', to: '/roadmaps', icon: Map, colorClass: 'text-teal-400' },
  { name: 'Resume Improvement', to: '/improve', icon: Sparkles, colorClass: 'text-pink-400' },
  { name: 'Career Onboarding', to: '/onboarding', icon: Target, colorClass: 'text-blue-400' },
  { name: 'Profile & Settings', to: '/profile', icon: UserCheck, colorClass: 'text-slate-300' },
];

export const Sidebar: React.FC = () => {
  const { user, logout, activeResumeId } = useAuth();

  return (
    <aside className="w-64 bg-[#1c204c] border-r border-[#2a2f6c]/60 flex flex-col h-screen sticky top-0 shrink-0 z-30 shadow-2xl shadow-indigo-950/50">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
          <BrainCircuit className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold text-white tracking-tight text-lg">CareerTwin</span>
          <span className="text-[10px] font-extrabold text-indigo-200 ml-1.5 px-1.5 py-0.5 bg-indigo-500/30 border border-indigo-400/40 rounded-md">
            AI
          </span>
        </div>
      </div>

      {/* Active Resume Status Indicator */}
      <div className="px-4 py-3 mx-3 my-2.5 bg-white/[0.07] border border-white/10 rounded-xl backdrop-blur-sm shadow-inner">
        <div className="flex items-center justify-between text-xs text-indigo-200/70 mb-1">
          <span className="font-semibold text-[11px] uppercase tracking-wider">Active Workspace</span>
          <span
            className={`w-2 h-2 rounded-full ${
              activeResumeId ? 'bg-emerald-400 shadow-sm shadow-emerald-400/80' : 'bg-amber-400 shadow-sm shadow-amber-400/80'
            }`}
          ></span>
        </div>
        <p className="text-xs font-bold text-white truncate">
          {activeResumeId ? `Active Resume #${activeResumeId}` : 'No resume selected'}
        </p>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold shadow-md shadow-indigo-950/60 border border-indigo-400/40'
                    : 'text-indigo-100/75 hover:text-white hover:bg-white/[0.08]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-white' : item.colorClass
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/40 text-indigo-200 border border-indigo-400/30">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-white/10 bg-[#161a40]">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.07] border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm">
              {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.full_name || 'Candidate'}</p>
              <p className="text-[10px] text-indigo-200/60 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 rounded-lg text-indigo-200/70 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
