import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jobsApi, analysisApi, resumesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/Navbar';
import { ScoreGauge } from '../components/ScoreGauge';
import { Job, JobRole, Analysis, Resume } from '../types';
import {
  Briefcase,
  Target,
  Sliders,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Map,
  Layers,
  ChevronDown,
  Building,
  MapPin
} from 'lucide-react';

export const JobMatcherPage: React.FC = () => {
  const { activeResumeId, setActiveResumeId } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  // Match Mode: 'sample' or 'custom'
  const [matchMode, setMatchMode] = useState<'sample' | 'custom'>('sample');
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [targetRoleTitle, setTargetRoleTitle] = useState('Python Developer');
  const [customJD, setCustomJD] = useState('');

  // Configurable weights
  const [weightRequired, setWeightRequired] = useState(0.65);
  const [weightPreferred, setWeightPreferred] = useState(0.15);
  const [weightExperience, setWeightExperience] = useState(0.15);
  const [weightRole, setWeightRole] = useState(0.05);

  // Analysis result
  const [analysisResult, setAnalysisResult] = useState<Analysis | null>(null);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [jobsRes, rolesRes, resumesRes] = await Promise.all([
          jobsApi.getJobs(),
          jobsApi.getRoles(),
          resumesApi.getResumes()
        ]);
        setJobs(jobsRes.data);
        setRoles(rolesRes.data);
        setResumes(resumesRes.data);

        if (jobsRes.data.length > 0) {
          setSelectedJobId(jobsRes.data[0].id);
        }
        if (!activeResumeId && resumesRes.data.length > 0) {
          setActiveResumeId(resumesRes.data[0].id);
        }
      } catch (err) {
        showToast('Failed to load job listings.', 'error');
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  const handleRunMatch = async () => {
    if (!activeResumeId) {
      showToast('Please upload or select an active resume first.', 'error');
      navigate('/resumes');
      return;
    }

    try {
      setAnalyzing(true);
      const payload: any = {
        resume_id: activeResumeId,
        custom_weights: {
          required: weightRequired,
          preferred: weightPreferred,
          experience: weightExperience,
          role: weightRole,
        },
      };

      if (matchMode === 'sample' && selectedJobId) {
        payload.job_id = selectedJobId;
      } else {
        if (!customJD.trim()) {
          showToast('Please paste a job description.', 'error');
          setAnalyzing(false);
          return;
        }
        payload.custom_job_description = customJD;
        payload.target_role_title = targetRoleTitle;
      }

      const res = await analysisApi.analyze(payload);
      setAnalysisResult(res.data);
      showToast('Compatibility analysis completed successfully!', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Analysis failed. Please check inputs.';
      showToast(msg, 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div>
      <Navbar
        title="Intelligent Job Matcher & Compatibility Scoring"
        subtitle="Sentence Transformer & TF-IDF hybrid matching with explainable multi-factor scoring"
      />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Active Resume Selection Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate Workspace:</span>
            <select
              value={activeResumeId || ''}
              onChange={(e) => setActiveResumeId(Number(e.target.value))}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.filename} ({r.candidate_name || 'Candidate'})
                </option>
              ))}
              {!resumes.length && <option value="">No resumes found</option>}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMatchMode('sample')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                matchMode === 'sample'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Curated Sample Jobs ({jobs.length})
            </button>
            <button
              onClick={() => setMatchMode('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                matchMode === 'custom'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Paste Custom JD
            </button>
          </div>
        </div>

        {/* Input Configuration & Selected Job Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Target Job Selection */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            {matchMode === 'sample' ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-800">Select Target Job Posting</h3>
                  <span className="text-xs text-slate-400">Curated Indian & Global Software Openings</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {jobs.map((job) => {
                    const isSelected = selectedJobId === job.id;
                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJobId(job.id)}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{job.title}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                          <span className="flex items-center gap-1"><Building className="w-3 h-3 text-slate-400" />{job.company}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" />{job.location}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedJob && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{selectedJob.title}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                        {selectedJob.experience_level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {selectedJob.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedJob.skills.map((s) => (
                        <span
                          key={s.skill_id}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            s.importance === 'required'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {s.skill_name} ({s.importance})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-800">Custom Job Description Input</h3>
                  <select
                    value={targetRoleTitle}
                    onChange={(e) => setTargetRoleTitle(e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.title}>{r.title}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  rows={7}
                  placeholder="Paste the full job description text here (including required qualifications, technologies, and preferred skills)..."
                  value={customJD}
                  onChange={(e) => setCustomJD(e.target.value)}
                  className="w-full p-3.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </>
            )}

            <button
              onClick={handleRunMatch}
              disabled={analyzing}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {analyzing ? 'Evaluating Embeddings & Skill Gaps...' : 'Compute Explainable Compatibility Score'}
              {!analyzing && <Sparkles className="w-4 h-4" />}
            </button>
          </div>

          {/* Scoring Weight Configuration Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Weight Tuner</h3>
              </div>
              <p className="text-xs text-slate-400">
                Tune the multi-factor scoring formula to align with specific hiring priorities.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Required Skills</span>
                  <span>{Math.round(weightRequired * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.30"
                  max="0.85"
                  step="0.05"
                  value={weightRequired}
                  onChange={(e) => setWeightRequired(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Preferred Skills</span>
                  <span>{Math.round(weightPreferred * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.30"
                  step="0.05"
                  value={weightPreferred}
                  onChange={(e) => setWeightPreferred(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Project & Experience</span>
                  <span>{Math.round(weightExperience * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.35"
                  step="0.05"
                  value={weightExperience}
                  onChange={(e) => setWeightExperience(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Role Semantic Title</span>
                  <span>{Math.round(weightRole * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.00"
                  max="0.15"
                  step="0.05"
                  value={weightRole}
                  onChange={(e) => setWeightRole(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700 block mb-0.5">Automated Renormalization:</span>
              If preferred skills are absent from a posting, weights are dynamically scaled so active factors total 100%.
            </div>
          </div>
        </div>

        {/* Results Section */}
        {analysisResult && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase text-indigo-600 tracking-wider">Analysis Result</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                    Compatibility for {analysisResult.target_role_title}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to="/skill-gaps"
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    View Skill Gaps ({analysisResult.skill_gaps.length}) <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/roadmaps"
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-100 transition-colors"
                  >
                    <Map className="w-3.5 h-3.5" /> Generate Roadmap
                  </Link>
                </div>
              </div>

              {/* Gauge and 4-factor breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="flex justify-center md:border-r border-slate-100 pr-6">
                  <ScoreGauge
                    score={analysisResult.overall_compatibility_score}
                    size={180}
                    label="Overall Compatibility"
                  />
                </div>

                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Factor Breakdown & Sub-Scores
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-500 font-medium block">Required Skills Coverage</span>
                      <span className="text-xl font-bold text-slate-800">{analysisResult.required_skill_score}%</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-500 font-medium block">Preferred Skills Coverage</span>
                      <span className="text-xl font-bold text-slate-800">{analysisResult.preferred_skill_score}%</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-500 font-medium block">Project & Experience Alignment</span>
                      <span className="text-xl font-bold text-slate-800">{analysisResult.project_experience_score}%</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-xs text-slate-500 font-medium block">Semantic Embedding Similarity</span>
                      <span className="text-xl font-bold text-slate-800">{analysisResult.semantic_similarity_score}%</span>
                    </div>
                  </div>

                  {/* Explainability Narrative */}
                  <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-indigo-900 block mb-1">Explainable Reasoning:</span>
                    {analysisResult.scoring_explanation}
                  </div>
                </div>
              </div>

              {/* Legal / Ethical Disclaimer Banner */}
              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 italic flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Notice: The compatibility score is an explainable algorithmic skill assessment. It does not represent a hiring guarantee or probability of job offer.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

