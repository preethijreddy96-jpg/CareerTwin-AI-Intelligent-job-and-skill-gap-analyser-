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
  TrendingUp,
  Brain,
  FileSearch,
  BookOpen
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-50/60 pb-16">
      <Navbar
        title="Skill Gap Matrix & Priority Analysis"
        subtitle={`Actionable skill bridging analysis for ${targetRoleTitle}`}
      />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Total */}
          <div
            onClick={() => setStatusFilter('all')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              statusFilter === 'all'
                ? 'bg-gradient-to-br from-indigo-50 via-white to-purple-50/40 border-indigo-400 shadow-md shadow-indigo-100 ring-2 ring-indigo-500/20'
                : 'bg-white border-slate-200/90 hover:border-indigo-200 shadow-xs'
            }`}
          >
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">Total Required Skills</span>
            <span className="text-3xl font-extrabold text-slate-900 mt-1 block">{gaps.length}</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Full Role Benchmark</span>
          </div>

          {/* Missing */}
          <div
            onClick={() => setStatusFilter('missing')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              statusFilter === 'missing'
                ? 'bg-gradient-to-br from-rose-50 via-white to-pink-50/40 border-rose-400 shadow-md shadow-rose-100 ring-2 ring-rose-500/20'
                : 'bg-white border-slate-200/90 hover:border-rose-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Critical Missing Gaps</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <span className="text-3xl font-extrabold text-rose-700 mt-1 block">{missingCount}</span>
            <span className="text-[10px] text-rose-500 font-semibold mt-1 block">Highest Training Priority</span>
          </div>

          {/* Partial */}
          <div
            onClick={() => setStatusFilter('partial')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              statusFilter === 'partial'
                ? 'bg-gradient-to-br from-amber-50 via-white to-orange-50/40 border-amber-400 shadow-md shadow-amber-100 ring-2 ring-amber-500/20'
                : 'bg-white border-slate-200/90 hover:border-amber-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Partial Matches</span>
              <HelpCircle className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-3xl font-extrabold text-amber-700 mt-1 block">{partialCount}</span>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">Adjacent Concepts Found</span>
          </div>

          {/* Matched */}
          <div
            onClick={() => setStatusFilter('matched')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              statusFilter === 'matched'
                ? 'bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 border-emerald-400 shadow-md shadow-emerald-100 ring-2 ring-emerald-500/20'
                : 'bg-white border-slate-200/90 hover:border-emerald-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Fully Matched</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-3xl font-extrabold text-emerald-700 mt-1 block">{matchedCount}</span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Demonstrated in Resume</span>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Skill Breakdown & Evidence Justifications</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Each classification includes the exact resume evidence, reasoning, and suggested roadmap improvement.
            </p>
          </div>

          {latestAnalysisId && (
            <Link
              to="/roadmaps"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Map className="w-4 h-4" /> Convert Gaps Into Learning Roadmap
            </Link>
          )}
        </div>

        {/* Gaps List / Table */}
        {gaps.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 shadow-xs">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold">No skill gaps analyzed yet.</p>
            <p className="text-xs mt-1">Run a job analysis in the Job Matcher to generate your skill gap matrix.</p>
            <Link
              to="/jobs"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-100"
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
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Matched (1.0)
                </span>
              );
              let topGradient = 'from-emerald-500 to-teal-400';
              let borderAccent = 'border-emerald-100';

              if (isMissing) {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" /> Missing (0.0)
                  </span>
                );
                topGradient = 'from-rose-500 to-pink-500';
                borderAccent = 'border-rose-100';
              } else if (isPartial) {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" /> Partial Match (0.5)
                  </span>
                );
                topGradient = 'from-amber-500 to-orange-400';
                borderAccent = 'border-amber-100';
              }

              return (
                <div
                  key={gap.id}
                  className={`p-6 rounded-2xl bg-white border ${borderAccent} shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${topGradient}`}></div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-extrabold text-slate-800">{gap.skill_name}</span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {gap.category || 'Skill'}
                      </span>
                    </div>
                    {statusBadge}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Resume Evidence */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <FileSearch className="w-3.5 h-3.5 text-slate-400" /> Resume Context Evidence
                      </span>
                      <p className="text-slate-600 italic">
                        {gap.resume_evidence ? `"${gap.resume_evidence}"` : 'No explicit textual mention discovered in resume.'}
                      </p>
                    </div>

                    {/* Roadmap Suggestion */}
                    <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1">
                      <span className="font-bold text-indigo-900 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Recommended Action
                      </span>
                      <p className="text-slate-700 leading-relaxed">
                        {gap.suggested_improvement || gap.classification_reason || 'Complete project-based milestone on this skill to close this gap.'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
