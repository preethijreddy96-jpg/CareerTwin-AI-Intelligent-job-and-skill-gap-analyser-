from app.services.skill_extractor import SkillExtractorService

def test_alias_normalization(db_session):
    text = "Proficient in JS, Postgres, ML, NLP, K8s, and Py."
    skills = SkillExtractorService.extract_skills_from_text(text, db_session)
    extracted_names = {s["skill_name"] for s in skills}

    assert "JavaScript" in extracted_names  # normalized from JS
    assert "PostgreSQL" in extracted_names  # normalized from Postgres
    assert "Machine Learning" in extracted_names  # normalized from ML
    assert "Natural Language Processing" in extracted_names  # normalized from NLP
    assert "Kubernetes" in extracted_names  # normalized from K8s
    assert "Python" in extracted_names  # normalized from Py

def test_contextual_experience_evidence(db_session):
    text = "Candidate skills: Python, React, Docker."
    exp_text = "Architected and deployed microservices using Docker on AWS cloud."
    
    skills = SkillExtractorService.extract_skills_from_text(
        text=text,
        db=db_session,
        experience_text=exp_text
    )
    skill_dict = {s["skill_name"]: s for s in skills}

    # Docker was actively deployed in experience
    assert skill_dict["Docker"]["has_experience_evidence"] is True
    # React was only mentioned in skills list without experience context
    assert skill_dict["React"]["has_experience_evidence"] is False

