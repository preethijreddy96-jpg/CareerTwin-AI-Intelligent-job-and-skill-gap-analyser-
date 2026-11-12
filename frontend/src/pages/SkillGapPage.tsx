import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { skillsApi, dashboardApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/Navbar';
import { SkillGap, Analysis } from '../types';
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Map,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export const SkillGapPage: React.FC = () => {
  const { activeResumeId } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [gaps, setGaps] = useState<SkillGap[]>([]);
  const [latestAnalysisId, setLatestAnalysisId] = useState<number | null>(null);
  const [targetRoleTitle, setTargetRoleTitle] = useState<string>('Target Role');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'missing' | 'partial' | 'matched'>('all');

  useEffect(() => {
    const fetchLatestGaps = async () => {
      try {
        setLoading(true);
        const dashRes = await dashboardApi.getOverview();
        const recent = dashRes.data.recent_analyses;

        if (recent && recent.length > 0) {
          const latest = recent[0];
          setLatestAnalysisId(latest.id);
          setTargetRoleTitle(latest.target_role || 'Target Role');

          const gapsRes = await skillsApi.getGaps(latest.id);
          setGaps(gapsRes.data);
        }
      } catch (err) {
        showToast('Failed to load skill gap matrix.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchLatestGaps();
  }, []);

  const filteredGaps = gaps.filter((g) => {
    if (statusFilter === 'all') return true;
    return g.match_status === statusFilter;
  });

  const missingCount = gaps.filter((g) => g.match_status === 'missing').length;
  const partialCount = gaps.filter((g) => g.match_status === 'partial').length;
  const matchedCount = gaps.filter((g) => g.match_status === 'matched').length;

  return (
    <div>
      <Navbar
        title="Skill Gap Matrix & Priority Analysis"
        subtitle={`Actionable skill bridging analysis for ${targetRoleTitle}`}
      />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div
            onClick={() => setStatusFilter('all')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              statusFilter === 'all'
                ? 'bg-indigo-50 border-indigo-300 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Required Skills</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{gaps.length}</span>
          </div>

          <div
            onClick={() => setStatusFilter('missing')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              statusFilter === 'missing'
                ? 'bg-rose-50 border-rose-300 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Critical Missing Gaps</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <span className="text-2xl font-black text-rose-700 mt-1 block">{missingCount}</span>
          </div>

          <div
            onClick={() => setStatusFilter('partial')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              statusFilter === 'partial'
                ? 'bg-amber-50 border-amber-300 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Partial Matches</span>
              <HelpCircle className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-2xl font-black text-amber-700 mt-1 block">{partialCount}</span>
          </div>

          <div
            onClick={() => setStatusFilter('matched')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              statusFilter === 'matched'
                ? 'bg-emerald-50 border-emerald-300 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Fully Matched</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">{matchedCount}</span>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Skill Breakdown & Evidence Justifications</h3>
            <p className="text-xs text-slate-400">
              Each classification includes the exact resume evidence, reasoning, and suggested roadmap improvement.
            </p>
          </div>

          {latestAnalysisId && (
            <Link
              to="/roadmaps"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 flex items-center gap-2 transition-all"
            >
              <Map className="w-4 h-4" /> Convert Gaps Into Learning Roadmap
            </Link>
          )}
        </div>

        {/* Gaps List / Table */}
        {gaps.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold">No skill gaps analyzed yet.</p>
            <p className="text-xs mt-1">Run a job analysis in the Job Matcher to generate your skill gap matrix.</p>
            <Link
              to="/jobs"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
            >
              Go to Job Matcher <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGaps.map((gap) => {
              const isMissing = gap.match_status === 'missing';
              const isPartial = gap.match_status === 'partial';

              let statusBadge = (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Matched (1.0)
                </span>
              );
              if (isMissing) {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <XCircle className="w-3.5 h-3.5" /> Missing (0.0)
                  </span>
                );
              } else if (isPartial) {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <HelpCircle className="w-3.5 h-3.5" /> Partial Match (0.5)
                  </span>
                );
              }

              return (
                <div
                  key={gap.id}
                  className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-extrabold text-slate-800">{gap.skill_name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {gap.category || 'Skill'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          gap.importance === 'required'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {gap.importance}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400">
                        Priority Score: <span className="text-slate-800">{gap.gap_priority_score} / 10</span>
                      </span>
                      {statusBadge}
                    </div>
                  </div>

                  {/* Evidence & Reasoning */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="font-bold text-slate-700 block">Resume Evidence:</span>
                      <p className="text-slate-500 italic">"{gap.resume_evidence || 'None found'}"</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="font-bold text-slate-700 block">Classification Reasoning:</span>
                      <p className="text-slate-600">{gap.classification_reason}</p>
                    </div>
                  </div>

                  {/* Suggested Improvement */}
                  {gap.suggested_improvement && (
                    <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-2 text-xs">
                      <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-indigo-900">Suggested Action: </span>
                        <span className="text-indigo-800">{gap.suggested_improvement}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

