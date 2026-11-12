from app.services.recommender import CareerRecommenderService
from app.services.roadmap_service import RoadmapService
from app.models.models import Resume, ResumeSkill, Skill, Analysis, SkillGap, SkillImportance, MatchStatus

def test_career_recommendations(db_session):
    resume = Resume(
        user_id=1,
        filename="test.pdf",
        file_path="/tmp/test.pdf",
        file_type="pdf",
        file_size_bytes=1024,
        parsed_text="React frontend engineer with TypeScript, HTML, CSS, and Tailwind CSS."
    )
    db_session.add(resume)
    db_session.flush()

    for s_name in ["React", "TypeScript", "HTML", "CSS", "Tailwind CSS"]:
        s_obj = db_session.query(Skill).filter(Skill.name == s_name).first()
        if s_obj:
            db_session.add(ResumeSkill(
                resume_id=resume.id,
                skill_id=s_obj.id,
                skill_name=s_obj.name,
                category=s_obj.category
            ))
    db_session.commit()

    recs = CareerRecommenderService.recommend_careers(db=db_session, resume=resume, top_k=3)
    assert len(recs) > 0
    top_role = recs[0]
    assert top_role["role_title"] in ["Frontend Developer", "Full-Stack Developer"]
    assert top_role["match_score"] > 50

def test_roadmap_generation_and_task_toggle(db_session):
    # Setup dummy analysis with gaps
    analysis = Analysis(
        user_id=1,
        resume_id=1,
        overall_compatibility_score=65.0,
        required_skill_score=60.0,
        preferred_skill_score=50.0,
        project_experience_score=70.0,
        role_relevance_score=80.0,
        semantic_similarity_score=75.0,
        tfidf_similarity_score=65.0,
        scoring_weights={},
        target_role_title="Python Developer"
    )
    db_session.add(analysis)
    db_session.flush()

    db_session.add(SkillGap(
        analysis_id=analysis.id,
        skill_name="Docker",
        category="DevOps",
        importance=SkillImportance.REQUIRED,
        match_status=MatchStatus.MISSING,
        gap_priority_score=10.0
    ))
    db_session.add(SkillGap(
        analysis_id=analysis.id,
        skill_name="PostgreSQL",
        category="Database",
        importance=SkillImportance.REQUIRED,
        match_status=MatchStatus.MISSING,
        gap_priority_score=9.0
    ))
    db_session.commit()

    # Generate roadmap
    roadmap = RoadmapService.generate_roadmap_from_analysis(
        db=db_session,
        analysis=analysis,
        user_id=1
    )
    assert roadmap.total_tasks == 2
    assert roadmap.completed_tasks == 0
    assert len(roadmap.tasks) == 2

    # Toggle task completed
    task1 = roadmap.tasks[0]
    updated_task = RoadmapService.toggle_task_completion(
        db=db_session,
        task=task1,
        is_completed=True,
        user_id=1
    )
    assert updated_task.is_completed is True
    assert roadmap.completed_tasks == 1

