from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import Resume, JobRole, Job, SkillImportance
from app.ml.embeddings import embedding_service

class CareerRecommenderService:
    @classmethod
    def recommend_careers(
        cls,
        db: Session,
        resume: Resume,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Transparent recommendation engine using skill taxonomy overlap,
        experience context, and semantic role similarity.
        """
        candidate_skills = {rs.skill_name.lower(): rs for rs in resume.resume_skills}
        candidate_skill_names = set(candidate_skills.keys())
        resume_text_excerpt = resume.parsed_text[:2000]

        roles = db.query(JobRole).all()
        scored_roles = []

        for role in roles:
            # Find representative sample job for this role
            sample_job = db.query(Job).filter(Job.role_id == role.id, Job.is_sample == True).first()
            if not sample_job:
                continue

            req_skills = []
            pref_skills = []
            for js in sample_job.job_skills:
                s_name = js.skill.name
                if js.importance == SkillImportance.REQUIRED:
                    req_skills.append(s_name)
                else:
                    pref_skills.append(s_name)

            # Calculate skill overlap
            matched_supporting = []
            missing_skills = []

            for r_s in req_skills:
                if r_s.lower() in candidate_skill_names:
                    matched_supporting.append(r_s)
                else:
                    missing_skills.append(r_s)

            for p_s in pref_skills:
                if p_s.lower() in candidate_skill_names:
                    matched_supporting.append(p_s)
                else:
                    if p_s not in missing_skills:
                        missing_skills.append(p_s)

            # Skill coverage score (0.0 to 1.0)
            total_req = len(req_skills) if req_skills else 1
            matched_req_count = len([s for s in req_skills if s.lower() in candidate_skill_names])
            skill_score = (matched_req_count / total_req) * 0.75 + (len(matched_supporting) / max(1, len(req_skills) + len(pref_skills))) * 0.25

            # Semantic similarity between resume and role title + description
            role_text = f"{role.title}. {role.description}"
            semantic_sim = embedding_service.compute_similarity(resume_text_excerpt, role_text)

            # Combined weighted score
            final_score = (skill_score * 0.70) + (semantic_sim * 0.30)
            final_percentage = round(min(100.0, max(15.0, final_score * 100.0)), 1)

            # Formulate practical next steps
            next_steps = []
            if missing_skills:
                next_steps.append(f"Prioritize building foundational competency in {', '.join(missing_skills[:3])}.")
            next_steps.append(f"Develop a complete portfolio project tailored to {role.title} best practices.")
            next_steps.append("Tailor resume action bullets with quantifiable performance impact.")

            scored_roles.append({
                "role_title": role.title,
                "slug": role.slug,
                "match_score": final_percentage,
                "category": role.category or "Technology",
                "market_demand": role.market_demand or "High",
                "avg_salary_range": role.avg_salary_range or "Competitive",
                "description": role.description,
                "supporting_skills": matched_supporting[:6],
                "missing_skills": missing_skills[:6],
                "recommended_next_steps": next_steps
            })

        # Rank by match_score descending
        scored_roles.sort(key=lambda x: x["match_score"], reverse=True)
        return scored_roles[:top_k]

