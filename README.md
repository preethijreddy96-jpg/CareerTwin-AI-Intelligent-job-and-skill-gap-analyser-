# CareerTwin AI

> **Tagline:** Understand Your Skills. Discover Your Career Fit. Become Job-Ready.

CareerTwin AI is a full-stack, AI-powered career guidance and job-matching web application. It analyses a candidate's resume, identifies technical and professional skills using spaCy and ESCO/O*NET taxonomies, compares them with job descriptions using Sentence Transformers (`all-MiniLM-L6-v2`), calculates explainable job compatibility scores, identifies skill gaps, recommends suitable career opportunities, and creates personalized learning roadmaps.

---

## 1. Key Features

- **Authentication & User Profile**: JWT authentication, bcrypt salted password hashing, candidate education & career baseline management, and strict multi-tenant isolation.
- **Resume Intelligence Pipeline**: Support for PDF and DOCX uploads using PyMuPDF and python-docx, unreadable scan detection, section segmentation (Education, Experience, Projects), and contact info extraction.
- **AI Skill Extraction Engine**: spaCy phrase matching, regex word-boundary lookup, RapidFuzz conservative matching, alias normalization (`JS -> JavaScript`, `Postgres -> PostgreSQL`, `ML -> Machine Learning`), and demonstrated experience evidence detection.
- **Intelligent Job Matching**: Hybrid matching engine combining TF-IDF vectorization, Cosine similarity, Sentence Transformer embeddings, and skill overlap.
- **Explainable Compatibility Scoring**: Weighted multi-factor formula (65% required, 15% preferred, 15% experience, 5% role) with dynamic renormalization and plain-English reasoning breakdown.
- **Skill Gap Analyser**: Classifies skills into Matched (1.0), Partial (0.5), or Missing (0.0) with evidence, reasoning, and prioritized gap scores.
- **Career Recommendation Engine**: Recommends top matching career opportunities ranked by semantic and taxonomy overlap.
- **Personalized Learning Roadmaps**: Generates ordered curricula with learning objectives, practice activities, and portfolio mini-project ideas. Interactive checkboxes update real-time progress.
- **AI Resume Improvement Assistant**: Weak bullet-point detection, active action-verb guidance, quantifiable metric suggestions, and keyword gap analysis under a strict truthfulness policy.
- **Career Analytics Dashboard**: Real-time stats, Recharts visualizations (Bar and Gauge), and full audit activity trails.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS
- **Visualization**: Recharts & Custom Radial SVG Gauge
- **Icons**: Lucide React
- **Routing & HTTP**: React Router v6 & Axios

### Backend
- **Framework**: Python 3.11+ / FastAPI
- **Data Validation**: Pydantic v2 & Pydantic Settings
- **ORM & Migrations**: SQLAlchemy 2.0 & Alembic
- **Database**: PostgreSQL (with SQLite development fallback)

### AI / NLP / ML
- **Embeddings**: `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional dense vectors)
- **NLP**: spaCy (`en_core_web_sm`)
- **Document Parsers**: PyMuPDF (`pymupdf`) & `python-docx`
- **Matching & Similarity**: Scikit-Learn TF-IDF Cosine Similarity & RapidFuzz

---

## 3. Directory Structure

```
careertwin-ai/
├── backend/
│   ├── alembic/              # Database migration versions
│   ├── app/
│   │   ├── api/routes/       # FastAPI route controllers
│   │   ├── core/             # Config, security, database engine
│   │   ├── data/             # Seed data & ESCO/O*NET taxonomy
│   │   ├── ml/               # Embeddings, taxonomy, benchmark
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic v2 validation schemas
│   │   ├── services/         # Resume parser, extractor, matcher, scorer, roadmap
│   │   └── main.py           # FastAPI entrypoint
│   ├── scripts/              # Sample resume generator
│   ├── tests/                # Pytest unit & integration test suite
│   ├── Dockerfile            # Backend Docker container definition
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/       # Sidebar, Navbar, ScoreGauge, Modal
│   │   ├── context/          # AuthContext, ToastContext
│   │   ├── layouts/          # AppLayout, AuthLayout
│   │   ├── pages/            # 13 dedicated responsive pages
│   │   ├── services/         # Axios API clients
│   │   ├── types/            # TypeScript schema types
│   │   └── App.tsx           # Route definitions & guards
│   ├── Dockerfile            # Frontend multi-stage Nginx container
│   ├── package.json
│   └── tailwind.config.js
├── sample_resumes/           # Ready-to-use sample PDF & DOCX resumes
├── docs/                     # Architecture & ML methodology documentation
└── docker-compose.yml        # Full-stack Docker deployment
```

---

## 4. Setup & Execution Instructions

### Prerequisites
- Python 3.11+ (or 3.12 / 3.13 / 3.14)
- Node.js 18+ and npm
- (Optional) Docker and Docker Compose

### Step 1: Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Start FastAPI server (SQLite database and seeds initialize automatically)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API is now live at `http://localhost:8000`.
- Swagger Interactive Docs: `http://localhost:8000/docs`
- ReDoc Documentation: `http://localhost:8000/redoc`

### Step 2: Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 5. Running Tests & Evaluation Benchmark

To run all 13 backend unit tests, integration tests, and the human-labelled benchmark:
```bash
cd backend
source venv/bin/activate
pytest -v -s
```

### Benchmark Results
The ground-truth evaluation benchmark (`app/ml/benchmark.py`) validates skill extraction accuracy:
- **Total Ground Truth Skills**: 33
- **Total Extracted Skills**: 33
- **Precision**: 97.0%
- **Recall**: 97.0%
- **F1-Score**: 97.0%

---

## 6. Sample Resumes for Testing

Ready-made sample resumes are generated in the `sample_resumes/` folder:
1. `sample_resumes/sample_alex_morgan_python_developer.pdf` - Python backend profile (FastAPI, PostgreSQL, Docker, Pytest).
2. `sample_resumes/sample_priya_sharma_fullstack.docx` - Full-stack profile (React, TypeScript, Node.js, SQL).

To regenerate sample resumes:
```bash
python backend/scripts/generate_sample_resumes.py
```

---

## 7. Docker Deployment

To launch the complete application stack (PostgreSQL + FastAPI + React Nginx) with Docker Compose:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

