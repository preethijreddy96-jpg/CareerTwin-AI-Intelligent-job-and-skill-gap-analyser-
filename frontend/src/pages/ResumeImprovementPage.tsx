import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { improvementsApi, resumesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/Navbar';
import { ResumeImprovement, Resume } from '../types';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Copy,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Check
} from 'lucide-react';

export const ResumeImprovementPage: React.FC = () => {
  const { activeResumeId, setActiveResumeId } = useAuth();
  const { showToast } = useToast();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [data, setData] = useState<ResumeImprovement | null>(null);
  const [loading, setLoading] = useState(false);
  const [targetRole, setTargetRole] = useState('Full-Stack Engineer');
  const [sampleJD, setSampleJD] = useState(
    'Seeking a Senior Software Engineer with strong experience in Docker, Kubernetes, CI/CD pipelines, PostgreSQL, and FastAPI microservices.'
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const loadResumes = async () => {
      try {
        const res = await resumesApi.getResumes();
        setResumes(res.data);
        if (!activeResumeId && res.data.length > 0) {
          setActiveResumeId(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadResumes();
  }, []);

  const handleRunImprovement = async () => {
    if (!activeResumeId) {
      showToast('Please select an active resume first.', 'error');
      return;
    }
    try {
      setLoading(true);
      const res = await improvementsApi.improveResume({
        resume_id: activeResumeId,
        target_role: targetRole,
        job_description: sampleJD,
      });
      setData(res.data);
      showToast('Resume enhancement suggestions generated!', 'success');
    } catch (err) {
      showToast('Failed to generate resume improvements.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeResumeId) {
      handleRunImprovement();
    }
  }, [activeResumeId]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-50/60 pb-16">
      <Navbar
        title="AI Resume Improvement & ATS Optimizer"
        subtitle="Truthful bullet-point rewrites, quantifiable metrics injection, and keyword density calibration"
      />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Strict Truthfulness Policy Header Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-950">Strict Truthfulness Policy:</span>
            CareerTwin AI enhances wording, active voice, and formatting metrics. It will never fabricate qualifications,
            employment history, or certifications. Insert your actual achievements into the highlighted template fields.
          </div>
        </div>

        {/* Input Configuration Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-end relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-pink-500 to-amber-500"></div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Active Resume
            </label>
            <select
              value={activeResumeId || ''}
              onChange={(e) => setActiveResumeId(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>📄 {r.filename}</option>
              ))}
              {!resumes.length && <option value="">No resumes found</option>}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Career Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="e.g. Python Developer"
            />
          </div>

          <div>
            <button
              onClick={handleRunImprovement}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{loading ? 'Analyzing Content...' : 'Run Resume Evaluation'}</span>
            </button>
          </div>
        </div>

        {/* Results Overview */}
        {data && (
          <div className="space-y-8 animate-fadeIn">
            {/* Score Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-purple-50/40 border border-indigo-200 shadow-sm">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Overall Resume Score</span>
                <span className="text-3xl font-extrabold text-indigo-700 block mt-1">{data.overall_score}%</span>
                <span className="text-[10px] text-slate-500 mt-1 block">Weighted benchmark</span>
              </div>
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 border border-emerald-200 shadow-sm">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">ATS Readiness</span>
                <span className="text-3xl font-extrabold text-emerald-700 block mt-1">{data.ats_formatting_score}%</span>
                <span className="text-[10px] text-slate-500 mt-1 block">Machine readability</span>
              </div>
              <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 via-white to-blue-50/40 border border-sky-200 shadow-sm">
                <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">Active Action Verbs</span>
                <span className="text-3xl font-extrabold text-sky-700 block mt-1">{data.action_verb_score}%</span>
                <span className="text-[10px] text-slate-500 mt-1 block">Impactful leadership voice</span>
              </div>
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-orange-50/40 border border-amber-200 shadow-sm">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Quantifiable Metrics</span>
                <span className="text-3xl font-extrabold text-amber-700 block mt-1">{data.quantifiable_metrics_score}%</span>
                <span className="text-[10px] text-slate-500 mt-1 block">Numeric performance data</span>
              </div>
            </div>

            {/* Weak Bullets Detection & Truthful Rewrites */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-indigo-500"></div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Bullet-Point Critiques & Active Voice Rewrites</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Replaces passive phrasing with active verbs and impact metrics</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                  {data.weak_bullet_points.length} Bullets Analyzed
                </span>
              </div>

              <div className="space-y-4">
                {data.weak_bullet_points.map((bullet, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Original Bullet:</span>
                      <p className="text-xs text-slate-600 italic">"{bullet.original_text}"</p>
                    </div>

                    <div className="text-xs text-rose-800 bg-rose-50 p-3 rounded-lg border border-rose-200">
                      <span className="font-bold text-rose-900">Critique: </span>
                      {bullet.critique}
                    </div>

                    <div className="text-xs text-emerald-950 bg-emerald-50 p-3.5 rounded-lg border border-emerald-200 flex items-start justify-between gap-3 shadow-xs">
                      <div>
                        <span className="font-bold text-emerald-900 block mb-1">Recommended Active Rewrite:</span>
                        <p className="leading-relaxed font-medium">{bullet.improved_version}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(bullet.improved_version, `bullet-${idx}`)}
                        className="px-2.5 py-1 rounded-md bg-white border border-emerald-200 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1 shrink-0 transition-colors"
                      >
                        {copiedKey === `bullet-${idx}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
