import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, resumesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { ScoreGauge } from '../components/ScoreGauge';
import { DashboardOverview, Resume } from '../types';
import {
  Brain,
  FileText,
  Target,
  Trophy,
  ArrowRight,
  Sparkles,
  Briefcase,
  AlertTriangle,
  Map,
  CheckCircle2,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user, setActiveResumeId, activeResumeId } = useAuth();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashRes, resumesRes] = await Promise.all([
          dashboardApi.getOverview(),
          resumesApi.getResumes()
        ]);
        setData(dashRes.data);
        setResumes(resumesRes.data);

        // Auto-select first resume if none selected
        if (!activeResumeId && resumesRes.data.length > 0) {
          setActiveResumeId(resumesRes.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Pie chart data for skills status
  const pieData = [
    { name: 'Matched Skills', value: data?.skills_matched_count || 0, color: '#10b981' },
    { name: 'Skill Gaps', value: data?.skills_missing_count || 0, color: '#f43f5e' }
  ];

  // Bar chart data for matching roles
  const barData = (data?.best_matching_roles || []).map((r) => ({
    role: r.role_title,
    score: r.compatibility_score,
  }));

  const COLORS = ['#6366f1', '#3b82f6', '#0ea5e9', '#14b8a6', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/25 to-slate-50/60">
      <Navbar
        title="Career Intelligence Dashboard"
        subtitle={`Welcome back, ${user?.full_name || 'Candidate'}. Here is your career alignment overview.`}
      />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Skills - Indigo / Violet Palette */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/40 border border-indigo-100 hover:border-indigo-300 shadow-sm hover:shadow-md hover:shadow-indigo-500/10 transition-all flex items-center justify-between group">
            <div>
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Identified Skills</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{data?.total_skills_count || 0}</h3>
              <p className="text-[11px] text-indigo-700 font-semibold flex items-center gap-1.5 mt-2 bg-indigo-100/70 px-2.5 py-0.5 rounded-full w-fit">
                <Brain className="w-3.5 h-3.5 text-indigo-600" /> ESCO & O*NET Mapped
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
          </div>

          {/* Resumes Analyzed - Sky / Blue Palette */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-50/90 via-white to-blue-50/40 border border-sky-100 hover:border-sky-300 shadow-sm hover:shadow-md hover:shadow-sky-500/10 transition-all flex items-center justify-between group">
            <div>
              <p className="text-xs font-bold text-sky-700 uppercase tracking-wider">Resumes Parsed</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{data?.resumes_analyzed_count || 0}</h3>
              <p className="text-[11px] text-sky-700 font-semibold flex items-center gap-1.5 mt-2 bg-sky-100/70 px-2.5 py-0.5 rounded-full w-fit">
                <FileText className="w-3.5 h-3.5 text-sky-600" /> PDF & DOCX Engine
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          {/* Average Compatibility - Amber / Orange Palette */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-orange-50/40 border border-amber-100 hover:border-amber-300 shadow-sm hover:shadow-md hover:shadow-amber-500/10 transition-all flex items-center justify-between group">
            <div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Avg. Compatibility</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                {data?.avg_compatibility_score ? `${data.avg_compatibility_score}%` : 'N/A'}
              </h3>
              <p className="text-[11px] text-amber-800 font-semibold flex items-center gap-1.5 mt-2 bg-amber-100/70 px-2.5 py-0.5 rounded-full w-fit">
                <Target className="w-3.5 h-3.5 text-amber-600" /> Weighted Alignment
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <Target className="w-6 h-6" />
            </div>
          </div>

          {/* Learning Roadmap Progress - Emerald / Teal Palette */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/40 border border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-md hover:shadow-emerald-500/10 transition-all flex items-center justify-between group">
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Roadmap Progress</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                {data?.learning_progress_percentage || 0}%
              </h3>
              <p className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5 mt-2 bg-emerald-100/70 px-2.5 py-0.5 rounded-full w-fit">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Skill Growth Track
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <Map className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Action Prompt if No Resumes */}
        {resumes.length === 0 && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 border border-indigo-500/30 shadow-lg shadow-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shrink-0 shadow-inner">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Upload your resume to activate full AI matching</h4>
                <p className="text-xs text-indigo-100 mt-0.5">Upload a PDF or DOCX file to extract technical skills and compute job fit.</p>
              </div>
            </div>
            <Link
              to="/resumes"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 font-bold text-xs shadow-md shadow-black/10 flex items-center gap-2 shrink-0 transition-all hover:scale-[1.02]"
            >
              Upload Resume <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Best Matching Roles Bar Chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-400"></div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-800">Target Role Compatibility Benchmark</h3>
                <p className="text-xs text-slate-400 mt-0.5">Sentence transformer semantic match & skill coverage</p>
              </div>
              <Link to="/recommendations" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors">
                View All Roles <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="h-64 w-full">
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                    <YAxis dataKey="role" type="category" width={140} tick={{ fontSize: 11, fill: '#334155' }} stroke="#cbd5e1" />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Compatibility']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '12px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                      {barData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Run your first job analysis to render compatibility charts.
                </div>
              )}
            </div>
          </div>

          {/* Skills Breakdown Gauge / Donut */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500"></div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Skill Alignment Ratio</h3>
              <p className="text-xs text-slate-400 mt-0.5">Ratio of matched skills versus identified gaps</p>
            </div>

            <div className="my-3 py-4 flex justify-center bg-gradient-to-b from-indigo-50/40 via-purple-50/20 to-transparent rounded-2xl border border-indigo-50/60">
              <ScoreGauge
                score={data?.avg_compatibility_score || 0}
                size={160}
                label="Average Fit"
                showSubtitle={true}
              />
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-xs">
                <span className="text-xs text-emerald-700 font-bold block">Matched Skills</span>
                <span className="text-2xl font-black text-emerald-800">{data?.skills_matched_count || 0}</span>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200/80 shadow-xs">
                <span className="text-xs text-rose-700 font-bold block">Identified Gaps</span>
                <span className="text-2xl font-black text-rose-800">{data?.skills_missing_count || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Row: Active Roadmap & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Learning Roadmap */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
                  <Map className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Active Learning Roadmap</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Ordered skill acquisition curriculum</p>
                </div>
              </div>
              <Link to="/roadmaps" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors">
                Open Roadmap <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data?.active_roadmap ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 rounded-xl border border-indigo-100/90 flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-950">{data.active_roadmap.title}</span>
                  <span className="font-bold text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                    {data.active_roadmap.completed_tasks} / {data.active_roadmap.total_tasks} Tasks Completed
                  </span>
                </div>
                <div className="space-y-2">
                  {data.active_roadmap.tasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                        task.is_completed
                          ? 'bg-emerald-50/40 border-emerald-100 hover:border-emerald-200'
                          : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${task.is_completed ? 'bg-emerald-500 shadow-sm shadow-emerald-400' : 'bg-indigo-500'}`}></span>
                        <div>
                          <p className="font-bold text-slate-800">{task.skill_name}</p>
                          <p className="text-slate-400 text-[10px] truncate max-w-xs">{task.learning_objective}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        task.is_completed
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                      }`}>
                        {task.learning_priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-xs text-slate-400">No active roadmap generated yet.</p>
                <Link
                  to="/jobs"
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all"
                >
                  Match a Job to Generate Roadmap
                </Link>
              </div>
            )}
          </div>

          {/* Recent Activity Log */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Recent Activity & Audit Trail</h3>
                <p className="text-xs text-slate-400 mt-0.5">User events, uploads, and skill verifications</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {(data?.recent_activity || []).length > 0 ? (
                data?.recent_activity.map((act) => (
                  <div key={act.id} className="p-3.5 rounded-xl bg-gradient-to-r from-slate-50 via-indigo-50/20 to-white border border-slate-100 hover:border-slate-200 flex items-center justify-between text-xs transition-all">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="font-semibold text-slate-700">{act.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium bg-white px-2 py-0.5 rounded-md border border-slate-200/60">{act.timestamp}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  No activity logged yet. Upload a resume or match a job role to see activity.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
