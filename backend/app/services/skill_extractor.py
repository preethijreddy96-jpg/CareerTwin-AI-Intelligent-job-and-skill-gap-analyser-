import re
from typing import List, Dict, Any, Set
from rapidfuzz import fuzz
from sqlalchemy.orm import Session
from app.models.models import Skill, SkillAlias
from app.ml.embeddings import embedding_service
from app.ml.taxonomy import get_alias_map

# Common words to avoid false positive fuzzy matches
STOP_WORDS = {"and", "or", "the", "in", "on", "at", "to", "for", "with", "a", "an", "is", "of", "as", "by"}

class SkillExtractorService:
    @classmethod
    def extract_skills_from_text(
        cls,
        text: str,
        db: Session,
        experience_text: str = "",
        projects_text: str = ""
    ) -> List[Dict[str, Any]]:
        """
        Multi-tier skill extraction:
        1. Exact alias & canonical matching with word boundary.
        2. Fuzzy matching with conservative threshold (>= 88) on tokens/ngrams.
        3. Contextual evidence extraction: inspects whether skill is mentioned in
           projects / work experience sections with action words or metrics.
        """
        all_skills = db.query(Skill).all()
        alias_map = get_alias_map()
        
        # Pre-build lookup tables
        canonical_map = {s.name.lower(): s for s in all_skills}
        id_to_skill = {s.id: s for s in all_skills}

        extracted_skills: Dict[int, Dict[str, Any]] = {}
        sentences = [s.strip() for s in re.split(r'[.\n;•\-\*]', text) if len(s.strip()) > 3]

        # 1. Exact canonical & alias matching
        for sentence in sentences:
            sentence_lower = sentence.lower()
            tokens = set(re.findall(r'\b[a-zA-Z0-9#+.]+\b', sentence_lower))

            for alias_key, canonical_name in alias_map.items():
                pattern = rf'(?<![a-zA-Z0-9#+.])' + re.escape(alias_key) + rf'(?![a-zA-Z0-9#+.])'
                if re.search(pattern, sentence_lower):
                    skill_obj = canonical_map.get(canonical_name.lower())
                    if skill_obj and skill_obj.id not in extracted_skills:
                        extracted_skills[skill_obj.id] = {
                            "skill_id": skill_obj.id,
                            "skill_name": skill_obj.name,
                            "canonical_name": skill_obj.canonical_name,
                            "category": skill_obj.category,
                            "extraction_method": "exact_phrase",
                            "confidence": 1.0,
                            "source_sentence": sentence.strip()[:300],
                            "has_experience_evidence": False
                        }

        # 2. Conservative Fuzzy Matching for remaining skills (threshold >= 90)
        # Check against multi-word skills like 'Machine Learning', 'Natural Language Processing', 'Spring Boot'
        for sentence in sentences:
            sentence_lower = sentence.lower()
            for skill_obj in all_skills:
                if skill_obj.id in extracted_skills:
                    continue

                skill_name_lower = skill_obj.name.lower()
                if len(skill_name_lower) > 4:  # Avoid fuzzy matching short abbreviations like 'R', 'Go', 'JS'
                    ratio = fuzz.partial_ratio(skill_name_lower, sentence_lower)
                    if ratio >= 92:
                        extracted_skills[skill_obj.id] = {
                            "skill_id": skill_obj.id,
                            "skill_name": skill_obj.name,
                            "canonical_name": skill_obj.canonical_name,
                            "category": skill_obj.category,
                            "extraction_method": "fuzzy_match",
                            "confidence": round(ratio / 100.0, 2),
                            "source_sentence": sentence.strip()[:300],
                            "has_experience_evidence": False
                        }

        # 3. Demonstrated Experience & Project Evidence Detection
        evidence_corpus = (experience_text + " " + projects_text).lower()
        action_verbs = [
            "developed", "built", "engineered", "implemented", "designed", "architected",
            "deployed", "maintained", "created", "optimized", "integrated", "automated",
            "managed", "led", "configured"
        ]

        for s_id, data in extracted_skills.items():
            s_name = data["skill_name"].lower()
            # If the skill name appears in the experience/projects corpus
            if s_name in evidence_corpus:
                # Check for nearby action verbs within 100 characters
                pos = evidence_corpus.find(s_name)
                window = evidence_corpus[max(0, pos - 100): min(len(evidence_corpus), pos + 100)]
                has_verb = any(v in window for v in action_verbs)
                data["has_experience_evidence"] = has_verb or (len(experience_text) > 0 and s_name in experience_text.lower())
                if data["has_experience_evidence"]:
                    data["confidence"] = min(1.0, data["confidence"] + 0.1)

        return list(extracted_skills.values())

    @classmethod
    def extract_skills_from_job_description(cls, text: str, db: Session) -> Dict[str, List[Dict[str, Any]]]:
        """
        Extracts required and preferred skills from a job description text.
        Classifies skills as 'required' or 'preferred' based on contextual keywords.
        """
        raw_skills = cls.extract_skills_from_text(text, db)
        text_lower = text.lower()

        required = []
        preferred = []

        preferred_cues = ["preferred", "nice to have", "plus", "bonus", "optional", "good to have"]

        for skill in raw_skills:
            s_name = skill["skill_name"].lower()
            pos = text_lower.find(s_name)
            is_pref = False
            if pos != -1:
                # check context preceding the skill
                pre_context = text_lower[max(0, pos - 80): pos]
                if any(cue in pre_context for cue in preferred_cues):
                    is_pref = True

            if is_pref:
                skill["importance"] = "preferred"
                preferred.append(skill)
            else:
                skill["importance"] = "required"
                required.append(skill)

        return {
            "required": required,
            "preferred": preferred,
            "all": raw_skills
        }

