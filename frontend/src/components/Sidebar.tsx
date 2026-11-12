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
  ChevronRight,
  BrainCircuit,
  LogOut,
  Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  name: string;
  to: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'Resume Manager', to: '/resumes', icon: FileText },
  { name: 'Resume Intelligence', to: '/analysis', icon: ScanSearch },
  { name: 'Job Matcher', to: '/jobs', icon: Briefcase },
  { name: 'Skill Gap Analyser', to: '/skill-gaps', icon: AlertTriangle },
  { name: 'Career Recommendations', to: '/recommendations', icon: Compass },
  { name: 'Learning Roadmap', to: '/roadmaps', icon: Map },
  { name: 'Resume Improvement', to: '/improve', icon: Sparkles },
  { name: 'Career Onboarding', to: '/onboarding', icon: Target },
  { name: 'Profile & Settings', to: '/profile', icon: UserCheck },
];

export const Sidebar: React.FC = () => {
  const { user, logout, activeResumeId } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
          <BrainCircuit className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold text-slate-900 tracking-tight text-lg">CareerTwin</span>
          <span className="text-xs font-bold text-indigo-600 ml-1 px-1.5 py-0.5 bg-indigo-50 rounded">AI</span>
        </div>
      </div>

      {/* Active Resume Status Indicator */}
      <div className="px-4 py-3 mx-3 my-2 bg-slate-50 border border-slate-200/60 rounded-xl">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-medium">Active Workspace</span>
          <span className={`w-2 h-2 rounded-full ${activeResumeId ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
        </div>
        <p className="text-xs font-semibold text-slate-700 truncate">
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
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-indigo-600" />
                <span className="truncate">{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/60 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
              {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.full_name || 'Candidate'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

