# CareerTwin AI - System Architecture

CareerTwin AI is an end-to-end AI/ML-powered career guidance and job-matching platform built with Python FastAPI, PostgreSQL (with SQLite fallback), and React (TypeScript + Tailwind CSS).

## 1. High-Level Architecture

```
[ Client Browser (React + TypeScript + Vite) ]
                |  Axios (Bearer JWT Auth)
                v
       [ FastAPI REST Gateway ]
        |       |        |
        |       |        +--> [ PyMuPDF / python-docx Pipeline ]
        |       |
        |       +--> [ AI / ML Engine ]
        |             • spaCy Phrase & Regex Matcher
        |             • RapidFuzz Semantic Normalization
        |             • sentence-transformers (all-MiniLM-L6-v2)
        |             • Scikit-Learn TF-IDF Cosine Fallback
        |             • Explainable Multi-Factor Scorer
        |
        v
[ Relational Persistence Layer (SQLAlchemy ORM + Alembic) ]
   • PostgreSQL / SQLite
   • Tables: users, user_profiles, resumes, resume_skills,
     skills, skill_aliases, job_roles, jobs, job_skills,
     analyses, skill_gaps, learning_roadmaps, learning_tasks, user_progress
```

## 2. Key Modules & Data Flow

1. **Authentication & User Profile**:
   - Secure bcrypt salted password hashing.
   - JWT tokens with 7-day expiration.
   - Strict multi-tenant isolation ensuring users only access their own resumes and analyses.

2. **Resume Intelligence**:
   - File format validation (PDF, DOCX) and size limits (< 10MB).
   - PyMuPDF and python-docx text extraction with unreadable scan detection.
   - Text segmentation into Education, Experience, Projects, and Skills.
   - Contact info extraction (Name, Email, Phone).

3. **AI Skill Extraction Engine**:
   - Multi-tier extraction:
     - Exact alias mapping with regex word boundaries.
     - Conservative RapidFuzz matching (threshold >= 90) on multi-word skills.
     - Contextual evidence analysis: checks whether skills appear in experience/projects with action verbs.

4. **Job Matching & Compatibility Scoring**:
   - Compares candidate skills against job requirements.
   - Computes SentenceTransformer embeddings for resume and job description.
   - Calculates explainable weighted compatibility score:
     - Required Skill Coverage: 65%
     - Preferred Skill Coverage: 15%
     - Project & Experience Relevance: 15%
     - Role Relevance: 5%
   - Dynamic weight renormalization when categories are unavailable.

5. **Personalized Learning Roadmaps**:
   - Identifies missing and partial skill gaps.
   - Assigns priority scores: `(importance * 0.6 + missing * 0.4) * 10`.
   - Sequences learning tasks from foundational (Languages, DBs) to advanced (DevOps, QA).
   - Provides concrete practice tasks and portfolio mini-project ideas.

