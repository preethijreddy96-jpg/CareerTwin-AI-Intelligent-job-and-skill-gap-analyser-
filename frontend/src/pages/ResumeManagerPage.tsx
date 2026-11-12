import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/Navbar';
import { Modal } from '../components/Modal';
import { Resume, ResumeSkill } from '../types';
import {
  Upload,
  FileText,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  X,
  FileCheck,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const ResumeManagerPage: React.FC = () => {
  const { activeResumeId, setActiveResumeId } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Selected resume for viewing / editing modal
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [candidateNameEdit, setCandidateNameEdit] = useState('');
  const [candidateEmailEdit, setCandidateEmailEdit] = useState('');
  const [candidatePhoneEdit, setCandidatePhoneEdit] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await resumesApi.getResumes();
      setResumes(res.data);
      if (!activeResumeId && res.data.length > 0) {
        setActiveResumeId(res.data[0].id);
      }
    } catch (err) {
      showToast('Failed to load resumes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileUpload = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      showToast('Unsupported file type. Please upload a PDF or DOCX file.', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('File size exceeds the 10MB limit.', 'error');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await resumesApi.uploadResume(formData);
      showToast(`Resume '${file.name}' processed successfully! ${res.data.skills.length} skills identified.`, 'success');
      setActiveResumeId(res.data.id);
      await fetchResumes();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Resume extraction failed. Check if the PDF is selectable text.';
      showToast(msg, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await resumesApi.deleteResume(id);
      showToast('Resume deleted successfully.', 'success');
      if (activeResumeId === id) {
        const remaining = resumes.filter((r) => r.id !== id);
        setActiveResumeId(remaining.length > 0 ? remaining[0].id : null);
      }
      fetchResumes();
    } catch (err) {
      showToast('Failed to delete resume.', 'error');
    }
  };

  const openEditModal = (resume: Resume) => {
    setSelectedResume(resume);
    setCandidateNameEdit(resume.candidate_name || '');
    setCandidateEmailEdit(resume.candidate_email || '');
    setCandidatePhoneEdit(resume.candidate_phone || '');
    setIsEditModalOpen(true);
  };

  const handleAddManualSkill = async () => {
    if (!newSkillInput.trim() || !selectedResume) return;
    try {
      const res = await resumesApi.updateResume(selectedResume.id, {
        skills_to_add: [newSkillInput.trim()],
      });
      setSelectedResume(res.data);
      setNewSkillInput('');
      showToast(`Skill '${newSkillInput.trim()}' added!`, 'success');
      fetchResumes();
    } catch (err) {
      showToast('Failed to add skill.', 'error');
    }
  };

  const handleRemoveSkill = async (skillName: string) => {
    if (!selectedResume) return;
    try {
      const res = await resumesApi.updateResume(selectedResume.id, {
        skills_to_remove: [skillName],
      });
      setSelectedResume(res.data);
      showToast(`Removed skill '${skillName}'`, 'info');
      fetchResumes();
    } catch (err) {
      showToast('Failed to remove skill.', 'error');
    }
  };

  const handleSaveContactEdit = async () => {
    if (!selectedResume) return;
    try {
      const res = await resumesApi.updateResume(selectedResume.id, {
        candidate_name: candidateNameEdit,
        candidate_email: candidateEmailEdit,
        candidate_phone: candidatePhoneEdit,
      });
      setSelectedResume(res.data);
      setIsEditModalOpen(false);
      showToast('Resume metadata updated successfully!', 'success');
      fetchResumes();
    } catch (err) {
      showToast('Failed to update resume details.', 'error');
    }
  };

  return (
    <div>
      <Navbar
        title="Resume Intelligence & Document Manager"
        subtitle="Upload, parse, verify skills, and maintain your career baseline"
      />

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Upload Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-indigo-600 bg-indigo-50/60 scale-[1.01]'
              : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          />

          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Upload className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-slate-800">
            {uploading ? 'Extracting & Parsing Text with PyMuPDF/spaCy...' : 'Drag and drop your resume here, or click to browse'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Supported formats: PDF (.pdf) and Word (.docx). File size limit: 10MB.
            Unreadable scanned images without text will be flagged.
          </p>

          <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> spaCy Phrase Matcher
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> ESCO Taxonomy
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Evidence Context
            </span>
          </div>
        </div>

        {/* Resumes List Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Your Uploaded Resumes ({resumes.length})</h3>
              <p className="text-xs text-slate-400">Click any resume to set it as active workspace for job matching</p>
            </div>
            {activeResumeId && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Resume ID: #{activeResumeId}
              </span>
            )}
          </div>

          {resumes.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No resumes uploaded yet. Upload a PDF or DOCX file to begin.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {resumes.map((r) => {
                const isActive = activeResumeId === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setActiveResumeId(r.id)}
                    className={`p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors cursor-pointer ${
                      isActive ? 'bg-indigo-50/40 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs uppercase shrink-0">
                        {r.file_type}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 text-sm">{r.filename}</h4>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {r.candidate_name || 'Candidate'} • {r.skills.length} Extracted Skills • {Math.round(r.file_size_bytes / 1024)} KB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(r);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Verify & Edit</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveResumeId(r.id);
                          navigate('/analysis');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Intelligence Deep-Dive</span>
                      </button>

                      <button
                        onClick={(e) => handleDelete(r.id, e)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete resume"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit & Verification Modal */}
      {selectedResume && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Verify & Correct: ${selectedResume.filename}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Candidate Name</label>
                <input
                  type="text"
                  value={candidateNameEdit}
                  onChange={(e) => setCandidateNameEdit(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Email</label>
                <input
                  type="email"
                  value={candidateEmailEdit}
                  onChange={(e) => setCandidateEmailEdit(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Phone</label>
                <input
                  type="text"
                  value={candidatePhoneEdit}
                  onChange={(e) => setCandidatePhoneEdit(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Extracted Skills List with Remove Buttons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Extracted Skills ({selectedResume.skills.length})
                </label>
                <span className="text-[10px] text-slate-400">Click &times; to remove false positives</span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                {selectedResume.skills.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-slate-200 text-slate-800 shadow-2xs"
                  >
                    <span>{s.skill_name}</span>
                    {s.has_experience_evidence && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Experience evidenced"></span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s.skill_name)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Add Manual Skill */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add missing skill (e.g. Docker, PyTorch, GraphQL)..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddManualSkill())}
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddManualSkill}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Skill
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveContactEdit}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

