import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { BrainCircuit, CheckCircle2 } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Marketing Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/30 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">CareerTwin AI</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
            Next-Gen AI Career Assistant
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Understand Your Skills. Discover Your Career Fit. Become Job-Ready.
          </h2>
          <p className="text-indigo-200 text-sm leading-relaxed">
            Harness transparent NLP skill extraction, ESCO/O*NET taxonomies, and explainable sentence transformer matching.
          </p>

          <div className="space-y-3 pt-4">
            {[
              'Sentence Transformer & TF-IDF hybrid matching',
              'Explainable compatibility scores with breakdown',
              'Zero fake metrics – 100% database-backed analytics',
              'Structured personalized learning roadmaps'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-indigo-100 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-indigo-300">
          CareerTwin AI © 2026. Empowering candidates with truthful career intelligence.
        </div>
      </div>

      {/* Right Content Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-slate-50">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

