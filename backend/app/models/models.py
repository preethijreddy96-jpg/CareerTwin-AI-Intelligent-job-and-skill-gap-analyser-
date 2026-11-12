import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, ForeignKey,
    DateTime, Enum as SQLEnum, JSON, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class MatchStatus(str, enum.Enum):
    MATCHED = "matched"
    PARTIAL = "partial"
    MISSING = "missing"

class SkillImportance(str, enum.Enum):
    REQUIRED = "required"
    PREFERRED = "preferred"

class SkillLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_code = Column(String(10), nullable=True)
    verification_code_expires = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")
    roadmaps = relationship("LearningRoadmap", back_populates="user", cascade="all, delete-orphan")
    progress_records = relationship("UserProgress", back_populates="user", cascade="all, delete-orphan")

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    current_title = Column(String(255), nullable=True)
    target_role = Column(String(255), nullable=True)
    years_experience = Column(Float, default=0.0)
    education_level = Column(String(100), nullable=True)  # e.g., Bachelor's, Master's, etc.
    institution = Column(String(255), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    career_interests = Column(JSON, default=list)  # list of strings
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf or docx
    file_size_bytes = Column(Integer, nullable=False)
    parsed_text = Column(Text, nullable=False)
    
    # Extracted candidate structured metadata
    candidate_name = Column(String(255), nullable=True)
    candidate_email = Column(String(255), nullable=True)
    candidate_phone = Column(String(100), nullable=True)
    education_summary = Column(JSON, default=list)  # structured list of education objects
    experience_summary = Column(JSON, default=list) # structured list of experiences
    projects_summary = Column(JSON, default=list)   # structured list of projects
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="resumes")
    resume_skills = relationship("ResumeSkill", back_populates="resume", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="resume", cascade="all, delete-orphan")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    canonical_name = Column(String(255), index=True, nullable=False)
    category = Column(String(100), index=True, nullable=False)  # Programming Language, Framework, Database, Tool, Professional/Soft, etc.
    description = Column(Text, nullable=True)
    taxonomy_source = Column(String(100), default="ESCO")  # ESCO, O*NET, Curated
    source_uri = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    aliases = relationship("SkillAlias", back_populates="skill", cascade="all, delete-orphan")
    resume_skills = relationship("ResumeSkill", back_populates="skill")
    job_skills = relationship("JobSkill", back_populates="skill")

class SkillAlias(Base):
    __tablename__ = "skill_aliases"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    alias = Column(String(255), unique=True, index=True, nullable=False)

    skill = relationship("Skill", back_populates="aliases")

class ResumeSkill(Base):
    __tablename__ = "resume_skills"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    extraction_method = Column(String(100), default="phrase_match")  # phrase_match, dictionary, fuzzy, semantic
    confidence = Column(Float, default=1.0)
    has_experience_evidence = Column(Boolean, default=False)
    source_sentence = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="resume_skills")
    skill = relationship("Skill", back_populates="resume_skills")

class JobRole(Base):
    __tablename__ = "job_roles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), unique=True, index=True, nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)
    avg_salary_range = Column(String(100), nullable=True)
    market_demand = Column(String(50), default="High")
    esco_code = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    jobs = relationship("Job", back_populates="role")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("job_roles.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    company = Column(String(255), nullable=False)
    location = Column(String(255), default="Remote / Hybrid")
    experience_level = Column(String(100), default="Fresher / Entry-Level")
    description = Column(Text, nullable=False)
    is_sample = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    role = relationship("JobRole", back_populates="jobs")
    job_skills = relationship("JobSkill", back_populates="job", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="job")

class JobSkill(Base):
    __tablename__ = "job_skills"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    importance = Column(SQLEnum(SkillImportance), default=SkillImportance.REQUIRED, nullable=False)
    weight = Column(Float, default=1.0)  # custom importance weight (e.g. 1.0 for core, 0.8 for secondary)

    job = relationship("Job", back_populates="job_skills")
    skill = relationship("Skill", back_populates="job_skills")

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=True, index=True)
    target_role_title = Column(String(255), nullable=True)
    custom_job_description = Column(Text, nullable=True)
    
    # Overall compatibility & explainable breakdowns
    overall_compatibility_score = Column(Float, nullable=False)  # 0 to 100
    required_skill_score = Column(Float, nullable=False)
    preferred_skill_score = Column(Float, nullable=False)
    project_experience_score = Column(Float, nullable=False)
    role_relevance_score = Column(Float, nullable=False)
    semantic_similarity_score = Column(Float, nullable=False)
    tfidf_similarity_score = Column(Float, nullable=False)
    
    # Configuration weights used for transparency
    scoring_weights = Column(JSON, default=dict)
    scoring_explanation = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="analyses")
    resume = relationship("Resume", back_populates="analyses")
    job = relationship("Job", back_populates="analyses")
    skill_gaps = relationship("SkillGap", back_populates="analysis", cascade="all, delete-orphan")

class SkillGap(Base):
    __tablename__ = "skill_gaps"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    importance = Column(SQLEnum(SkillImportance), default=SkillImportance.REQUIRED)
    match_status = Column(SQLEnum(MatchStatus), default=MatchStatus.MISSING)
    match_score = Column(Float, default=0.0)  # 1.0 = strong, 0.5 = partial, 0.0 = missing
    gap_priority_score = Column(Float, default=0.0)  # High to Low based on formula
    resume_evidence = Column(Text, nullable=True)
    classification_reason = Column(Text, nullable=True)
    suggested_improvement = Column(Text, nullable=True)

    analysis = relationship("Analysis", back_populates="skill_gaps")

class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_role = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    total_tasks = Column(Integer, default=0)
    completed_tasks = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="roadmaps")
    tasks = relationship("LearningTask", back_populates="roadmap", cascade="all, delete-orphan", order_by="LearningTask.sequence_order")

class LearningTask(Base):
    __tablename__ = "learning_tasks"

    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("learning_roadmaps.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_name = Column(String(255), nullable=False)
    learning_priority = Column(String(50), default="High")  # Critical, High, Medium
    level = Column(SQLEnum(SkillLevel), default=SkillLevel.BEGINNER)
    sequence_order = Column(Integer, default=1)
    learning_objective = Column(Text, nullable=False)
    practice_activity = Column(Text, nullable=False)
    mini_project_idea = Column(Text, nullable=False)
    estimated_hours = Column(Integer, default=8)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)

    roadmap = relationship("LearningRoadmap", back_populates="tasks")

class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(100), nullable=False)  # task_completed, resume_updated, analysis_run, skill_acquired
    title = Column(String(255), nullable=False)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="progress_records")

