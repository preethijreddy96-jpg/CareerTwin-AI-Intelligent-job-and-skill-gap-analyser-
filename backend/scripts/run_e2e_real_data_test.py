import os
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = str(Path(__file__).resolve().parent.parent)
sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.models import User, Resume

def run_comprehensive_e2e_test():
    print("=" * 70)
    print("  CAREERTWIN AI - REAL DATA END-TO-END QA & VERIFICATION TEST")
    print("=" * 70)

    client = TestClient(app)
    results = []

    def record(step_name: str, passed: bool, details: str = ""):
        status_text = "PASS [100%]" if passed else "FAIL"
        results.append({"step": step_name, "passed": passed, "details": details})
        print(f"[{status_text}] {step_name}: {details}")

    # Step 1: Weak Password Rejections
    res_weak = client.post("/api/auth/register", json={
        "email": "candidate.qa@careertwin.ai",
        "password": "simplepassword",
        "full_name": "QA Tester"
    })
    record("1. Weak Password Rejection (No numbers/special chars)", res_weak.status_code == 422, f"Status: {res_weak.status_code}")

    res_no_special = client.post("/api/auth/register", json={
        "email": "candidate.qa@careertwin.ai",
        "password": "Password123",
        "full_name": "QA Tester"
    })
    record("2. Weak Password Rejection (No special character)", res_no_special.status_code == 422, f"Status: {res_no_special.status_code}")

    # Clean existing QA user if any
    db = SessionLocal()
    existing_u = db.query(User).filter(User.email == "candidate.qa@careertwin.ai").first()
    if existing_u:
        db.delete(existing_u)
        db.commit()
    db.close()

    # Step 2: Strong Password Registration
    strong_pwd = "SuperSecure#2026!"
    res_reg = client.post("/api/auth/register", json={
        "email": "candidate.qa@careertwin.ai",
        "password": strong_pwd,
        "full_name": "QA Test Candidate"
    })
    reg_data = res_reg.json()
    code = reg_data.get("dev_verification_code")
    record("3. Strong Password Registration (Letters+Numbers+Special)", res_reg.status_code == 201 and reg_data.get("requires_verification") is True, f"Code generated: {code}")

    # Step 3: Login Prior to Email Verification
    res_unverified_login = client.post("/api/auth/login", json={
        "email": "candidate.qa@careertwin.ai",
        "password": strong_pwd
    })
    record("4. Unverified Email Login Block (403 Forbidden)", res_unverified_login.status_code == 403, f"Detail: {res_unverified_login.json().get('detail')}")

    # Step 4: Email Verification
    res_verify = client.post("/api/auth/verify-email", json={
        "email": "candidate.qa@careertwin.ai",
        "code": code
    })
    record("5. 6-Digit Email Verification", res_verify.status_code == 200 and "access_token" in res_verify.json(), "Email verified successfully")

    # Step 5: Verified Login
    res_login = client.post("/api/auth/login", json={
        "email": "candidate.qa@careertwin.ai",
        "password": strong_pwd
    })
    auth_token = res_login.json().get("access_token")
    headers = {"Authorization": f"Bearer {auth_token}"}
    record("6. Verified Candidate Login & JWT Generation", res_login.status_code == 200 and auth_token is not None, "JWT Bearer active")

    # Step 6: Onboarding Profile Update
    res_prof = client.put("/api/profile", json={
        "current_title": "Software Engineering Graduate",
        "target_role": "Python Developer",
        "years_experience": 1.5,
        "education_level": "Bachelor's Degree",
        "institution": "National Institute of Technology",
        "graduation_year": 2024,
        "career_interests": ["Backend Engineering", "Cloud Services", "AI/ML"]
    }, headers=headers)
    record("7. Career Profile Baseline Onboarding", res_prof.status_code == 200 and res_prof.json().get("target_role") == "Python Developer", "Profile calibrated")

    # Step 7: Upload Real Sample PDF Resume
    sample_pdf = Path(__file__).resolve().parent.parent.parent / "sample_resumes" / "sample_alex_morgan_python_developer.pdf"
    with open(sample_pdf, "rb") as f:
        res_upload_pdf = client.post(
            "/api/resumes/upload",
            files={"file": ("sample_alex_morgan_python_developer.pdf", f, "application/pdf")},
            headers=headers
        )
    pdf_resume_data = res_upload_pdf.json()
    pdf_resume_id = pdf_resume_data.get("id")
    skills_detected = len(pdf_resume_data.get("skills", []))
    record("8. Real PDF Resume Extraction (PyMuPDF + spaCy)", res_upload_pdf.status_code == 201 and skills_detected >= 5, f"Resume ID #{pdf_resume_id}, Detected {skills_detected} skills")

    # Step 8: Upload Real Sample DOCX Resume
    sample_docx = Path(__file__).resolve().parent.parent.parent / "sample_resumes" / "sample_priya_sharma_fullstack.docx"
    with open(sample_docx, "rb") as f:
        res_upload_docx = client.post(
            "/api/resumes/upload",
            files={"file": ("sample_priya_sharma_fullstack.docx", f, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
            headers=headers
        )
    docx_resume_data = res_upload_docx.json()
    docx_resume_id = docx_resume_data.get("id")
    record("9. Real DOCX Resume Extraction (python-docx)", res_upload_docx.status_code == 201, f"Resume ID #{docx_resume_id}")

    # Step 9: Manual Skill Verification & Correction
    res_correct = client.put(f"/api/resumes/{pdf_resume_id}", json={
        "skills_to_add": ["FastAPI", "Kubernetes"],
        "candidate_name": "Alex Morgan (Verified)"
    }, headers=headers)
    record("10. Manual Skill Verification & Metadata Correction", res_correct.status_code == 200 and res_correct.json().get("candidate_name") == "Alex Morgan (Verified)", "Manual edits committed")

    # Step 10: Run Intelligent Job Compatibility Analysis
    res_jobs = client.get("/api/jobs")
    sample_job_id = res_jobs.json()[0]["id"]
    res_analysis = client.post("/api/analysis/analyze", json={
        "resume_id": pdf_resume_id,
        "job_id": sample_job_id,
        "custom_weights": {"required": 0.65, "preferred": 0.15, "experience": 0.15, "role": 0.05}
    }, headers=headers)
    analysis_data = res_analysis.json()
    analysis_id = analysis_data.get("id")
    compat_score = analysis_data.get("overall_compatibility_score")
    record("11. Intelligent Job Matching & Compatibility Scoring", res_analysis.status_code == 201 and compat_score > 0, f"Score: {compat_score}%, Analysis ID #{analysis_id}")

    # Step 11: Skill Gap Extraction & Verification
    res_gaps = client.get(f"/api/skills/gaps/{analysis_id}", headers=headers)
    gap_count = len(res_gaps.json())
    record("12. Skill Gap Analyser & Priority Matrix", res_gaps.status_code == 200 and gap_count > 0, f"{gap_count} skills classified into Matched/Partial/Missing")

    # Step 12: Personalized Learning Roadmap Generation
    res_roadmap = client.post("/api/roadmaps/generate", json={
        "analysis_id": analysis_id,
        "target_role": "Python Developer"
    }, headers=headers)
    roadmap_data = res_roadmap.json()
    roadmap_id = roadmap_data.get("id")
    task_count = len(roadmap_data.get("tasks", []))
    record("13. Personalized Learning Roadmap Synthesis", res_roadmap.status_code == 201 and task_count > 0, f"Roadmap #{roadmap_id} with {task_count} curriculum milestones")

    # Step 13: Interactive Roadmap Task Completion Toggle
    if task_count > 0:
        first_task_id = roadmap_data["tasks"][0]["id"]
        res_task_toggle = client.patch(f"/api/roadmaps/tasks/{first_task_id}", json={
            "is_completed": True
        }, headers=headers)
        record("14. Interactive Milestone Completion Toggle", res_task_toggle.status_code == 200 and res_task_toggle.json().get("is_completed") is True, f"Milestone #{first_task_id} marked as achieved")

    # Step 14: AI Resume Improvement Assistant
    res_improve = client.post("/api/resumes/improve", json={
        "resume_id": pdf_resume_id,
        "target_role": "Python Developer"
    }, headers=headers)
    improve_data = res_improve.json()
    ats_score = improve_data.get("ats_formatting_score")
    bullet_critiques = len(improve_data.get("weak_bullet_points", []))
    record("15. AI Resume Enhancer & Truthful Rewrites", res_improve.status_code == 200 and ats_score > 0, f"ATS Score: {ats_score}%, {bullet_critiques} bullet critiques generated")

    # Step 15: Career Pathway Recommendations
    res_recs = client.get(f"/api/jobs/recommendations?resume_id={pdf_resume_id}&limit=5", headers=headers)
    rec_count = len(res_recs.json())
    record("16. Career Pathway Recommendations Engine", res_recs.status_code == 200 and rec_count > 0, f"{rec_count} occupational roles ranked with compatibility")

    # Step 16: Career Analytics Dashboard Overview
    res_dash = client.get("/api/dashboard/overview", headers=headers)
    dash_data = res_dash.json()
    total_skills = dash_data.get("total_skills_count")
    record("17. Career Intelligence Dashboard Aggregator", res_dash.status_code == 200 and total_skills > 0, f"{total_skills} skills tracked across candidate baseline")

    print("=" * 70)
    passed_count = sum(1 for r in results if r["passed"])
    total_count = len(results)
    percentage = (passed_count / total_count) * 100
    print(f"  TOTAL TESTS: {total_count} | PASSED: {passed_count} | SCORE: {percentage:.1f}%")
    print("=" * 70)

    return percentage == 100.0

if __name__ == "__main__":
    success = run_comprehensive_e2e_test()
    sys.exit(0 if success else 1)

