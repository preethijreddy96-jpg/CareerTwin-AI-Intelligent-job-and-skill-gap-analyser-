import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobsApi, resumesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/Navbar';
import { ScoreGauge } from '../components/ScoreGauge';
import { CareerRecommendation, Resume } from '../types';
import {
  Compass,
  Briefcase,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  Trophy
} from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const { activeResumeId, setActiveResumeId } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resumesRes = await resumesApi.getResumes();
        setResumes(resumesRes.data);

        const currentId = activeResumeId || (resumesRes.data.length > 0 ? resumesRes.data[0].id : null);
        if (currentId) {
          if (!activeResumeId) setActiveResumeId(currentId);
          const recRes = await jobsApi.getRecommendations(currentId, 6);
          setRecommendations(recRes.data);
        }
      } catch (err) {
        showToast('Failed to load career recommendations.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeResumeId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-50/60 pb-16">
      <Navbar
        title="Career Pathway Recommendations"
        subtitle="Transparent occupational ranking based on your skill graph and semantic role embeddings"
      />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Top Explanation Banner */}
        <div className="p-7 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-[#1c204c] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl shadow-indigo-950/20 border border-indigo-700/40 relative overflow-hidden">
          <div className="space-y-2 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md border border-white/10">
              <Compass className="w-3.5 h-3.5 text-indigo-300" />
              <span>Transparent AI Ranking Pipeline</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Top Ranked Career Roles For Your Skill Profile
            </h2>
            <p className="text-xs text-indigo-100/90 leading-relaxed">
              These suggestions are computed using direct taxonomy overlap, demonstrated project evidence, 
              and cosine similarity against standard ESCO/O*NET occupational requirements.
            </p>
          </div>

          <Link
            to="/jobs"
            className="px-5 py-2.5 rounded-xl bg-white text-indigo-950 hover:bg-slate-100 font-bold text-xs shrink-0 transition-all flex items-center gap-2 shadow-md relative z-10 hover:scale-[1.02]"
          >
            Launch Detailed Matcher <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Recommendations Cards Grid */}
        {recommendations.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 shadow-xs">
            <Compass className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold">No career recommendations available yet.</p>
            <p className="text-xs mt-1">Please upload a resume in the Resume Manager to evaluate matching roles.</p>
            <Link
              to="/resumes"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-100"
            >
              Upload Resume <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec, idx) => (
              <div
                key={rec.slug}
                className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between space-y-5 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400"></div>

                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-indigo-600" /> Rank #{idx + 1} • {rec.category}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-1.5">{rec.role_title}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          <TrendingUp className="w-3 h-3 text-emerald-600" /> {rec.market_demand} Demand
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                          {rec.avg_salary_range}
                        </span>
                      </div>
                    </div>

                    <div className="w-16 h-16 shrink-0">
                      <ScoreGauge score={rec.match_score} size={64} strokeWidth={6} label="" showSubtitle={false} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3.5 leading-relaxed line-clamp-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                    {rec.description}
                  </p>

                  {/* Supporting Skills & Missing Skills */}
                  <div className="mt-4 space-y-3 pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-800 font-bold">Supporting Acquired Skills:</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.supporting_skills.map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs"
                          >
                            {s}
                          </span>
                        ))}
                        {!rec.supporting_skills.length && (
                          <span className="text-xs text-slate-400 italic">None yet</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-rose-800 font-bold">Primary Skill Gaps to Bridge:</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.missing_skills.map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-xs"
                          >
                            {s}
                          </span>
                        ))}
                        {!rec.missing_skills.length && (
                          <span className="text-xs text-emerald-600 font-bold">All core skills matched!</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-semibold bg-slate-100/70 px-2 py-0.5 rounded-md">
                    Estimated Fit: <strong className="text-indigo-600">{rec.match_score}%</strong>
                  </span>
                  <Link
                    to="/jobs"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all"
                  >
                    Match with this role <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
