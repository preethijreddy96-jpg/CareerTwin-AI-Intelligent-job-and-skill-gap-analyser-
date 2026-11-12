import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject JWT access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('careertwin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept 401 unauthorized to redirect or clear session
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-clear if it's already on login/register attempt
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('careertwin_token');
        localStorage.removeItem('careertwin_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { email: string; password: string; full_name: string }) => api.post('/auth/register', data),
  verifyEmail: (data: { email: string; code: string }) => api.post('/auth/verify-email', data),
  resendCode: (data: { email: string }) => api.post('/auth/resend-code', data),
  getMe: () => api.get('/auth/me'),
};

export const profileApi = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data: any) => api.put('/profile', data),
};

export const resumesApi = {
  uploadResume: (formData: FormData) => api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getResumes: () => api.get('/resumes'),
  getResume: (id: number) => api.get(`/resumes/${id}`),
  updateResume: (id: number, data: any) => api.put(`/resumes/${id}`, data),
  deleteResume: (id: number) => api.delete(`/resumes/${id}`),
};

export const analysisApi = {
  analyze: (data: {
    resume_id: number;
    job_id?: number;
    target_role_title?: string;
    custom_job_description?: string;
    custom_weights?: Record<string, number>;
  }) => api.post('/analysis/analyze', data),
  getAnalysis: (id: number) => api.get(`/analysis/${id}`),
};

export const jobsApi = {
  getJobs: () => api.get('/jobs'),
  getJob: (id: number) => api.get(`/jobs/${id}`),
  getRoles: () => api.get('/jobs/roles'),
  getRecommendations: (resumeId: number, limit = 5) =>
    api.get(`/jobs/recommendations?resume_id=${resumeId}&limit=${limit}`),
};

export const skillsApi = {
  getSkills: (query?: string, category?: string) => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (category) params.append('category', category);
    return api.get(`/skills?${params.toString()}`);
  },
  getGaps: (analysisId: number) => api.get(`/skills/gaps/${analysisId}`),
};

export const roadmapsApi = {
  generateRoadmap: (data: { analysis_id: number; target_role?: string }) =>
    api.post('/roadmaps/generate', data),
  getRoadmaps: () => api.get('/roadmaps'),
  getRoadmap: (id: number) => api.get(`/roadmaps/${id}`),
  updateTaskStatus: (taskId: number, is_completed: boolean) =>
    api.patch(`/roadmaps/tasks/${taskId}`, { is_completed }),
};

export const improvementsApi = {
  improveResume: (data: {
    resume_id: number;
    job_description?: string;
    target_role?: string;
  }) => api.post('/resumes/improve', data),
};

export const dashboardApi = {
  getOverview: () => api.get('/dashboard/overview'),
};

export default api;

