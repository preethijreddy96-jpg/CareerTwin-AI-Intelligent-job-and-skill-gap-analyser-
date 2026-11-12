from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Skill, SkillGap, Analysis, User
from app.schemas.schemas import SkillOut, SkillGapOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/skills", tags=["Skills & Taxonomy"])

@router.get("", response_model=List[SkillOut])
def list_taxonomy_skills(
    query: Optional[str] = Query(None, description="Search term for skill name"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    q = db.query(Skill)
    if query:
        q = q.filter(Skill.name.ilike(f"%{query}%"))
    if category:
        q = q.filter(Skill.category == category)
    return q.limit(limit).all()

@router.get("/gaps/{analysis_id}", response_model=List[SkillGapOut])
def get_analysis_skill_gaps(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis report not found or access denied.")

    gaps = db.query(SkillGap).filter(SkillGap.analysis_id == analysis_id).order_by(SkillGap.gap_priority_score.desc()).all()
    return [
        {
            "id": g.id,
            "skill_name": g.skill_name,
            "category": g.category,
            "importance": g.importance.value,
            "match_status": g.match_status.value,
            "match_score": g.match_score,
            "gap_priority_score": g.gap_priority_score,
            "resume_evidence": g.resume_evidence,
            "classification_reason": g.classification_reason,
            "suggested_improvement": g.suggested_improvement
        }
        for g in gaps
    ]

