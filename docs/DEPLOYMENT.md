# 🚀 CareerTwin AI – Deployment Guide (Vercel & Cloud Backend)

This guide provides step-by-step instructions for deploying CareerTwin AI to production:
1. **Frontend (React 19 + Vite + Tailwind CSS)**: Hosted on **Vercel** with worldwide Edge CDN.
2. **Backend (FastAPI + Sentence Transformers + PyMuPDF)**: Hosted on **Render.com**, **Railway**, or **Koyeb** (handles Python ML dependencies like PyTorch and spaCy).

---

## Part 1: Deploy Frontend on Vercel

### Step 1: Open Vercel
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account (`preethijreddy96-jpg`).
2. Click **"Add New..."** → **"Project"**.

### Step 2: Import GitHub Repository
1. Select the repository: `preethijreddy96-jpg/CareerTwin-AI-Intelligent-job-and-skill-gap-analyser-`.
2. Click **"Import"**.

### Step 3: Configure Project Settings
- **Framework Preset:** `Vite`
- **Root Directory:** Click "Edit" and set to `frontend` *(or leave as root since `vercel.json` is configured)*.
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Step 4: Set Environment Variables
Under the **Environment Variables** section, add:
- **Key:** `VITE_API_BASE_URL`
- **Value:** `https://your-backend-url.onrender.com/api` *(or your deployed backend API URL)*

### Step 5: Click "Deploy"
Vercel will build and deploy your frontend in ~45 seconds. It will give you a live production URL (e.g., `https://careertwin-ai.vercel.app`).

---

## Part 2: Deploy Backend (Render.com - Free Tier)

Because the backend utilizes Sentence Transformers (`all-MiniLM-L6-v2`) and PyMuPDF, it runs natively on container/Linux cloud hosts. Render is free and connects directly to GitHub.

### Step 1: Create a Render Account
1. Go to [render.com](https://render.com) and sign in with GitHub.
2. Click **"New +"** → **"Web Service"**.

### Step 2: Connect Repository
1. Choose `preethijreddy96-jpg/CareerTwin-AI-Intelligent-job-and-skill-gap-analyser-`.
2. Configure settings:
   - **Name:** `careertwin-api`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install --upgrade pip && pip install -r requirements.txt && python -m spacy download en_core_web_sm`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port 10000`

### Step 3: Add Environment Variables on Render
- `PYTHON_VERSION`: `3.11.9`
- `SECRET_KEY`: *(Generate a secure random string)*
- `DATABASE_URL`: `sqlite:///./careertwin.db` *(or connect a free Render PostgreSQL database)*

### Step 4: Deploy Web Service
Click **"Create Web Service"**. Once deployment is live, copy your backend URL (e.g., `https://careertwin-api.onrender.com`).

---

## Part 3: Connect Frontend to Backend

1. In your Vercel Dashboard, go to your project → **Settings** → **Environment Variables**.
2. Update `VITE_API_BASE_URL` with your Render backend URL:
   ```env
   VITE_API_BASE_URL=https://careertwin-api.onrender.com/api
   ```
3. Go to the **Deployments** tab and click **Redeploy**.
4. Your application is now 100% live on production!
