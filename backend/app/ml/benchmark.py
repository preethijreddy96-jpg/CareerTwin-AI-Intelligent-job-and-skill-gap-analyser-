from typing import Dict, Any, List, Set
from sqlalchemy.orm import Session
from app.services.skill_extractor import SkillExtractorService

# Human-labelled benchmark dataset of technical resumes with verified ground truth skills
BENCHMARK_SAMPLES: List[Dict[str, Any]] = [
    {
        "id": "sample_1_python_dev",
        "text": """
        Senior Python Software Engineer with 4 years experience building backend REST microservices.
        Expertise in FastAPI, Django, and asynchronous programming. Extensive database architecture using
        PostgreSQL and Redis for high-throughput caching. Proficient in Docker containerization,
        Pytest automated test suites, Git version control, and CI/CD pipelines with GitHub Actions.
        Collaborated in agile sprint ceremonies and led code reviews.
        """,
        "ground_truth_skills": {
            "Python", "FastAPI", "Django", "PostgreSQL", "Redis",
            "Docker", "Pytest", "Git", "CI/CD", "Code Review", "Agile Methodologies"
        }
    },
    {
        "id": "sample_2_frontend_dev",
        "text": """
        Frontend Developer specializing in dynamic single-page web applications.
        Advanced mastery of JavaScript (ES6+), TypeScript, React, and Next.js.
        Skilled in modern styling using Tailwind CSS and HTML/CSS responsive design.
        Integrates backend REST APIs and utilizes Git for code collaboration.
        Strong problem solving and team collaboration skills.
        """,
        "ground_truth_skills": {
            "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS",
            "HTML", "CSS", "REST API", "Git", "Problem Solving", "Team Collaboration"
        }
    },
    {
        "id": "sample_3_data_scientist",
        "text": """
        Data Scientist with a background in statistical modeling and machine learning algorithms.
        Hands-on experience developing predictive models using Scikit-Learn, PyTorch, and deep learning.
        Proficient in exploratory data analysis with Pandas, NumPy, and SQL queries against PostgreSQL.
        Implemented Natural Language Processing (NLP) models with spaCy and sentence transformers.
        """,
        "ground_truth_skills": {
            "Machine Learning", "Scikit-Learn", "PyTorch", "Deep Learning",
            "Pandas", "NumPy", "SQL", "PostgreSQL", "Natural Language Processing",
            "spaCy", "Sentence Transformers"
        }
    }
]

def run_skill_extraction_benchmark(db: Session) -> Dict[str, Any]:
    """
    Evaluates the extraction engine against human-labelled ground truth.
    Computes real Precision, Recall, and F1-score across all test samples.
    """
    total_tp = 0
    total_fp = 0
    total_fn = 0
    sample_reports = []

    for sample in BENCHMARK_SAMPLES:
        extracted = SkillExtractorService.extract_skills_from_text(sample["text"], db)
        extracted_names = {item["skill_name"] for item in extracted}
        truth_names = sample["ground_truth_skills"]

        tp = len(extracted_names.intersection(truth_names))
        fp = len(extracted_names - truth_names)
        fn = len(truth_names - extracted_names)

        total_tp += tp
        total_fp += fp
        total_fn += fn

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

        sample_reports.append({
            "sample_id": sample["id"],
            "true_positives": tp,
            "false_positives": fp,
            "false_negatives": fn,
            "precision": round(precision, 3),
            "recall": round(recall, 3),
            "f1_score": round(f1, 3),
            "matched_skills": sorted(list(extracted_names.intersection(truth_names))),
            "unmatched_ground_truth": sorted(list(truth_names - extracted_names)),
            "extra_extracted": sorted(list(extracted_names - truth_names))
        })

    overall_precision = total_tp / (total_tp + total_fp) if (total_tp + total_fp) > 0 else 0.0
    overall_recall = total_tp / (total_tp + total_fn) if (total_tp + total_fn) > 0 else 0.0
    overall_f1 = (2 * overall_precision * overall_recall) / (overall_precision + overall_recall) if (overall_precision + overall_recall) > 0 else 0.0

    return {
        "total_ground_truth_skills": total_tp + total_fn,
        "total_extracted_skills": total_tp + total_fp,
        "overall_precision": round(overall_precision, 4),
        "overall_recall": round(overall_recall, 4),
        "overall_f1_score": round(overall_f1, 4),
        "sample_reports": sample_reports
    }

