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

  const COLORS = ['#6366f1', '#3b82f6', '#0ea5e9', '#14b8a6'];

  return (
    <div>
      <Navbar
        title="Career Intelligence Dashboard"
        subtitle={`Welcome back, ${user?.full_name || 'Candidate'}. Here is your career alignment overview.`}
      />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Skills */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Identified Skills</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{data?.total_skills_count || 0}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <Brain className="w-3.5 h-3.5" /> ESCO & O*NET Mapped
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Brain className="w-6 h-6" />
            </div>
          </div>

          {/* Resumes Analyzed */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resumes Parsed</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{data?.resumes_analyzed_count || 0}</h3>
              <p className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1 mt-1">
                <FileText className="w-3.5 h-3.5" /> PDF & DOCX Engine
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          {/* Average Compatibility */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg. Compatibility</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1">
                {data?.avg_compatibility_score ? `${data.avg_compatibility_score}%` : 'N/A'}
              </h3>
              <p className="text-[11px] text-amber-600 font-semibold flex items-center gap-1 mt-1">
                <Target className="w-3.5 h-3.5" /> Weighted Alignment
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Target className="w-6 h-6" />
            </div>
          </div>

          {/* Learning Roadmap Progress */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Roadmap Progress</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1">
                {data?.learning_progress_percentage || 0}%
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3.5 h-3.5" /> Skill Growth Track
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Map className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Action Prompt if No Resumes */}
        {resumes.length === 0 && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-100">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Upload your resume to activate full AI matching</h4>
                <p className="text-xs text-slate-600 mt-0.5">Upload a PDF or DOCX file to extract technical skills and compute job fit.</p>
              </div>
            </div>
            <Link
              to="/resumes"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 flex items-center gap-2 shrink-0 transition-all"
            >
              Upload Resume <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Best Matching Roles Bar Chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-800">Target Role Compatibility Benchmark</h3>
                <p className="text-xs text-slate-400">Sentence transformer semantic match & skill coverage</p>
              </div>
              <Link to="/recommendations" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                View All Roles <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="h-64 w-full">
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="role" type="category" width={140} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Compatibility']}
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
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
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Skill Alignment Ratio</h3>
              <p className="text-xs text-slate-400">Ratio of matched skills versus identified gaps</p>
            </div>

            <div className="py-4 flex justify-center">
              <ScoreGauge
                score={data?.avg_compatibility_score || 0}
                size={160}
                label="Average Fit"
                showSubtitle={true}
              />
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-xl bg-emerald-50">
                <span className="text-xs text-emerald-600 font-bold block">Matched Skills</span>
                <span className="text-lg font-black text-emerald-700">{data?.skills_matched_count || 0}</span>
              </div>
              <div className="p-2 rounded-xl bg-rose-50">
                <span className="text-xs text-rose-600 font-bold block">Identified Gaps</span>
                <span className="text-lg font-black text-rose-700">{data?.skills_missing_count || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Row: Active Roadmap & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Learning Roadmap */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Map className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Active Learning Roadmap</h3>
                  <p className="text-xs text-slate-400">Ordered skill acquisition curriculum</p>
                </div>
              </div>
              <Link to="/roadmaps" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                Open Roadmap <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data?.active_roadmap ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{data.active_roadmap.title}</span>
                  <span className="font-semibold text-indigo-600">
                    {data.active_roadmap.completed_tasks} / {data.active_roadmap.total_tasks} Tasks Completed
                  </span>
                </div>
                <div className="space-y-2">
                  {data.active_roadmap.tasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${task.is_completed ? 'bg-emerald-500' : 'bg-indigo-400'}`}></span>
                        <div>
                          <p className="font-bold text-slate-800">{task.skill_name}</p>
                          <p className="text-slate-400 text-[10px] truncate max-w-xs">{task.learning_objective}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
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
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition-colors"
                >
                  Match a Job to Generate Roadmap
                </Link>
              </div>
            )}
          </div>

          {/* Recent Activity Log */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Recent Activity & Audit Trail</h3>
                <p className="text-xs text-slate-400">User events, uploads, and skill verifications</p>
              </div>
            </div>

            <div className="space-y-3">
              {(data?.recent_activity || []).length > 0 ? (
                data?.recent_activity.map((act) => (
                  <div key={act.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-700">{act.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{act.timestamp}</span>
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

