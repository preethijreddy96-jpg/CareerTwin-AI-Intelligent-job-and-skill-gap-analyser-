from typing import Dict, Any, List, Optional
from app.core.config import settings

class CompatibilityScorer:
    DISCLAIMER = (
        "Note: The compatibility score is an explainable algorithmic assessment of skill and experience alignment. "
        "It does not represent a hiring guarantee or probability of job offer."
    )

    @classmethod
    def calculate_score(
        cls,
        required_matches: List[Dict[str, Any]],
        preferred_matches: List[Dict[str, Any]],
        semantic_sim: float,
        tfidf_sim: float,
        role_sim: float,
        experience_evidence_ratio: float,
        custom_weights: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Calculates explainable weighted compatibility score with dynamic renormalization.
        """
        weights = {
            "required": settings.WEIGHT_REQUIRED_SKILLS,       # 0.65
            "preferred": settings.WEIGHT_PREFERRED_SKILLS,     # 0.15
            "experience": settings.WEIGHT_PROJECT_EXPERIENCE,  # 0.15
            "role": settings.WEIGHT_ROLE_RELEVANCE             # 0.05
        }
        if custom_weights:
            weights.update(custom_weights)

        # 1. Required skills score
        if required_matches:
            total_req_weight = sum(item.get("weight", 1.0) for item in required_matches)
            req_score_sum = sum(item.get("match_score", 0.0) * item.get("weight", 1.0) for item in required_matches)
            required_score = (req_score_sum / total_req_weight) if total_req_weight > 0 else 0.0
        else:
            required_score = 1.0  # none required

        # 2. Preferred skills score
        has_preferred = len(preferred_matches) > 0
        if has_preferred:
            total_pref_weight = sum(item.get("weight", 1.0) for item in preferred_matches)
            pref_score_sum = sum(item.get("match_score", 0.0) * item.get("weight", 1.0) for item in preferred_matches)
            preferred_score = (pref_score_sum / total_pref_weight) if total_pref_weight > 0 else 0.0
        else:
            preferred_score = 0.0

        # 3. Project & experience relevance (combines semantic similarity + evidence ratio)
        experience_score = (semantic_sim * 0.6) + (experience_evidence_ratio * 0.4)

        # 4. Role relevance
        role_score = max(0.0, min(1.0, role_sim))

        # Dynamic weight renormalization if preferred skills are not present
        active_weights = weights.copy()
        if not has_preferred:
            active_weights["preferred"] = 0.0
        
        weight_sum = sum(active_weights.values())
        if weight_sum > 0:
            normalized_weights = {k: v / weight_sum for k, v in active_weights.items()}
        else:
            normalized_weights = {"required": 1.0, "preferred": 0.0, "experience": 0.0, "role": 0.0}

        overall_score = (
            (required_score * normalized_weights["required"]) +
            (preferred_score * normalized_weights["preferred"]) +
            (experience_score * normalized_weights["experience"]) +
            (role_score * normalized_weights["role"])
        ) * 100.0

        overall_score = round(max(0.0, min(100.0, overall_score)), 1)

        # Detailed explainability narrative
        matched_req = [m["skill_name"] for m in required_matches if m.get("match_status") == "matched"]
        partial_req = [m["skill_name"] for m in required_matches if m.get("match_status") == "partial"]
        missing_req = [m["skill_name"] for m in required_matches if m.get("match_status") == "missing"]

        explanation = (
            f"Overall compatibility of {overall_score}% is computed using weighted multi-factor alignment: "
            f"Required Skills ({round(normalized_weights['required']*100)}% weight, score {round(required_score*100)}%), "
            f"Preferred Skills ({round(normalized_weights['preferred']*100)}% weight, score {round(preferred_score*100)}%), "
            f"Project & Experience Relevance ({round(normalized_weights['experience']*100)}% weight, score {round(experience_score*100)}%), "
            f"and Role Semantic Relevance ({round(normalized_weights['role']*100)}% weight, score {round(role_score*100)}%). "
            f"You matched {len(matched_req)} required skills ({', '.join(matched_req[:4]) if matched_req else 'None'}), "
            f"partially matched {len(partial_req)} skills, and have {len(missing_req)} skill gaps to address."
        )

        return {
            "overall_compatibility_score": overall_score,
            "required_skill_score": round(required_score * 100.0, 1),
            "preferred_skill_score": round(preferred_score * 100.0, 1),
            "project_experience_score": round(experience_score * 100.0, 1),
            "role_relevance_score": round(role_score * 100.0, 1),
            "semantic_similarity_score": round(semantic_sim * 100.0, 1),
            "tfidf_similarity_score": round(tfidf_sim * 100.0, 1),
            "scoring_weights": normalized_weights,
            "scoring_explanation": explanation,
            "disclaimer": cls.DISCLAIMER
        }

