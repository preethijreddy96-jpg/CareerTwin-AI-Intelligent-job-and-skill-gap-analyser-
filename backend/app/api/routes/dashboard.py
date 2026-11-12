from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.models import (
    User, Resume, Analysis, SkillGap, LearningRoadmap,
    LearningTask, UserProgress, ResumeSkill, JobRole
)
from app.schemas.schemas import DashboardOverviewOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/overview", response_model=DashboardOverviewOut)
def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Total extracted skills from candidate's resumes
    user_resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    user_resume_ids = [r.id for r in user_resumes]

    total_skills = 0
    if user_resume_ids:
        total_skills = db.query(ResumeSkill.skill_name).filter(
            ResumeSkill.resume_id.in_(user_resume_ids)
        ).distinct().count()

    # 2. Number of resumes analysed
    resumes_analyzed = len(user_resumes)

    # 3. Average compatibility score across all user analyses
    user_analyses = db.query(Analysis).filter(Analysis.user_id == current_user.id).all()
    analysis_ids = [a.id for a in user_analyses]
    
    if user_analyses:
        avg_score = sum(a.overall_compatibility_score for a in user_analyses) / len(user_analyses)
    else:
        avg_score = 0.0

    # 4. Skills matched and missing across recent analyses
    skills_matched = 0
    skills_missing = 0
    if analysis_ids:
        skills_matched = db.query(SkillGap).filter(
            SkillGap.analysis_id.in_(analysis_ids),
            SkillGap.match_status == "matched"
        ).count()
        skills_missing = db.query(SkillGap).filter(
            SkillGap.analysis_id.in_(analysis_ids),
            SkillGap.match_status.in_(["missing", "partial"])
        ).count()

    # 5. Learning progress from user's roadmaps
    roadmaps = db.query(LearningRoadmap).filter(LearningRoadmap.user_id == current_user.id).all()
    total_roadmap_tasks = sum(r.total_tasks for r in roadmaps)
    completed_roadmap_tasks = sum(r.completed_tasks for r in roadmaps)
    
    learning_progress_pct = (
        round((completed_roadmap_tasks / total_roadmap_tasks) * 100.0, 1)
        if total_roadmap_tasks > 0 else 0.0
    )

    # 6. Best matching roles based on analyses or top roles
    best_matching_roles = []
    if user_analyses:
        # Group highest score per role
        role_scores = {}
        for a in user_analyses:
            role = a.target_role_title or "Software Developer"
            if role not in role_scores or a.overall_compatibility_score > role_scores[role]:
                role_scores[role] = a.overall_compatibility_score

        for r_title, sc in sorted(role_scores.items(), key=lambda x: x[1], reverse=True)[:4]:
            best_matching_roles.append({
                "role_title": r_title,
                "compatibility_score": round(sc, 1),
                "is_demo_seed": False
            })
    else:
        # Inform user clearly about demonstration benchmark
        best_matching_roles = [
            {"role_title": "Python Developer", "compatibility_score": 0.0, "is_demo_seed": True},
            {"role_title": "Full-Stack Developer", "compatibility_score": 0.0, "is_demo_seed": True},
            {"role_title": "Data Analyst", "compatibility_score": 0.0, "is_demo_seed": True}
        ]

    # 7. Recent analyses list
    recent_analyses = []
    for a in sorted(user_analyses, key=lambda x: x.created_at, reverse=True)[:5]:
        recent_analyses.append({
            "id": a.id,
            "target_role": a.target_role_title,
            "score": round(a.overall_compatibility_score, 1),
            "date": a.created_at.strftime("%b %d, %Y"),
            "resume_id": a.resume_id
        })

    # 8. Active roadmap
    active_roadmap = None
    latest_roadmap = db.query(LearningRoadmap).filter(
        LearningRoadmap.user_id == current_user.id
    ).order_by(LearningRoadmap.created_at.desc()).first()
    if latest_roadmap:
        active_roadmap = latest_roadmap

    # 9. Recent user activity
    recent_progress = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id
    ).order_by(UserProgress.created_at.desc()).limit(6).all()

    recent_activity = [
        {
            "id": p.id,
            "title": p.title,
            "event_type": p.event_type,
            "timestamp": p.created_at.strftime("%b %d, %H:%M")
        }
        for p in recent_progress
    ]

    return {
        "total_skills_count": total_skills,
        "resumes_analyzed_count": resumes_analyzed,
        "avg_compatibility_score": round(avg_score, 1),
        "learning_progress_percentage": learning_progress_pct,
        "skills_matched_count": skills_matched,
        "skills_missing_count": skills_missing,
        "best_matching_roles": best_matching_roles,
        "recent_analyses": recent_analyses,
        "active_roadmap": active_roadmap,
        "recent_activity": recent_activity
    }

