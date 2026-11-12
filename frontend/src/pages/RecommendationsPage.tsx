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
  ChevronRight
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
    <div>
      <Navbar
        title="Career Pathway Recommendations"
        subtitle="Transparent occupational ranking based on your skill graph and semantic role embeddings"
      />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Top Explanation Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md shadow-indigo-100">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md">
              <Compass className="w-3.5 h-3.5 text-indigo-300" />
              <span>Transparent AI Ranking Pipeline</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Top Ranked Career Roles For Your Skill Profile
            </h2>
            <p className="text-xs text-indigo-200 leading-relaxed">
              These suggestions are computed using direct taxonomy overlap, demonstrated project evidence, 
              and cosine similarity against standard ESCO/O*NET occupational requirements.
            </p>
          </div>

          <Link
            to="/jobs"
            className="px-5 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs shrink-0 transition-colors flex items-center gap-2 shadow-sm"
          >
            Launch Detailed Matcher <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Recommendations Cards Grid */}
        {recommendations.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            <Compass className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold">No career recommendations available yet.</p>
            <p className="text-xs mt-1">Please upload a resume in the Resume Manager to evaluate matching roles.</p>
            <Link
              to="/resumes"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
            >
              Upload Resume <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec, idx) => (
              <div
                key={rec.slug}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        Rank #{idx + 1} • {rec.category}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">{rec.role_title}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <TrendingUp className="w-3.5 h-3.5" /> {rec.market_demand} Demand
                        </span>
                        <span>•</span>
                        <span>{rec.avg_salary_range}</span>
                      </div>
                    </div>

                    <div className="w-16 h-16 shrink-0">
                      <ScoreGauge score={rec.match_score} size={64} strokeWidth={6} label="" showSubtitle={false} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed line-clamp-2">
                    {rec.description}
                  </p>

                  {/* Supporting Skills & Missing Skills */}
                  <div className="mt-4 space-y-3 pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Supporting Acquired Skills:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.supporting_skills.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
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
                      <span className="text-[11px] font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-500" /> Primary Skill Gaps to Bridge:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.missing_skills.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                          >
                            {s}
                          </span>
                        ))}
                        {!rec.missing_skills.length && (
                          <span className="text-xs text-emerald-600 font-semibold">All core skills matched!</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Estimated Fit: {rec.match_score}%</span>
                  <Link
                    to="/jobs"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
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

