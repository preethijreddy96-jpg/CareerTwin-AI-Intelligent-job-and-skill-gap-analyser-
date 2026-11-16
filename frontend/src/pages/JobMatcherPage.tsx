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
  ShieldCheck,
  Map,
  Building,
  MapPin,
  Search,
  FileText,
  Info,
  Check,
  UploadCloud,
  ChevronRight
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
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter jobs by search query
  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const activeResume = resumes.find((r) => r.id === activeResumeId);
  const requiredSkills = selectedJob?.skills.filter((s) => s.importance === 'required') || [];
  const preferredSkills = selectedJob?.skills.filter((s) => s.importance === 'preferred') || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-50/60 pb-16">
      <Navbar
        title="Intelligent Job Matcher & Compatibility Scoring"
        subtitle="Sentence Transformer & TF-IDF hybrid matching with explainable multi-factor scoring"
      />

      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Top Control Bar: Workspace & Match Mode */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Candidate Workspace Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-900">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Candidate Workspace</span>
            </div>

            {resumes.length > 0 ? (
              <select
                value={activeResumeId || ''}
                onChange={(e) => setActiveResumeId(Number(e.target.value))}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    📄 {r.filename} ({r.candidate_name || 'Candidate'})
                  </option>
                ))}
              </select>
            ) : (
              <Link
                to="/resumes"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
              >
                <UploadCloud className="w-3.5 h-3.5 text-amber-600" />
                <span>No resumes found — Click to Upload</span>
              </Link>
            )}
          </div>

          {/* Segmented Mode Selector */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/60 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setMatchMode('sample')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                matchMode === 'sample'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Curated Sample Jobs ({jobs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setMatchMode('custom')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                matchMode === 'custom'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Paste Custom JD</span>
            </button>
          </div>
        </div>

        {/* Main Work Area: 2-Column Structured Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Job Selector List or Custom Input (5 of 12 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
            {matchMode === 'sample' ? (
              <>
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Select Opening</h3>
                    <p className="text-[11px] text-slate-400">Curated Indian & Global Tech Roles</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {filteredJobs.length} Available
                  </span>
                </div>

                {/* Search Filter */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by role, company, or city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Vertical Scrollable Job Cards List */}
                <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                  {filteredJobs.map((job) => {
                    const isSelected = selectedJobId === job.id;
                    const initial = job.company.charAt(0).toUpperCase();

                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJobId(job.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-500/30'
                            : 'border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <h4
                              className={`text-xs font-bold truncate ${
                                isSelected ? 'text-indigo-950 font-extrabold' : 'text-slate-800'
                              }`}
                            >
                              {job.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                              <span className="font-medium text-slate-600 truncate max-w-[120px]">{job.company}</span>
                              <span className="text-slate-300">•</span>
                              <span className="flex items-center gap-0.5 text-slate-400 truncate max-w-[120px]">
                                <MapPin className="w-2.5 h-2.5" />
                                {job.location}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-indigo-200/70 text-indigo-900 font-bold'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {job.experience_level.split('/')[0].trim()}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-indigo-600 mt-0.5" />}
                        </div>
                      </div>
                    );
                  })}

                  {filteredJobs.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400">
                      No jobs matched "{searchQuery}"
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Custom Job Description Mode */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Custom Job Input</h3>
                    <p className="text-[11px] text-slate-400">Paste any JD to parse requirements dynamically</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Benchmark Taxonomy Role
                  </label>
                  <select
                    value={targetRoleTitle}
                    onChange={(e) => setTargetRoleTitle(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.title}>
                        {r.title} ({r.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Job Description Content
                  </label>
                  <textarea
                    rows={12}
                    placeholder="Paste the full job description text here, including requirements, qualifications, and preferred technologies..."
                    value={customJD}
                    onChange={(e) => setCustomJD(e.target.value)}
                    className="w-full p-3.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed font-sans"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 text-right">
                    {customJD.length} characters entered
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Job Details & Weight Tuner & Action Button (7 of 12 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card 1: Selected Job Specification */}
            {matchMode === 'sample' && selectedJob && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-400"></div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      Selected Target Position
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">{selectedJob.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {selectedJob.company}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {selectedJob.location}
                      </span>
                    </div>
                  </div>

                  <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200/60">
                    {selectedJob.experience_level}
                  </span>
                </div>

                {/* Job Summary Description */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Overview</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                    {selectedJob.description}
                  </p>
                </div>

                {/* Structured Skill Requirements */}
                <div className="space-y-3">
                  {/* Required Skills */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        Required Core Skills ({requiredSkills.length})
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">Weight: {Math.round(weightRequired * 100)}%</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {requiredSkills.map((s) => (
                        <span
                          key={s.skill_id}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200/80 shadow-xs"
                        >
                          {s.skill_name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Skills */}
                  {preferredSkills.length > 0 && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          Preferred Skills ({preferredSkills.length})
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">Weight: {Math.round(weightPreferred * 100)}%</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {preferredSkills.map((s) => (
                          <span
                            key={s.skill_id}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs"
                          >
                            {s.skill_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Card 2: Multi-Factor Scoring Weight Tuner */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Multi-Factor Weight Tuner</h3>
                    <p className="text-[11px] text-slate-400">Calibrate the explainable scoring formula</p>
                  </div>
                </div>

                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Total: {Math.round((weightRequired + weightPreferred + weightExperience + weightRole) * 100)}%
                </span>
              </div>

              {/* 2x2 Grid of Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Required Skills Slider */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5 text-rose-700">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      Required Skills
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-900 font-extrabold text-xs">
                      {Math.round(weightRequired * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.30"
                    max="0.85"
                    step="0.05"
                    value={weightRequired}
                    onChange={(e) => setWeightRequired(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">Primary technical qualification threshold</p>
                </div>

                {/* Preferred Skills Slider */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5 text-indigo-700">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      Preferred Skills
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-900 font-extrabold text-xs">
                      {Math.round(weightPreferred * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.30"
                    step="0.05"
                    value={weightPreferred}
                    onChange={(e) => setWeightPreferred(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">Bonus competencies and frameworks</p>
                </div>

                {/* Project & Experience Slider */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5 text-teal-700">
                      <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                      Project & Experience
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-900 font-extrabold text-xs">
                      {Math.round(weightExperience * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.35"
                    step="0.05"
                    value={weightExperience}
                    onChange={(e) => setWeightExperience(Number(e.target.value))}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">Real-world deliverables & tenure</p>
                </div>

                {/* Role Semantic Title Slider */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5 text-violet-700">
                      <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                      Role Semantic Title
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-900 font-extrabold text-xs">
                      {Math.round(weightRole * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.00"
                    max="0.15"
                    step="0.05"
                    value={weightRole}
                    onChange={(e) => setWeightRole(Number(e.target.value))}
                    className="w-full accent-violet-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">Embedding alignment with role taxonomy</p>
                </div>
              </div>

              {/* Renormalization Info Pill */}
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-start gap-2.5 text-[11px] text-slate-600">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-indigo-900 font-bold">Automated Renormalization: </strong>
                  If preferred skills are omitted from a posting, weights are dynamically scaled so active factors consistently sum to 100%.
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleRunMatch}
                disabled={analyzing || !activeResumeId}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Computing Semantic Embeddings & Skill Gaps...</span>
                  </>
                ) : (
                  <>
                    <span>Compute Explainable Compatibility Score</span>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </>
                )}
              </button>

              {!activeResumeId && (
                <p className="text-center text-xs text-amber-700 font-semibold flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Please select or upload a candidate resume to run compatibility scoring.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {analysisResult && (
          <div className="space-y-6 pt-4 animate-fadeIn">
            <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-lg shadow-slate-100 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-600"></div>

              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase text-indigo-600 tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    Verified Analysis Result
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1.5">
                    Compatibility for {analysisResult.target_role_title}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to="/skill-gaps"
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200/80"
                  >
                    View Skill Gaps ({analysisResult.skill_gaps.length}) <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/roadmaps"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all"
                  >
                    <Map className="w-3.5 h-3.5" /> Generate Roadmap
                  </Link>
                </div>
              </div>

              {/* Gauge and 4-Factor Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="flex justify-center md:border-r border-slate-100 pr-0 md:pr-6 py-2">
                  <ScoreGauge
                    score={analysisResult.overall_compatibility_score}
                    size={190}
                    label="Overall Compatibility"
                  />
                </div>

                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Factor Breakdown & Sub-Scores
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Required Skills */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-rose-50/60 to-white border border-rose-100 shadow-xs">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-rose-800 font-bold">Required Skills Coverage</span>
                        <span className="text-base font-extrabold text-rose-700">{analysisResult.required_skill_score}%</span>
                      </div>
                      <div className="w-full bg-rose-100/70 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${analysisResult.required_skill_score}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Preferred Skills */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-sky-50/60 to-white border border-sky-100 shadow-xs">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-sky-800 font-bold">Preferred Skills Coverage</span>
                        <span className="text-base font-extrabold text-sky-700">{analysisResult.preferred_skill_score}%</span>
                      </div>
                      <div className="w-full bg-sky-100/70 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-sky-500 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${analysisResult.preferred_skill_score}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Project & Experience */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-teal-50/60 to-white border border-teal-100 shadow-xs">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-teal-800 font-bold">Project & Experience Alignment</span>
                        <span className="text-base font-extrabold text-teal-700">{analysisResult.project_experience_score}%</span>
                      </div>
                      <div className="w-full bg-teal-100/70 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-teal-500 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${analysisResult.project_experience_score}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Semantic Similarity */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-violet-50/60 to-white border border-violet-100 shadow-xs">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-violet-800 font-bold">Semantic Embedding Similarity</span>
                        <span className="text-base font-extrabold text-violet-700">{analysisResult.semantic_similarity_score}%</span>
                      </div>
                      <div className="w-full bg-violet-100/70 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-violet-500 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${analysisResult.semantic_similarity_score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Explainability Narrative */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/80 via-purple-50/40 to-white border border-indigo-100 text-xs text-slate-700 leading-relaxed shadow-xs">
                    <span className="font-bold text-indigo-900 flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Explainable Model Rationale:
                    </span>
                    {analysisResult.scoring_explanation}
                  </div>
                </div>
              </div>

              {/* Legal Disclaimer */}
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
