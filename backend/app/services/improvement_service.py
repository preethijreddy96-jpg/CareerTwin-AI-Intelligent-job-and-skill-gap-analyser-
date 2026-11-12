import re
from typing import List, Dict, Any, Optional
from app.models.models import Resume
from app.services.skill_extractor import SkillExtractorService

STRONG_ACTION_VERBS = {
    "architected", "engineered", "developed", "spearheaded", "accelerated",
    "optimized", "automated", "designed", "implemented", "orchestrated",
    "reduced", "increased", "delivered", "mentored", "revamped", "deployed",
    "streamlined", "built", "created", "integrated", "solved", "analyzed"
}

WEAK_STARTERS = {
    "worked on", "responsible for", "helped with", "assisted in", "did",
    "was part of", "handled", "participated in", "duties included"
}

class ResumeImprovementService:
    DISCLAIMER = (
        "Strict Truthfulness Policy: CareerTwin AI enhances wording, active voice, and formatting metrics. "
        "It will never fabricate credentials, employment history, or fictional metrics. Insert your actual achievements."
    )

    @classmethod
    def analyze_and_improve(
        cls,
        resume: Resume,
        job_description: Optional[str] = None,
        target_role: Optional[str] = None
    ) -> Dict[str, Any]:
        text = resume.parsed_text
        lines = [line.strip() for line in text.split('\n') if len(line.strip()) > 15]

        # 1. Action bullet analysis
        weak_bullets = []
        action_verb_count = 0
        metric_count = 0
        total_bullets = 0

        metric_pattern = re.compile(r'\b(?:\d+[\d,.]*%?|\$\d+[\d,.]*|\d+\s*(?:users|requests|ms|seconds|x|clients|team members))\b', re.IGNORECASE)

        for line in lines:
            # Look for bullet-like sentences (starting with -, *, •, or short phrase)
            cleaned_line = re.sub(r'^[•\-\*\d\.]+\s*', '', line)
            first_word = cleaned_line.split()[0].lower() if cleaned_line.split() else ""

            is_weak_starter = any(cleaned_line.lower().startswith(w) for w in WEAK_STARTERS)
            has_strong_verb = first_word in STRONG_ACTION_VERBS
            has_metric = bool(metric_pattern.search(cleaned_line))

            if has_strong_verb:
                action_verb_count += 1
            if has_metric:
                metric_count += 1
            total_bullets += 1

            if is_weak_starter or (not has_metric and len(cleaned_line.split()) > 6 and len(weak_bullets) < 4):
                critique = []
                suggested = cleaned_line

                if is_weak_starter:
                    critique.append("Begins with passive phrasing ('responsible for/worked on') instead of a high-impact leadership verb.")
                    # Provide active rewrite
                    suggested = re.sub(r'^(?:responsible for|worked on|helped with|assisted in)\s*', 'Spearheaded the development of ', cleaned_line, flags=re.IGNORECASE)
                
                if not has_metric:
                    critique.append("Lacks quantifiable business or performance impact (e.g., percentage latency reduction, test coverage, or throughput).")
                    suggested += " [Insert actual metric: resulting in a __% efficiency gain / serving __ users]."

                weak_bullets.append({
                    "original_text": line,
                    "critique": " ".join(critique),
                    "improved_version": suggested,
                    "missing_metric": not has_metric
                })

        total_b = max(1, total_bullets)
        action_verb_score = round(min(100.0, (action_verb_count / total_b) * 140.0), 1)
        quantifiable_metrics_score = round(min(100.0, (metric_count / total_b) * 160.0), 1)
        ats_formatting_score = 88.0 if len(text) > 400 else 60.0
        
        overall_score = round((action_verb_score * 0.35) + (quantifiable_metrics_score * 0.35) + (ats_formatting_score * 0.30), 1)

        # 2. Keyword analysis if JD provided
        matched_keywords = [rs.skill_name for rs in resume.resume_skills]
        missing_critical_keywords = []

        if job_description:
            jd_lower = job_description.lower()
            candidate_lower = {s.lower() for s in matched_keywords}
            # Common high-value technical keywords in tech JDs
            candidate_pool = [
                "Docker", "Kubernetes", "CI/CD", "PostgreSQL", "Redis", "FastAPI",
                "Pytest", "TypeScript", "React", "Microservices", "REST API", "SQL"
            ]
            for kw in candidate_pool:
                if kw.lower() in jd_lower and kw.lower() not in candidate_lower:
                    missing_critical_keywords.append(kw)

        # 3. Technical skills section formatting recommendation
        skills_by_cat = {}
        for rs in resume.resume_skills:
            cat = rs.category or "Other"
            skills_by_cat.setdefault(cat, []).append(rs.skill_name)
        
        cat_lines = [f"• {cat}: {', '.join(sorted(skills))}" for cat, skills in skills_by_cat.items()]
        formatted_skills_suggestion = "\n".join(cat_lines) if cat_lines else "• Core Skills: " + ", ".join(matched_keywords)

        # 4. Summary rewrite suggestion
        target = target_role or "Software Professional"
        name = resume.candidate_name or "Results-Driven Engineer"
        top_skills = ", ".join(matched_keywords[:4]) if matched_keywords else "software engineering, problem solving, and modern development"
        summary_suggestion = (
            f"Results-oriented {target} with demonstrated expertise in {top_skills}. "
            f"Proven track record of designing high-throughput applications, writing maintainable code, and collaborating across agile teams. "
            f"Dedicated to building resilient, customer-centric digital products with clean architecture."
        )

        return {
            "overall_score": overall_score,
            "ats_formatting_score": ats_formatting_score,
            "action_verb_score": action_verb_score,
            "quantifiable_metrics_score": quantifiable_metrics_score,
            "matched_keywords": matched_keywords[:12],
            "missing_critical_keywords": missing_critical_keywords[:6],
            "weak_bullet_points": weak_bullets[:5],
            "summary_suggestions": summary_suggestion,
            "technical_skills_formatting_suggestion": formatted_skills_suggestion,
            "disclaimer": cls.DISCLAIMER
        }

