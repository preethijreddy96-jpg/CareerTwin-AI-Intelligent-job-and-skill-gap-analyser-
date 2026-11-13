from datetime import datetime
from typing import List, Optional, Dict, Any
import re
import socket
from pydantic import BaseModel, EmailStr, Field, field_validator

TRUSTED_MAJOR_EMAIL_DOMAINS = {
    'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.in', 'outlook.com',
    'hotmail.com', 'live.com', 'msn.com', 'icloud.com', 'me.com', 'mac.com',
    'proton.me', 'protonmail.com', 'zoho.com', 'aol.com', 'mail.com',
    'gmx.com', 'yandex.com', 'careertwin.ai', 'localhost', 'test.careertwin.ai'
}

DISPOSABLE_DOMAINS = {
    'mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com',
    'trashmail.com', 'fakeinbox.com', 'yopmail.com', 'throwawaymail.com',
    'temp-mail.org', 'sharklasers.com', 'getairmail.com', 'dispostable.com',
    'fakemailgenerator.com', 'burnermail.io', 'maildrop.cc', 'crazymailing.com',
    'mytemp.email', 'nada.ltd', 'mohmal.com', 'inboxkitten.com', 'fake.com',
    'test.com', 'invalid.com', 'example.com', 'nowhere.com'
}

def validate_deliverable_email(email_str: str) -> str:
    email_str = email_str.strip().lower()
    parts = email_str.split('@')
    if len(parts) != 2:
        raise ValueError("Invalid email format.")
    username, domain = parts
    if not domain or '.' not in domain:
        raise ValueError("Email must contain a valid domain (e.g., gmail.com).")

    if domain in DISPOSABLE_DOMAINS:
        raise ValueError(f"Disposable or temporary email provider '@{domain}' is not allowed. Please use a permanent email address.")

    # Trusted major email domains and educational/government institutions are always accepted
    if domain in TRUSTED_MAJOR_EMAIL_DOMAINS or domain.endswith(('.edu', '.ac.in', '.gov', '.edu.in')):
        return email_str

    tld = domain.split('.')[-1]
    if len(tld) < 2 or not tld.isalpha() or tld in {'fake', 'test', 'invalid', 'example'}:
        raise ValueError(f"Email domain has an invalid top-level domain '.{tld}'.")

    # For custom domains, check deliverability if DNS resolution is active on the machine
    try:
        from email_validator import validate_email as lib_validate_email, EmailNotValidError
        lib_validate_email(email_str, check_deliverability=True)
    except EmailNotValidError as e:
        raise ValueError(f"The email domain '@{domain}' cannot receive mail ({str(e)}).")
    except Exception:
        # If DNS check fails due to local sandbox offline mode, format is valid
        pass

    return email_str

# User & Auth
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2)

    @field_validator('email')
    @classmethod
    def validate_email_deliverability(cls, v: str) -> str:
        return validate_deliverable_email(str(v))

    @field_validator('password')
    @classmethod
    def validate_password_complexity(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not re.search(r'[A-Za-z]', v):
            raise ValueError("Password must contain at least one letter.")
        if not re.search(r'\d', v):
            raise ValueError("Password must contain at least one number.")
        if not re.search(r'[!@#$%^&*()_+\-=\[\]{}|;:,.<>?~/]', v):
            raise ValueError("Password must contain at least one special character (!@#$%^&* etc.).")
        return v

class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    google_id: Optional[str] = None
    password: Optional[str] = None


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=4, max_length=10)

class ResendCodeRequest(BaseModel):
    email: EmailStr

class RegistrationResponse(BaseModel):
    message: str
    email: str
    requires_verification: bool = True
    dev_verification_code: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    full_name: str

class UserProfileUpdate(BaseModel):
    current_title: Optional[str] = None
    target_role: Optional[str] = None
    years_experience: Optional[float] = 0.0
    education_level: Optional[str] = None
    institution: Optional[str] = None
    graduation_year: Optional[int] = None
    career_interests: Optional[List[str]] = []
    bio: Optional[str] = None

class UserProfileOut(BaseModel):
    id: int
    current_title: Optional[str]
    target_role: Optional[str]
    years_experience: float
    education_level: Optional[str]
    institution: Optional[str]
    graduation_year: Optional[int]
    career_interests: List[str]
    bio: Optional[str]

    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    is_verified: bool = False
    created_at: datetime
    profile: Optional[UserProfileOut] = None

    class Config:
        from_attributes = True

# Skills
class SkillOut(BaseModel):
    id: int
    name: str
    canonical_name: str
    category: str
    description: Optional[str] = None
    taxonomy_source: str

    class Config:
        from_attributes = True

class ResumeSkillOut(BaseModel):
    id: int
    skill_name: str
    category: Optional[str]
    extraction_method: str
    confidence: float
    has_experience_evidence: bool
    source_sentence: Optional[str]
    is_verified: bool

    class Config:
        from_attributes = True

# Resume
class ResumeOut(BaseModel):
    id: int
    filename: str
    file_type: str
    file_size_bytes: int
    candidate_name: Optional[str]
    candidate_email: Optional[str]
    candidate_phone: Optional[str]
    education_summary: List[Any]
    experience_summary: List[Any]
    projects_summary: List[Any]
    created_at: datetime
    skills: List[ResumeSkillOut] = []

    class Config:
        from_attributes = True

class ResumeDetailOut(ResumeOut):
    parsed_text: str

class ResumeUpdate(BaseModel):
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    candidate_phone: Optional[str] = None
    education_summary: Optional[List[Any]] = None
    experience_summary: Optional[List[Any]] = None
    projects_summary: Optional[List[Any]] = None
    skills_to_add: Optional[List[str]] = None
    skills_to_remove: Optional[List[str]] = None

# Jobs
class JobSkillOut(BaseModel):
    skill_id: int
    skill_name: str
    category: str
    importance: str
    weight: float

class JobOut(BaseModel):
    id: int
    role_id: Optional[int]
    title: str
    company: str
    location: str
    experience_level: str
    description: str
    is_sample: bool
    skills: List[JobSkillOut] = []

    class Config:
        from_attributes = True

class JobRoleOut(BaseModel):
    id: int
    title: str
    slug: str
    description: str
    category: Optional[str]
    avg_salary_range: Optional[str]
    market_demand: str
    esco_code: Optional[str]

    class Config:
        from_attributes = True

# Analysis & Matching
class AnalysisRequest(BaseModel):
    resume_id: int
    job_id: Optional[int] = None
    target_role_title: Optional[str] = None
    custom_job_description: Optional[str] = None
    custom_weights: Optional[Dict[str, float]] = None

class SkillGapOut(BaseModel):
    id: int
    skill_name: str
    category: Optional[str]
    importance: str
    match_status: str
    match_score: float
    gap_priority_score: float
    resume_evidence: Optional[str]
    classification_reason: Optional[str]
    suggested_improvement: Optional[str]

    class Config:
        from_attributes = True

class AnalysisOut(BaseModel):
    id: int
    resume_id: int
    job_id: Optional[int]
    target_role_title: Optional[str]
    overall_compatibility_score: float
    required_skill_score: float
    preferred_skill_score: float
    project_experience_score: float
    role_relevance_score: float
    semantic_similarity_score: float
    tfidf_similarity_score: float
    scoring_weights: Dict[str, float]
    scoring_explanation: Optional[str]
    created_at: datetime
    skill_gaps: List[SkillGapOut] = []

    class Config:
        from_attributes = True

# Recommendations
class CareerRecommendationOut(BaseModel):
    role_title: str
    slug: str
    match_score: float  # percentage 0 - 100
    category: str
    market_demand: str
    avg_salary_range: str
    description: str
    supporting_skills: List[str]
    missing_skills: List[str]
    recommended_next_steps: List[str]

# Roadmaps
class LearningTaskUpdate(BaseModel):
    is_completed: bool

class LearningTaskOut(BaseModel):
    id: int
    skill_name: str
    learning_priority: str
    level: str
    sequence_order: int
    learning_objective: str
    practice_activity: str
    mini_project_idea: str
    estimated_hours: int
    is_completed: bool
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

class RoadmapOut(BaseModel):
    id: int
    target_role: str
    title: str
    description: Optional[str]
    total_tasks: int
    completed_tasks: int
    created_at: datetime
    tasks: List[LearningTaskOut] = []

    class Config:
        from_attributes = True

class RoadmapGenerateRequest(BaseModel):
    analysis_id: int
    target_role: Optional[str] = None

# Resume Improvement
class ResumeImprovementRequest(BaseModel):
    resume_id: int
    job_description: Optional[str] = None
    target_role: Optional[str] = None

class BulletImprovement(BaseModel):
    original_text: str
    critique: str
    improved_version: str
    missing_metric: bool

class ResumeImprovementOut(BaseModel):
    overall_score: float  # 0 to 100
    ats_formatting_score: float
    action_verb_score: float
    quantifiable_metrics_score: float
    matched_keywords: List[str]
    missing_critical_keywords: List[str]
    weak_bullet_points: List[BulletImprovement]
    summary_suggestions: str
    technical_skills_formatting_suggestion: str
    disclaimer: str

# Dashboard
class DashboardOverviewOut(BaseModel):
    total_skills_count: int
    resumes_analyzed_count: int
    avg_compatibility_score: float
    learning_progress_percentage: float
    skills_matched_count: int
    skills_missing_count: int
    best_matching_roles: List[Dict[str, Any]]
    recent_analyses: List[Dict[str, Any]]
    active_roadmap: Optional[RoadmapOut] = None
    recent_activity: List[Dict[str, Any]] = []

