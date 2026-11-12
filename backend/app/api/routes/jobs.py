from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Job, JobRole, Resume, User
from app.schemas.schemas import JobOut, JobRoleOut, CareerRecommendationOut
from app.api.deps import get_current_user
from app.services.recommender import CareerRecommenderService

router = APIRouter(prefix="/jobs", tags=["Jobs & Roles"])

@router.get("/roles", response_model=List[JobRoleOut])
def get_career_roles(db: Session = Depends(get_db)):
    roles = db.query(JobRole).order_by(JobRole.title.asc()).all()
    return roles

@router.get("/recommendations", response_model=List[CareerRecommendationOut])
def get_career_recommendations(
    resume_id: int = Query(..., description="ID of the resume to evaluate"),
    limit: int = Query(5, ge=1, le=10),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or access denied.")

    recommendations = CareerRecommenderService.recommend_careers(
        db=db,
        resume=resume,
        top_k=limit
    )
    return recommendations

@router.get("", response_model=List[JobOut])
def list_jobs(db: Session = Depends(get_db)):
    jobs = db.query(Job).order_by(Job.title.asc()).all()
    results = []
    for j in jobs:
        results.append({
            "id": j.id,
            "role_id": j.role_id,
            "title": j.title,
            "company": j.company,
            "location": j.location,
            "experience_level": j.experience_level,
            "description": j.description,
            "is_sample": j.is_sample,
            "skills": [
                {
                    "skill_id": js.skill.id,
                    "skill_name": js.skill.name,
                    "category": js.skill.category,
                    "importance": js.importance.value,
                    "weight": js.weight
                }
                for js in j.job_skills
            ]
        })
    return results

@router.get("/{id}", response_model=JobOut)
def get_job(id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found.")

    return {
        "id": job.id,
        "role_id": job.role_id,
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "experience_level": job.experience_level,
        "description": job.description,
        "is_sample": job.is_sample,
        "skills": [
            {
                "skill_id": js.skill.id,
                "skill_name": js.skill.name,
                "category": js.skill.category,
                "importance": js.importance.value,
                "weight": js.weight
            }
            for js in job.job_skills
        ]
    }

