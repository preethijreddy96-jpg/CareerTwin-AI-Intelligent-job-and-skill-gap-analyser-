from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, LearningRoadmap, LearningTask, Analysis
from app.schemas.schemas import (
    RoadmapOut, RoadmapGenerateRequest, LearningTaskOut, LearningTaskUpdate
)
from app.api.deps import get_current_user
from app.services.roadmap_service import RoadmapService

router = APIRouter(prefix="/roadmaps", tags=["Learning Roadmaps"])

@router.post("/generate", response_model=RoadmapOut, status_code=status.HTTP_201_CREATED)
def generate_roadmap(
    req: RoadmapGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    analysis = db.query(Analysis).filter(Analysis.id == req.analysis_id, Analysis.user_id == current_user.id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis report not found or access denied.")

    roadmap = RoadmapService.generate_roadmap_from_analysis(
        db=db,
        analysis=analysis,
        user_id=current_user.id,
        target_role=req.target_role
    )
    return roadmap

@router.get("", response_model=List[RoadmapOut])
def get_user_roadmaps(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    roadmaps = db.query(LearningRoadmap).filter(
        LearningRoadmap.user_id == current_user.id
    ).order_by(LearningRoadmap.created_at.desc()).all()
    return roadmaps

@router.get("/{id}", response_model=RoadmapOut)
def get_roadmap_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    roadmap = db.query(LearningRoadmap).filter(
        LearningRoadmap.id == id,
        LearningRoadmap.user_id == current_user.id
    ).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found or access denied.")
    return roadmap

@router.patch("/tasks/{id}", response_model=LearningTaskOut)
def update_task_status(
    id: int,
    task_in: LearningTaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(LearningTask).join(LearningRoadmap).filter(
        LearningTask.id == id,
        LearningRoadmap.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Learning task not found or access denied.")

    updated_task = RoadmapService.toggle_task_completion(
        db=db,
        task=task,
        is_completed=task_in.is_completed,
        user_id=current_user.id
    )
    return updated_task

