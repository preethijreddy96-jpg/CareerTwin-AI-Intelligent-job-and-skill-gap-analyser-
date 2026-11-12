import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Bell, ShieldCheck, Sparkles } from 'lucide-react';

interface NavbarProps {
  title: string;
  subtitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title, subtitle }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* ML Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>NLP & MiniLM Model Active</span>
        </div>

        {/* User badge */}
        <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <span className="block text-xs font-bold text-slate-700">{user?.full_name}</span>
            <span className="block text-[10px] text-slate-400">{user?.profile?.target_role || 'Job Seeker'}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs">
            <User className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </div>
    </header>
  );
};

