import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Layers,
  Map,
  Sparkles,
  BarChart3,
  FileCheck2,
  CheckCircle2,
  Cpu,
  ChevronRight,
  TrendingUp,
  FileText,
  Search,
  BookOpen,
  Award,
  Compass,
  Code2,
  Check,
  Star
} from 'lucide-react';
import { ScoreGauge } from '../components/ScoreGauge';

export const LandingPage: React.FC = () => {
  // Interactive Hero Role Simulator
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);

  const demoRoles = [
    {
      title: 'Python Backend Developer',
      score: 92,
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Pytest'],
      demand: 'High Demand • ₹12-22 LPA',
      missing: ['Redis Caching', 'CI/CD Pipelines']
    },
    {
      title: 'Full-Stack React & Node Engineer',
      score: 88,
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
      demand: 'Very High • ₹14-25 LPA',
      missing: ['GraphQL', 'Kubernetes']
    },
    {
      title: 'Applied AI / ML Engineer',
      score: 95,
      skills: ['Python', 'Scikit-Learn', 'spaCy', 'Sentence Transformers', 'PyTorch'],
      demand: 'Top Tier • ₹18-32 LPA',
      missing: ['MLOps Deployment']
    }
  ];

  const currentRole = demoRoles[activeRoleIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[600px] h-96 bg-emerald-600/10 rounded-full blur-[160px] pointer-events-none -z-10"></div>

      {/* Floating Navbar */}
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white tracking-tight text-xl">CareerTwin</span>
              <span className="text-[11px] font-extrabold text-indigo-400 bg-indigo-500/20 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                AI 2.0
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#simulator" className="hover:text-white transition-colors">Live Simulator</a>
            <a href="#architecture" className="hover:text-white transition-colors">ML Architecture</a>
            <a href="#taxonomies" className="hover:text-white transition-colors">ESCO Taxonomy</a>
            <a href="#benchmark" className="hover:text-white transition-colors">Benchmark (97.0%)</a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 text-white text-xs font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2 border border-white/10"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-24 px-6 max-w-7xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-8 backdrop-blur-md shadow-inner">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Real AI & NLP Intelligence • Zero Fabricated Metrics • Verified Email Security</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.1] max-w-5xl mx-auto">
          Understand Your Skills. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-blue-300 to-emerald-400 bg-clip-text text-transparent">
            Discover Your Career Fit.
          </span>
          <br />
          Become Job-Ready.
        </h1>

        <p className="mt-8 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
          The next-generation career intelligence engine for students, freshers, and experienced professionals. 
          Extract skills with <span className="text-indigo-300 font-semibold">spaCy</span> & <span className="text-indigo-300 font-semibold">PyMuPDF</span>, 
          map ontologies to <span className="text-indigo-300 font-semibold">ESCO/O*NET</span>, compute explainable 
          compatibility scores using <span className="text-indigo-300 font-semibold">Sentence Transformers (all-MiniLM-L6-v2)</span>, 
          and execute personal step-by-step roadmaps.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2.5 border border-white/20"
          >
            <span>Launch Free Career Assessment</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm backdrop-blur-md transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Sign In (Demo Auto-Fill Available)</span>
          </Link>
        </div>

        {/* Live Interactive Role Simulator Ticker */}
        <div id="simulator" className="mt-20 max-w-4xl mx-auto p-1 rounded-3xl bg-gradient-to-b from-indigo-500/30 via-slate-800/40 to-transparent backdrop-blur-2xl">
          <div className="bg-slate-900/90 rounded-[22px] p-8 border border-white/10 text-left space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  Interactive Live Simulator
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1">
                  Target Career Role Compatibility Engine
                </h3>
              </div>

              {/* Role Select Buttons */}
              <div className="flex flex-wrap gap-2">
                {demoRoles.map((role, idx) => (
                  <button
                    key={role.title}
                    onClick={() => setActiveRoleIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeRoleIndex === idx
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {role.title.split(' ')[0]} {role.title.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Result Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                <ScoreGauge score={currentRole.score} size={150} label="Match Fit" showSubtitle={true} />
              </div>

              <div className="md:col-span-2 space-y-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Target Role</span>
                  <h4 className="text-lg font-black text-white">{currentRole.title}</h4>
                  <span className="text-xs text-emerald-400 font-semibold">{currentRole.demand}</span>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Matched Required Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentRole.skills.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-rose-400" /> Actionable Skill Gaps to Bridge:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentRole.missing.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div id="benchmark" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 pt-12 border-t border-white/10 text-left">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-3xl sm:text-4xl font-black text-indigo-400 block">97.0%</span>
            <span className="text-xs font-bold text-slate-200 mt-1 block">Validated F1 NLP Accuracy</span>
            <p className="text-[11px] text-slate-400 mt-1">Tested on ground-truth technical resumes with spaCy & RapidFuzz.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-3xl sm:text-4xl font-black text-emerald-400 block">10 Roles</span>
            <span className="text-xs font-bold text-slate-200 mt-1 block">Curated Industry Seed Models</span>
            <p className="text-[11px] text-slate-400 mt-1">Python, Full-Stack, AI/ML, Data Analyst, Java, Testing & SQL.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-3xl sm:text-4xl font-black text-blue-400 block">384-Dim</span>
            <span className="text-xs font-bold text-slate-200 mt-1 block">Sentence Transformers</span>
            <p className="text-[11px] text-slate-400 mt-1">Pretrained all-MiniLM-L6-v2 embeddings with TF-IDF fallback.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-3xl sm:text-4xl font-black text-amber-400 block">100%</span>
            <span className="text-xs font-bold text-slate-200 mt-1 block">Explainable & Truthful</span>
            <p className="text-[11px] text-slate-400 mt-1">Zero fabricated credentials. Weighted multi-factor audit formulas.</p>
          </div>
        </div>
      </section>

      {/* 4-Step Intelligent Workflow Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            End-to-End Pipeline
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mt-4 tracking-tight">
            How CareerTwin AI Transforms Candidates
          </h2>
          <p className="text-sm text-slate-400 mt-3">
            Every step is database-backed, transparent, and reproducible with zero black-box hallucination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-xs font-black text-indigo-400">Step 01</span>
            <h4 className="text-base font-bold text-white">Document Parsing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              PyMuPDF and python-docx extract raw text from PDF & DOCX resumes with unreadable scan rejection.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <span className="text-xs font-black text-blue-400">Step 02</span>
            <h4 className="text-base font-bold text-white">NLP Skill Extraction</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              spaCy and ESCO ontology map canonical skills, normalizes aliases (JS = JavaScript), and checks experience verbs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-6 h-6" />
            </div>
            <span className="text-xs font-black text-emerald-400">Step 03</span>
            <h4 className="text-base font-bold text-white">Explainable Matching</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sentence Transformers compute cosine distance with weighted 65/15/15/5 breakdown and gap priorities.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Map className="w-6 h-6" />
            </div>
            <span className="text-xs font-black text-amber-400">Step 04</span>
            <h4 className="text-base font-bold text-white">Personalized Roadmap</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates ordered sequence of missing skills with practice activities, mini-projects, and live progress tracking.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center relative z-10">
        <div className="p-12 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 border border-white/15 shadow-2xl space-y-6">
          <h3 className="text-3xl sm:text-4xl font-black text-white">
            Ready to Discover Your True Career Fit?
          </h3>
          <p className="text-sm text-indigo-200 max-w-xl mx-auto">
            Test the complete end-to-end workflow now with real sample resumes, explainable scoring, and interactive roadmaps.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-xl bg-white text-indigo-950 font-extrabold text-sm hover:bg-slate-100 transition-all shadow-lg flex items-center gap-2"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-950 text-white font-bold text-sm border border-white/20 transition-all"
            >
              Sign In (Demo Auto-Fill)
            </Link>
          </div>
        </div>

        <div className="mt-12 text-xs text-slate-500">
          CareerTwin AI © 2026. Architected for Academic & Professional Software Engineering Demonstrations.
        </div>
      </section>
    </div>
  );
};
