export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: number;
  current_title?: string;
  target_role?: string;
  years_experience: number;
  education_level?: string;
  institution?: string;
  graduation_year?: number;
  career_interests: string[];
  bio?: string;
}

export interface ResumeSkill {
  id: number;
  skill_name: string;
  category?: string;
  extraction_method: string;
  confidence: number;
  has_experience_evidence: boolean;
  source_sentence?: string;
  is_verified: boolean;
}

export interface Resume {
  id: number;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  candidate_name?: string;
  candidate_email?: string;
  candidate_phone?: string;
  education_summary: any[];
  experience_summary: any[];
  projects_summary: any[];
  created_at: string;
  parsed_text?: string;
  skills: ResumeSkill[];
}

export interface JobSkill {
  skill_id: number;
  skill_name: string;
  category: string;
  importance: 'required' | 'preferred';
  weight: number;
}

export interface Job {
  id: number;
  role_id?: number;
  title: string;
  company: string;
  location: string;
  experience_level: string;
  description: string;
  is_sample: boolean;
  skills: JobSkill[];
}

export interface JobRole {
  id: number;
  title: string;
  slug: string;
  description: string;
  category?: string;
  avg_salary_range?: string;
  market_demand: string;
  esco_code?: string;
}

export interface SkillGap {
  id: number;
  skill_name: string;
  category?: string;
  importance: 'required' | 'preferred';
  match_status: 'matched' | 'partial' | 'missing';
  match_score: number;
  gap_priority_score: number;
  resume_evidence?: string;
  classification_reason?: string;
  suggested_improvement?: string;
}

export interface Analysis {
  id: number;
  resume_id: number;
  job_id?: number;
  target_role_title?: string;
  overall_compatibility_score: number;
  required_skill_score: number;
  preferred_skill_score: number;
  project_experience_score: number;
  role_relevance_score: number;
  semantic_similarity_score: number;
  tfidf_similarity_score: number;
  scoring_weights: Record<string, number>;
  scoring_explanation?: string;
  created_at: string;
  skill_gaps: SkillGap[];
}

export interface CareerRecommendation {
  role_title: string;
  slug: string;
  match_score: number;
  category: string;
  market_demand: string;
  avg_salary_range: string;
  description: string;
  supporting_skills: string[];
  missing_skills: string[];
  recommended_next_steps: string[];
}

export interface LearningTask {
  id: number;
  skill_name: string;
  learning_priority: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  sequence_order: number;
  learning_objective: string;
  practice_activity: string;
  mini_project_idea: string;
  estimated_hours: number;
  is_completed: boolean;
  completed_at?: string;
}

export interface LearningRoadmap {
  id: number;
  target_role: string;
  title: string;
  description?: string;
  total_tasks: number;
  completed_tasks: number;
  created_at: string;
  tasks: LearningTask[];
}

export interface BulletImprovement {
  original_text: string;
  critique: string;
  improved_version: string;
  missing_metric: boolean;
}

export interface ResumeImprovement {
  overall_score: number;
  ats_formatting_score: number;
  action_verb_score: number;
  quantifiable_metrics_score: number;
  matched_keywords: string[];
  missing_critical_keywords: string[];
  weak_bullet_points: BulletImprovement[];
  summary_suggestions: string;
  technical_skills_formatting_suggestion: string;
  disclaimer: string;
}

export interface DashboardOverview {
  total_skills_count: number;
  resumes_analyzed_count: number;
  avg_compatibility_score: number;
  learning_progress_percentage: number;
  skills_matched_count: number;
  skills_missing_count: number;
  best_matching_roles: {
    role_title: string;
    compatibility_score: number;
    is_demo_seed: boolean;
  }[];
  recent_analyses: {
    id: number;
    target_role: string;
    score: number;
    date: string;
    resume_id: number;
  }[];
  active_roadmap?: LearningRoadmap;
  recent_activity: {
    id: number;
    title: string;
    event_type: string;
    timestamp: string;
  }[];
}
