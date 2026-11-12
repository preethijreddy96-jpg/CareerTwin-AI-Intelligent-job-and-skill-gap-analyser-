import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi, jobsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/Navbar';
import { JobRole } from '../types';
import { Target, GraduationCap, Briefcase, Sparkles, Check, ArrowRight } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [roles, setRoles] = useState<JobRole[]>([]);
  const [currentTitle, setCurrentTitle] = useState(user?.profile?.current_title || '');
  const [targetRole, setTargetRole] = useState(user?.profile?.target_role || 'Python Developer');
  const [yearsExperience, setYearsExperience] = useState<number>(user?.profile?.years_experience || 1);
  const [educationLevel, setEducationLevel] = useState(user?.profile?.education_level || "Bachelor's Degree");
  const [institution, setInstitution] = useState(user?.profile?.institution || '');
  const [graduationYear, setGraduationYear] = useState<number>(user?.profile?.graduation_year || 2025);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    user?.profile?.career_interests || ['Backend Engineering', 'Cloud Services']
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    jobsApi.getRoles().then((res) => setRoles(res.data)).catch(console.error);
  }, []);

  const interestOptions = [
    'Backend Engineering',
    'Frontend Engineering',
    'Full-Stack Architecture',
    'Artificial Intelligence / NLP',
    'Data Science & Analytics',
    'DevOps & Cloud Systems',
    'Database Administration',
    'QA & Automated Testing'
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await profileApi.updateProfile({
        current_title: currentTitle,
        target_role: targetRole,
        years_experience: Number(yearsExperience),
        education_level: educationLevel,
        institution,
        graduation_year: Number(graduationYear),
        career_interests: selectedInterests,
      });

      await refreshUser();
      showToast('Career profile completed! Proceed to upload your resume.', 'success');
      navigate('/resumes');
    } catch (err) {
      showToast('Failed to save profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Navbar title="Career Profile Onboarding" subtitle="Define your target aspirations, education, and technical interests" />

      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Complete Your Candidate Baseline</h2>
              <p className="text-xs text-slate-400">This baseline calibrates your job match scores and recommended career pathways.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Target Role & Current Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Target Dream Role *
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.title}>
                      {r.title} ({r.category})
                    </option>
                  ))}
                  {!roles.length && <option value="Python Developer">Python Developer</option>}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Current Title / Status
                </label>
                <input
                  type="text"
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                  placeholder="e.g. Computer Science Student / Junior Developer"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Experience & Education */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="40"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Education Level
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white"
                >
                  <option value="High School / Diploma">High School / Diploma</option>
                  <option value="Bachelor's Degree">Bachelor's Degree (B.Tech / B.E / B.Sc / BCA)</option>
                  <option value="Master's Degree">Master's Degree (M.Tech / M.S / MCA / M.Sc)</option>
                  <option value="Doctorate / Ph.D">Doctorate / Ph.D</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Graduation Year
                </label>
                <input
                  type="number"
                  min="1990"
                  max="2032"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Institution */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                College / University / Institution
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. National Institute of Technology / University"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>

            {/* Career Interests Tag Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Technical Fields of Interest
              </label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((opt) => {
                  const isSelected = selectedInterests.includes(opt);
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => toggleInterest(opt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save & Continue to Resumes'}
                {!saving && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

