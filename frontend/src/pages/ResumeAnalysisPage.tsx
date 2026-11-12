import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resumesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/Navbar';
import { Resume, ResumeSkill } from '../types';
import {
  Brain,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  FolderGit2,
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Search,
  Filter,
  Layers,
  Code
} from 'lucide-react';

export const ResumeAnalysisPage: React.FC = () => {
  const { activeResumeId } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    if (!activeResumeId) {
      setLoading(false);
      return;
    }
    const loadResume = async () => {
      try {
        setLoading(true);
        const res = await resumesApi.getResume(activeResumeId);
        setResume(res.data);
      } catch (err) {
        showToast('Failed to load resume intelligence data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadResume();
  }, [activeResumeId]);

  if (!activeResumeId || !resume) {
    return (
      <div>
        <Navbar title="Resume Intelligence" subtitle="Deep NLP parsing, skill extraction, and contextual evidence" />
        <div className="p-12 max-w-xl mx-auto text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No active resume selected</h3>
          <p className="text-xs text-slate-500">
            Please upload or select a resume in the Resume Manager to inspect extracted skills and evidence.
          </p>
          <Link
            to="/resumes"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-colors"
          >
            Go to Resume Manager <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Group skills by category
  const categories = ['All', ...Array.from(new Set(resume.skills.map((s) => s.category || 'Other')))];

  const filteredSkills = resume.skills.filter((s) => {
    const matchesQuery = s.skill_name.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesQuery && matchesCat;
  });

  return (
    <div>
      <Navbar
        title="Candidate Resume Intelligence"
        subtitle={`NLP Evidence Analysis for ${resume.filename} • Candidate: ${resume.candidate_name || 'Extracted Profile'}`}
      />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Candidate Profile Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xl shadow-md shadow-indigo-100">
              {resume.candidate_name ? resume.candidate_name[0].toUpperCase() : 'C'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{resume.candidate_name || 'Candidate'}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                {resume.candidate_email && <span>{resume.candidate_email}</span>}
                {resume.candidate_phone && <span>• {resume.candidate_phone}</span>}
                <span>• {resume.skills.length} Technical Skills</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/jobs"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 flex items-center gap-2 transition-all"
            >
              <Briefcase className="w-4 h-4" /> Match With Target Job
            </Link>
            <Link
              to="/improve"
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Resume Enhancer
            </Link>
          </div>
        </div>

        {/* Skill Category & Evidence Explorer */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Extracted Skills & Context Evidence</h3>
              <p className="text-xs text-slate-400">
                Distinguishes mere mentions from demonstrated project/experience evidence
              </p>
            </div>

            {/* Search and Category Filter */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter skills..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">{s.skill_name}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-700">
                    {s.category || 'Skill'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  {s.has_experience_evidence ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Demonstrated Evidence
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                      Mentioned in Resume
                    </span>
                  )}
                  <span className="text-slate-400">• Conf: {Math.round(s.confidence * 100)}%</span>
                </div>

                {s.source_sentence && (
                  <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100 line-clamp-2">
                    "{s.source_sentence}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Structured Sections Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Education */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-indigo-600 font-bold text-sm">
              <GraduationCap className="w-4 h-4" />
              <span>Education Section</span>
            </div>
            {(resume.education_summary || []).length > 0 ? (
              <ul className="space-y-2 text-xs text-slate-600">
                {resume.education_summary.map((edu: any, i: number) => (
                  <li key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    {typeof edu === 'object' ? edu.degree || JSON.stringify(edu) : edu}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">Education qualifications extracted from document body.</p>
            )}
          </div>

          {/* Work Experience */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-blue-600 font-bold text-sm">
              <Briefcase className="w-4 h-4" />
              <span>Experience Section</span>
            </div>
            {(resume.experience_summary || []).length > 0 ? (
              <ul className="space-y-2 text-xs text-slate-600">
                {resume.experience_summary.map((exp: any, i: number) => (
                  <li key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    {typeof exp === 'object' ? exp.details || JSON.stringify(exp) : exp}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">Employment history extracted from document body.</p>
            )}
          </div>

          {/* Projects */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-600 font-bold text-sm">
              <FolderGit2 className="w-4 h-4" />
              <span>Projects Section</span>
            </div>
            {(resume.projects_summary || []).length > 0 ? (
              <ul className="space-y-2 text-xs text-slate-600">
                {resume.projects_summary.map((proj: any, i: number) => (
                  <li key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    {typeof proj === 'object' ? proj.title || JSON.stringify(proj) : proj}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">Projects summary extracted from document body.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

