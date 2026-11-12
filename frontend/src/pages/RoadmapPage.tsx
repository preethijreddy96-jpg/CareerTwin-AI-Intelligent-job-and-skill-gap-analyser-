import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { roadmapsApi, dashboardApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/Navbar';
import { LearningRoadmap, LearningTask } from '../types';
import {
  Map,
  CheckCircle2,
  Clock,
  Code,
  FolderGit2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Layers,
  BookOpen,
  Plus
} from 'lucide-react';

export const RoadmapPage: React.FC = () => {
  const { activeResumeId } = useAuth();
  const { showToast } = useToast();

  const [roadmaps, setRoadmaps] = useState<LearningRoadmap[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<LearningRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const res = await roadmapsApi.getRoadmaps();
      setRoadmaps(res.data);
      if (res.data.length > 0) {
        setActiveRoadmap(res.data[0]);
      }
    } catch (err) {
      showToast('Failed to load learning roadmaps.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const handleGenerateRoadmapFromLatestAnalysis = async () => {
    try {
      setGenerating(true);
      const dashRes = await dashboardApi.getOverview();
      const recent = dashRes.data.recent_analyses;

      if (!recent || recent.length === 0) {
        showToast('Please run a job match analysis first before generating a roadmap.', 'error');
        setGenerating(false);
        return;
      }

      const latestAnalysisId = recent[0].id;
      const res = await roadmapsApi.generateRoadmap({
        analysis_id: latestAnalysisId,
        target_role: recent[0].target_role,
      });

      showToast(`Personalized roadmap generated with ${res.data.tasks.length} skill tasks!`, 'success');
      await fetchRoadmaps();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to generate roadmap.';
      showToast(msg, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (task: LearningTask) => {
    try {
      const newStatus = !task.is_completed;
      const res = await roadmapsApi.updateTaskStatus(task.id, newStatus);
      
      // Update local state
      if (activeRoadmap) {
        const updatedTasks = activeRoadmap.tasks.map((t) => (t.id === task.id ? res.data : t));
        const completedCount = updatedTasks.filter((t) => t.is_completed).length;
        setActiveRoadmap({
          ...activeRoadmap,
          tasks: updatedTasks,
          completed_tasks: completedCount,
        });
      }

      showToast(
        newStatus ? `Completed task: ${task.skill_name}!` : `Marked ${task.skill_name} as pending.`,
        newStatus ? 'success' : 'info'
      );
    } catch (err) {
      showToast('Failed to update task completion.', 'error');
    }
  };

  const progressPercent = activeRoadmap && activeRoadmap.total_tasks > 0
    ? Math.round((activeRoadmap.completed_tasks / activeRoadmap.total_tasks) * 100)
    : 0;

  return (
    <div>
      <Navbar
        title="Personalized Learning Roadmap & Skill Bridge"
        subtitle="Ordered curriculum formulated to bridge missing competencies for your target career role"
      />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Action Header */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {activeRoadmap ? activeRoadmap.title : 'Personalized Career Pathway'}
              </h2>
              <p className="text-xs text-slate-400">
                {activeRoadmap
                  ? `${activeRoadmap.completed_tasks} of ${activeRoadmap.total_tasks} milestones achieved (${progressPercent}%)`
                  : 'Generate a step-by-step roadmap from your skill gap analysis'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateRoadmapFromLatestAnalysis}
              disabled={generating}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{generating ? 'Formulating Pathway...' : 'Generate New Roadmap'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {activeRoadmap && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" /> Overall Pathway Mastery
              </span>
              <span className="text-indigo-600 font-extrabold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Tasks List */}
        {!activeRoadmap || activeRoadmap.tasks.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            <Map className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold">No active learning roadmaps yet.</p>
            <p className="text-xs mt-1">Run a job analysis to identify skill gaps, then click "Generate New Roadmap".</p>
            <button
              onClick={handleGenerateRoadmapFromLatestAnalysis}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
            >
              Generate From Latest Analysis <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeRoadmap.tasks.map((task, idx) => (
              <div
                key={task.id}
                className={`p-6 rounded-2xl border transition-all ${
                  task.is_completed
                    ? 'bg-slate-50/80 border-slate-200 opacity-90'
                    : 'bg-white border-slate-200/90 shadow-xs hover:border-indigo-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    {/* Interactive Completion Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                        task.is_completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 hover:border-indigo-600 bg-white'
                      }`}
                    >
                      {task.is_completed && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">Step {idx + 1}</span>
                        <h4 className={`text-base font-extrabold ${task.is_completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                          {task.skill_name}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          task.learning_priority === 'Critical'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {task.learning_priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> ~{task.estimated_hours} hrs
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px] uppercase">
                      {task.level}
                    </span>
                  </div>
                </div>

                {/* Details: Objective, Practice Activity & Mini-Project */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Objective */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Learning Objective:
                    </span>
                    <p className="text-slate-600 leading-relaxed">{task.learning_objective}</p>
                  </div>

                  {/* Practice Activity */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-blue-500" /> Hands-On Practice Activity:
                    </span>
                    <p className="text-slate-600 leading-relaxed">{task.practice_activity}</p>
                  </div>

                  {/* Mini-Project Idea */}
                  <div className="p-3.5 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-1">
                    <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-indigo-600" /> Portfolio Mini-Project Idea:
                    </span>
                    <p className="text-indigo-800 leading-relaxed">{task.mini_project_idea}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

