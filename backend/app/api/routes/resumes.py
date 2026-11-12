import os
import shutil
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.models import User, Resume, ResumeSkill, Skill, UserProgress
from app.schemas.schemas import ResumeOut, ResumeDetailOut, ResumeUpdate
from app.api.deps import get_current_user
from app.services.resume_parser import ResumeParserService
from app.services.skill_extractor import SkillExtractorService

router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.post("/upload", response_model=ResumeDetailOut, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ResumeParserService.validate_file(file)

    # Validate file size
    contents = await file.read()
    file_size = len(contents)
    if file_size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    # Save to disk
    file_ext = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    with open(file_path, "wb") as f:
        f.write(contents)

    # Extract text
    if file_ext == ".pdf":
        raw_text = ResumeParserService.extract_text_from_pdf(file_path)
    else:
        raw_text = ResumeParserService.extract_text_from_docx(file_path)

    cleaned_text = ResumeParserService.clean_text(raw_text)
    contact_info = ResumeParserService.extract_contact_info(cleaned_text)
    segmented = ResumeParserService.segment_resume(cleaned_text)

    # Save Resume object
    resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        file_type=file_ext.replace(".", ""),
        file_size_bytes=file_size,
        parsed_text=cleaned_text,
        candidate_name=contact_info.get("name"),
        candidate_email=contact_info.get("email"),
        candidate_phone=contact_info.get("phone"),
        education_summary=segmented.get("education", []),
        experience_summary=segmented.get("experience", []),
        projects_summary=segmented.get("projects", [])
    )
    db.add(resume)
    db.flush()

    # Extract skills
    exp_text = segmented.get("raw_sections", {}).get("experience", "")
    proj_text = segmented.get("raw_sections", {}).get("projects", "")
    extracted_skills = SkillExtractorService.extract_skills_from_text(
        text=cleaned_text,
        db=db,
        experience_text=exp_text,
        projects_text=proj_text
    )

    for item in extracted_skills:
        rs = ResumeSkill(
            resume_id=resume.id,
            skill_id=item["skill_id"],
            skill_name=item["skill_name"],
            category=item["category"],
            extraction_method=item["extraction_method"],
            confidence=item["confidence"],
            has_experience_evidence=item["has_experience_evidence"],
            source_sentence=item["source_sentence"],
            is_verified=False
        )
        db.add(rs)

    db.add(UserProgress(
        user_id=current_user.id,
        event_type="resume_uploaded",
        title=f"Uploaded resume {file.filename}",
        details={"resume_id": resume.id, "skills_detected": len(extracted_skills)}
    ))

    db.commit()
    db.refresh(resume)

    # Format response
    skills_out = [
        {
            "id": rs.id,
            "skill_name": rs.skill_name,
            "category": rs.category,
            "extraction_method": rs.extraction_method,
            "confidence": rs.confidence,
            "has_experience_evidence": rs.has_experience_evidence,
            "source_sentence": rs.source_sentence,
            "is_verified": rs.is_verified
        }
        for rs in resume.resume_skills
    ]

    res_dict = {
        "id": resume.id,
        "filename": resume.filename,
        "file_type": resume.file_type,
        "file_size_bytes": resume.file_size_bytes,
        "candidate_name": resume.candidate_name,
        "candidate_email": resume.candidate_email,
        "candidate_phone": resume.candidate_phone,
        "education_summary": resume.education_summary or [],
        "experience_summary": resume.experience_summary or [],
        "projects_summary": resume.projects_summary or [],
        "parsed_text": resume.parsed_text,
        "created_at": resume.created_at,
        "skills": skills_out
    }
    return res_dict

@router.get("", response_model=List[ResumeOut])
def list_user_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).all()
    results = []
    for r in resumes:
        results.append({
            "id": r.id,
            "filename": r.filename,
            "file_type": r.file_type,
            "file_size_bytes": r.file_size_bytes,
            "candidate_name": r.candidate_name,
            "candidate_email": r.candidate_email,
            "candidate_phone": r.candidate_phone,
            "education_summary": r.education_summary or [],
            "experience_summary": r.experience_summary or [],
            "projects_summary": r.projects_summary or [],
            "created_at": r.created_at,
            "skills": [
                {
                    "id": rs.id,
                    "skill_name": rs.skill_name,
                    "category": rs.category,
                    "extraction_method": rs.extraction_method,
                    "confidence": rs.confidence,
                    "has_experience_evidence": rs.has_experience_evidence,
                    "source_sentence": rs.source_sentence,
                    "is_verified": rs.is_verified
                }
                for rs in r.resume_skills
            ]
        })
    return results

@router.get("/{id}", response_model=ResumeDetailOut)
def get_resume_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or access denied.")

    return {
        "id": resume.id,
        "filename": resume.filename,
        "file_type": resume.file_type,
        "file_size_bytes": resume.file_size_bytes,
        "candidate_name": resume.candidate_name,
        "candidate_email": resume.candidate_email,
        "candidate_phone": resume.candidate_phone,
        "education_summary": resume.education_summary or [],
        "experience_summary": resume.experience_summary or [],
        "projects_summary": resume.projects_summary or [],
        "parsed_text": resume.parsed_text,
        "created_at": resume.created_at,
        "skills": [
            {
                "id": rs.id,
                "skill_name": rs.skill_name,
                "category": rs.category,
                "extraction_method": rs.extraction_method,
                "confidence": rs.confidence,
                "has_experience_evidence": rs.has_experience_evidence,
                "source_sentence": rs.source_sentence,
                "is_verified": rs.is_verified
            }
            for rs in resume.resume_skills
        ]
    }

@router.put("/{id}", response_model=ResumeDetailOut)
def update_resume_metadata(
    id: int,
    update_in: ResumeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or access denied.")

    if update_in.candidate_name is not None:
        resume.candidate_name = update_in.candidate_name
    if update_in.candidate_email is not None:
        resume.candidate_email = update_in.candidate_email
    if update_in.candidate_phone is not None:
        resume.candidate_phone = update_in.candidate_phone
    if update_in.education_summary is not None:
        resume.education_summary = update_in.education_summary
    if update_in.experience_summary is not None:
        resume.experience_summary = update_in.experience_summary
    if update_in.projects_summary is not None:
        resume.projects_summary = update_in.projects_summary

    # Support adding manual skills
    if update_in.skills_to_add:
        existing_skills = {rs.skill_name.lower() for rs in resume.resume_skills}
        for s_name in update_in.skills_to_add:
            if s_name.lower() not in existing_skills:
                skill_obj = db.query(Skill).filter(Skill.name.ilike(s_name.strip())).first()
                if not skill_obj:
                    skill_obj = Skill(
                        name=s_name.strip(),
                        canonical_name=s_name.strip(),
                        category="User Added",
                        taxonomy_source="Manual"
                    )
                    db.add(skill_obj)
                    db.flush()

                db.add(ResumeSkill(
                    resume_id=resume.id,
                    skill_id=skill_obj.id,
                    skill_name=skill_obj.name,
                    category=skill_obj.category,
                    extraction_method="user_corrected",
                    confidence=1.0,
                    has_experience_evidence=True,
                    source_sentence="Manually validated by candidate",
                    is_verified=True
                ))

    # Support removing skills
    if update_in.skills_to_remove:
        remove_set = {s.lower() for s in update_in.skills_to_remove}
        for rs in resume.resume_skills:
            if rs.skill_name.lower() in remove_set:
                db.delete(rs)

    db.commit()
    db.refresh(resume)
    return get_resume_detail(id, db, current_user)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or access denied.")

    # Remove physical file safely if exists
    if os.path.exists(resume.file_path):
        try:
            os.remove(resume.file_path)
        except Exception:
            pass

    db.delete(resume)
    db.commit()
    return None

