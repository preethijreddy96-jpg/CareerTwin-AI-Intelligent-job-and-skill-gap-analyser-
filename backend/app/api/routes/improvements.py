from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Resume, User
from app.schemas.schemas import ResumeImprovementRequest, ResumeImprovementOut
from app.api.deps import get_current_user
from app.services.improvement_service import ResumeImprovementService

router = APIRouter(prefix="/resumes", tags=["Resume Improvement"])

@router.post("/improve", response_model=ResumeImprovementOut)
def get_resume_improvements(
    req: ResumeImprovementRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == req.resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or access denied.")

    result = ResumeImprovementService.analyze_and_improve(
        resume=resume,
        job_description=req.job_description,
        target_role=req.target_role
    )
    return result

