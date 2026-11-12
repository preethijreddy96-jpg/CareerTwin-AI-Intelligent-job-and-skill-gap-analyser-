from app.services.scorer import CompatibilityScorer
from app.services.matcher import JobMatchingService
from app.models.models import Resume, ResumeSkill, Skill, Job

def test_explainable_scoring_calculation():
    required_matches = [
        {"skill_name": "Python", "match_status": "matched", "match_score": 1.0, "weight": 1.0},
        {"skill_name": "FastAPI", "match_status": "matched", "match_score": 1.0, "weight": 1.0},
        {"skill_name": "PostgreSQL", "match_status": "partial", "match_score": 0.5, "weight": 1.0},
        {"skill_name": "Docker", "match_status": "missing", "match_score": 0.0, "weight": 1.0}
    ]
    preferred_matches = [
        {"skill_name": "Redis", "match_status": "matched", "match_score": 1.0, "weight": 0.75}
    ]

    res = CompatibilityScorer.calculate_score(
        required_matches=required_matches,
        preferred_matches=preferred_matches,
        semantic_sim=0.75,
        tfidf_sim=0.68,
        role_sim=0.85,
        experience_evidence_ratio=0.8
    )

    score = res["overall_compatibility_score"]
    assert 0 <= score <= 100
    assert "scoring_explanation" in res
    assert "disclaimer" in res
    assert res["scoring_weights"]["required"] > 0.5

def test_job_matching_end_to_end(db_session):
    # Setup dummy resume in DB
    resume = Resume(
        user_id=1,
        filename="test.pdf",
        file_path="/tmp/test.pdf",
        file_type="pdf",
        file_size_bytes=1024,
        parsed_text="Experienced Python Developer skilled in Python, FastAPI, and Git. Built web APIs."
    )
    db_session.add(resume)
    db_session.flush()

    s_python = db_session.query(Skill).filter(Skill.name == "Python").first()
    s_fastapi = db_session.query(Skill).filter(Skill.name == "FastAPI").first()

    db_session.add(ResumeSkill(
        resume_id=resume.id,
        skill_id=s_python.id,
        skill_name="Python",
        category="Programming Language",
        extraction_method="exact_phrase",
        confidence=1.0,
        has_experience_evidence=True
    ))
    db_session.add(ResumeSkill(
        resume_id=resume.id,
        skill_id=s_fastapi.id,
        skill_name="FastAPI",
        category="Framework",
        extraction_method="exact_phrase",
        confidence=1.0,
        has_experience_evidence=True
    ))
    db_session.commit()

    # Match with sample job
    sample_job = db_session.query(Job).first()
    match_result = JobMatchingService.match_resume_to_job(
        db=db_session,
        resume=resume,
        job=sample_job
    )

    assert "score_details" in match_result
    assert "skill_gaps" in match_result
    gaps = match_result["skill_gaps"]
    
    # Python and FastAPI should be matched
    matched_names = [g["skill_name"] for g in gaps if g["match_status"] == "matched"]
    assert "Python" in matched_names

