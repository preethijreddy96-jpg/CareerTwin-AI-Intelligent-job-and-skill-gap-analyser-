from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import Resume, Job, Skill, JobSkill, SkillImportance, MatchStatus
from app.ml.embeddings import embedding_service
from app.services.skill_extractor import SkillExtractorService
from app.services.scorer import CompatibilityScorer

class JobMatchingService:
    @classmethod
    def match_resume_to_job(
        cls,
        db: Session,
        resume: Resume,
        job: Optional[Job] = None,
        custom_jd_text: Optional[str] = None,
        target_role_title: Optional[str] = None,
        custom_weights: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Executes hybrid matching:
        - Exact and alias skill overlap
        - Semantic embedding comparison for partial skill overlaps
        - Text semantic similarity + TF-IDF similarity
        - Explainable scoring and gap classification
        """
        # 1. Gather resume skills
        resume_skills_map = {rs.skill_name.lower(): rs for rs in resume.resume_skills}
        resume_skill_names = set(resume_skills_map.keys())

        # 2. Gather target job skills
        required_targets = []
        preferred_targets = []
        job_description_text = ""
        job_title = ""

        if job is not None:
            job_description_text = job.description
            job_title = job.title
            for js in job.job_skills:
                skill_name = js.skill.name
                item = {
                    "skill_name": skill_name,
                    "category": js.skill.category,
                    "importance": js.importance.value,
                    "weight": js.weight
                }
                if js.importance == SkillImportance.REQUIRED:
                    required_targets.append(item)
                else:
                    preferred_targets.append(item)
        elif custom_jd_text:
            job_description_text = custom_jd_text
            job_title = target_role_title or "Target Role"
            extracted_jd = SkillExtractorService.extract_skills_from_job_description(custom_jd_text, db)
            for s in extracted_jd["required"]:
                required_targets.append({
                    "skill_name": s["skill_name"],
                    "category": s["category"],
                    "importance": "required",
                    "weight": 1.0
                })
            for s in extracted_jd["preferred"]:
                preferred_targets.append({
                    "skill_name": s["skill_name"],
                    "category": s["category"],
                    "importance": "preferred",
                    "weight": 0.75
                })

        # 3. Classify matches for required and preferred
        def evaluate_skill_gap(target: Dict[str, Any]) -> Dict[str, Any]:
            target_name = target["skill_name"]
            target_lower = target_name.lower()
            importance = target.get("importance", "required")

            # Check exact or alias match
            if target_lower in resume_skills_map:
                rs = resume_skills_map[target_lower]
                return {
                    "skill_name": target_name,
                    "category": target.get("category"),
                    "importance": importance,
                    "match_status": MatchStatus.MATCHED.value,
                    "match_score": 1.0,
                    "gap_priority_score": 0.0,
                    "resume_evidence": rs.source_sentence or f"Extracted via {rs.extraction_method}",
                    "classification_reason": "Direct skill match found in resume text.",
                    "suggested_improvement": "Keep proficiency up to date with recent project achievements."
                }

            # Check related partial match (e.g. Postgres satisfies SQL, React satisfies JavaScript)
            partial_reason = None
            if target_lower == "sql" and any(k in resume_skill_names for k in ["postgresql", "mysql", "sqlite", "oracle database"]):
                partial_reason = "Resume demonstrates relational database skills (PostgreSQL/MySQL), which provides a solid foundation for SQL."
            elif target_lower == "javascript" and "react" in resume_skill_names:
                partial_reason = "Experience with React implies frontend JavaScript familiarity, though vanilla JS fundamentals should be highlighted."
            elif target_lower == "machine learning" and any(k in resume_skill_names for k in ["scikit-learn", "pandas", "pytorch"]):
                partial_reason = "ML library proficiency (Scikit-Learn/PyTorch) indicates practical machine learning experience."
            else:
                # Semantic similarity check between skill names
                target_emb = embedding_service.encode(target_name)
                for r_skill_name in resume_skill_names:
                    r_emb = embedding_service.encode(r_skill_name)
                    if target_emb is not None and r_emb is not None:
                        sim = float(embedding_service.compute_similarity(target_name, r_skill_name))
                        if sim >= 0.80:
                            partial_reason = f"Conceptually related to '{r_skill_name}' found in your resume (similarity {round(sim*100)}%)."
                            break

            if partial_reason:
                priority = 4.0 if importance == "required" else 2.5
                return {
                    "skill_name": target_name,
                    "category": target.get("category"),
                    "importance": importance,
                    "match_status": MatchStatus.PARTIAL.value,
                    "match_score": 0.5,
                    "gap_priority_score": priority,
                    "resume_evidence": "Partially supported by related technology in resume.",
                    "classification_reason": partial_reason,
                    "suggested_improvement": f"Add explicit bullet points highlighting your direct experience with {target_name}."
                }

            # Missing skill
            imp_multiplier = 10.0 if importance == "required" else 5.0
            return {
                "skill_name": target_name,
                "category": target.get("category"),
                "importance": importance,
                "match_status": MatchStatus.MISSING.value,
                "match_score": 0.0,
                "gap_priority_score": imp_multiplier,
                "resume_evidence": "No mention or direct evidence identified in resume.",
                "classification_reason": f"Skill '{target_name}' is explicitly sought by this role but is missing from your profile.",
                "suggested_improvement": f"Study {target_name} via targeted learning roadmap and build a portfolio mini-project."
            }

        required_evals = [evaluate_skill_gap(t) for t in required_targets]
        preferred_evals = [evaluate_skill_gap(t) for t in preferred_targets]
        all_gaps = required_evals + preferred_evals

        # 4. Global Text & Role Similarity
        resume_full_text = resume.parsed_text
        semantic_sim = embedding_service.compute_similarity(resume_full_text[:2000], job_description_text[:2000])
        tfidf_sim = embedding_service.compute_tfidf_similarity(resume_full_text[:3000], job_description_text[:3000])
        role_sim = embedding_service.compute_similarity(target_role_title or job_title, resume_full_text[:500])

        # 5. Experience evidence ratio
        matched_items = [g for g in all_gaps if g["match_status"] == "matched"]
        evidenced_items = [
            m for m in matched_items 
            if resume_skills_map.get(m["skill_name"].lower()) and resume_skills_map[m["skill_name"].lower()].has_experience_evidence
        ]
        evidence_ratio = (len(evidenced_items) / max(1, len(matched_items))) if matched_items else 0.0

        # 6. Compatibility scoring
        score_details = CompatibilityScorer.calculate_score(
            required_matches=required_evals,
            preferred_matches=preferred_evals,
            semantic_sim=semantic_sim,
            tfidf_sim=tfidf_sim,
            role_sim=role_sim,
            experience_evidence_ratio=evidence_ratio,
            custom_weights=custom_weights
        )

        return {
            "score_details": score_details,
            "skill_gaps": all_gaps,
            "target_role_title": target_role_title or job_title
        }

