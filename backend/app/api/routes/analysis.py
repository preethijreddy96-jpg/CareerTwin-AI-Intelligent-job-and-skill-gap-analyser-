from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import (
    User, Resume, Job, Analysis, SkillGap, UserProgress,
    SkillImportance, MatchStatus
)
from app.schemas.schemas import AnalysisRequest, AnalysisOut, SkillGapOut
from app.api.deps import get_current_user
from app.services.matcher import JobMatchingService

router = APIRouter(prefix="/analysis", tags=["Career Analysis"])

@router.post("/analyze", response_model=AnalysisOut, status_code=status.HTTP_201_CREATED)
def run_career_analysis(
    req: AnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify resume ownership
    resume = db.query(Resume).filter(Resume.id == req.resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or access denied.")

    job = None
    if req.job_id:
        job = db.query(Job).filter(Job.id == req.job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Target job not found.")

    if not job and not req.custom_job_description:
        raise HTTPException(
            status_code=400,
            detail="Either a valid job_id or custom_job_description must be provided."
        )

    # Perform matching
    match_result = JobMatchingService.match_resume_to_job(
        db=db,
        resume=resume,
        job=job,
        custom_jd_text=req.custom_job_description,
        target_role_title=req.target_role_title,
        custom_weights=req.custom_weights
    )

    score_details = match_result["score_details"]
    gaps_data = match_result["skill_gaps"]

    # Save Analysis record
    analysis = Analysis(
        user_id=current_user.id,
        resume_id=resume.id,
        job_id=job.id if job else None,
        target_role_title=match_result["target_role_title"],
        custom_job_description=req.custom_job_description,
        overall_compatibility_score=score_details["overall_compatibility_score"],
        required_skill_score=score_details["required_skill_score"],
        preferred_skill_score=score_details["preferred_skill_score"],
        project_experience_score=score_details["project_experience_score"],
        role_relevance_score=score_details["role_relevance_score"],
        semantic_similarity_score=score_details["semantic_similarity_score"],
        tfidf_similarity_score=score_details["tfidf_similarity_score"],
        scoring_weights=score_details["scoring_weights"],
        scoring_explanation=score_details["scoring_explanation"]
    )
    db.add(analysis)
    db.flush()

    # Save SkillGaps
    gap_records = []
    for g in gaps_data:
        gap_obj = SkillGap(
            analysis_id=analysis.id,
            skill_name=g["skill_name"],
            category=g.get("category"),
            importance=SkillImportance(g["importance"]),
            match_status=MatchStatus(g["match_status"]),
            match_score=g["match_score"],
            gap_priority_score=g["gap_priority_score"],
            resume_evidence=g.get("resume_evidence"),
            classification_reason=g.get("classification_reason"),
            suggested_improvement=g.get("suggested_improvement")
        )
        db.add(gap_obj)
        gap_records.append(gap_obj)

    db.add(UserProgress(
        user_id=current_user.id,
        event_type="analysis_completed",
        title=f"Analyzed match for {match_result['target_role_title']}",
        details={
            "analysis_id": analysis.id,
            "score": score_details["overall_compatibility_score"],
            "role": match_result["target_role_title"]
        }
    ))

    db.commit()
    db.refresh(analysis)

    return {
        "id": analysis.id,
        "resume_id": analysis.resume_id,
        "job_id": analysis.job_id,
        "target_role_title": analysis.target_role_title,
        "overall_compatibility_score": analysis.overall_compatibility_score,
        "required_skill_score": analysis.required_skill_score,
        "preferred_skill_score": analysis.preferred_skill_score,
        "project_experience_score": analysis.project_experience_score,
        "role_relevance_score": analysis.role_relevance_score,
        "semantic_similarity_score": analysis.semantic_similarity_score,
        "tfidf_similarity_score": analysis.tfidf_similarity_score,
        "scoring_weights": analysis.scoring_weights,
        "scoring_explanation": analysis.scoring_explanation,
        "created_at": analysis.created_at,
        "skill_gaps": [
            {
                "id": gap.id,
                "skill_name": gap.skill_name,
                "category": gap.category,
                "importance": gap.importance.value,
                "match_status": gap.match_status.value,
                "match_score": gap.match_score,
                "gap_priority_score": gap.gap_priority_score,
                "resume_evidence": gap.resume_evidence,
                "classification_reason": gap.classification_reason,
                "suggested_improvement": gap.suggested_improvement
            }
            for gap in analysis.skill_gaps
        ]
    }

@router.get("/{id}", response_model=AnalysisOut)
def get_analysis_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    analysis = db.query(Analysis).filter(Analysis.id == id, Analysis.user_id == current_user.id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis report not found or access denied.")

    return {
        "id": analysis.id,
        "resume_id": analysis.resume_id,
        "job_id": analysis.job_id,
        "target_role_title": analysis.target_role_title,
        "overall_compatibility_score": analysis.overall_compatibility_score,
        "required_skill_score": analysis.required_skill_score,
        "preferred_skill_score": analysis.preferred_skill_score,
        "project_experience_score": analysis.project_experience_score,
        "role_relevance_score": analysis.role_relevance_score,
        "semantic_similarity_score": analysis.semantic_similarity_score,
        "tfidf_similarity_score": analysis.tfidf_similarity_score,
        "scoring_weights": analysis.scoring_weights,
        "scoring_explanation": analysis.scoring_explanation,
        "created_at": analysis.created_at,
        "skill_gaps": [
            {
                "id": gap.id,
                "skill_name": gap.skill_name,
                "category": gap.category,
                "importance": gap.importance.value,
                "match_status": gap.match_status.value,
                "match_score": gap.match_score,
                "gap_priority_score": gap.gap_priority_score,
                "resume_evidence": gap.resume_evidence,
                "classification_reason": gap.classification_reason,
                "suggested_improvement": gap.suggested_improvement
            }
            for gap in analysis.skill_gaps
        ]
    }

