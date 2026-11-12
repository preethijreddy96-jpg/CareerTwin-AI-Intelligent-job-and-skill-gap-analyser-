from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import (
    LearningRoadmap, LearningTask, SkillGap, Analysis,
    SkillLevel, UserProgress, ResumeSkill, Skill
)

# Skill curricula templates for structured roadmap generation
SKILL_CURRICULUM_CATALOG: Dict[str, Dict[str, Any]] = {
    "Docker": {
        "level": SkillLevel.BEGINNER,
        "objective": "Understand containerization fundamentals, Dockerfiles, images, containers, and volume management.",
        "practice_activity": "Write a multi-stage Dockerfile for a Python/Node web service and run it locally with mapped ports and environment variables.",
        "mini_project_idea": "Containerize a full-stack application (frontend, backend API, PostgreSQL database) using Docker Compose with automated health checks.",
        "hours": 10
    },
    "FastAPI": {
        "level": SkillLevel.INTERMEDIATE,
        "objective": "Master asynchronous REST API development, Pydantic data schemas, dependency injection, and JWT security.",
        "practice_activity": "Build a CRUD REST API with query parameter validation, OAuth2 password bearer token handling, and automated Swagger documentation.",
        "mini_project_idea": "Develop a high-throughput Task Management API with PostgreSQL persistence, SQLAlchemy ORM, and background workers.",
        "hours": 12
    },
    "PostgreSQL": {
        "level": SkillLevel.BEGINNER,
        "objective": "Design relational database schemas, write complex joins, index queries for performance, and maintain referential integrity.",
        "practice_activity": "Write SQL migration scripts, execute window functions, and optimize slow queries using EXPLAIN ANALYZE.",
        "mini_project_idea": "Design an E-Commerce relational data warehouse with ACID transactions, composite indexes, and materialized views.",
        "hours": 8
    },
    "React": {
        "level": SkillLevel.BEGINNER,
        "objective": "Master functional components, hooks (useState, useEffect, useContext), state management, and component architecture.",
        "practice_activity": "Build an interactive dynamic search filter with debounce, local storage caching, and responsive modal dialogs.",
        "mini_project_idea": "Build a live Kanban task dashboard with drag-and-drop status columns and persistent REST API synchronization.",
        "hours": 14
    },
    "TypeScript": {
        "level": SkillLevel.INTERMEDIATE,
        "objective": "Learn static typing, interfaces, generics, union types, and utility types in production web applications.",
        "practice_activity": "Refactor a legacy JavaScript utility library into strictly typed TypeScript with no 'any' types.",
        "mini_project_idea": "Create a fully typed API client SDK with automatic response schema validation and custom error types.",
        "hours": 10
    },
    "Pytest": {
        "level": SkillLevel.BEGINNER,
        "objective": "Implement automated unit, integration, and regression testing with fixtures, mocks, and parameterized tests.",
        "practice_activity": "Write unit tests achieving 85%+ test coverage for API endpoints and business logic functions.",
        "mini_project_idea": "Build a CI-integrated test suite for a microservice with database rollback fixtures and mock HTTP responses.",
        "hours": 6
    },
    "Redis": {
        "level": SkillLevel.INTERMEDIATE,
        "objective": "Understand in-memory caching patterns, TTL keys, pub/sub messaging, and rate-limiting.",
        "practice_activity": "Implement a distributed API rate limiter and cache middleware using Redis in Python or Node.",
        "mini_project_idea": "Build a real-time leaderboard or cached analytics endpoint with sub-millisecond response latency.",
        "hours": 8
    },
    "Machine Learning": {
        "level": SkillLevel.INTERMEDIATE,
        "objective": "Understand supervised and unsupervised algorithms, feature engineering, cross-validation, and metrics (Precision, Recall, ROC-AUC).",
        "practice_activity": "Clean a messy real-world dataset, perform exploratory data analysis, and train a tuned RandomForest classifier.",
        "mini_project_idea": "Develop a Customer Churn Predictor web app with scikit-learn pipeline serialization and explainable feature importances.",
        "hours": 16
    },
    "Natural Language Processing": {
        "level": SkillLevel.INTERMEDIATE,
        "objective": "Master tokenization, lemmatization, named entity recognition, TF-IDF vectorization, and transformer sentence embeddings.",
        "practice_activity": "Build a text classification and sentiment analysis script using spaCy and cosine similarity.",
        "mini_project_idea": "Create a Semantic Resume-to-Job matcher that computes cosine distance between sentence embeddings and highlights keywords.",
        "hours": 18
    },
    "CI/CD": {
        "level": SkillLevel.BEGINNER,
        "objective": "Configure continuous integration pipelines to automate linting, testing, docker image building, and automated deployment.",
        "practice_activity": "Write a GitHub Actions workflow YAML file that triggers on every pull request, runs pytest, and builds a docker container.",
        "mini_project_idea": "Build a production-grade automated deployment pipeline that executes tests and pushes images to a container registry.",
        "hours": 8
    }
}

class RoadmapService:
    @classmethod
    def generate_roadmap_from_analysis(
        cls,
        db: Session,
        analysis: Analysis,
        user_id: int,
        target_role: Optional[str] = None
    ) -> LearningRoadmap:
        """
        Synthesizes a structured personalized roadmap ordered logically
        from foundational missing skills to advanced practice activities.
        """
        role_name = target_role or analysis.target_role_title or "Target Career Role"
        
        # Filter missing and partial skill gaps
        gaps = db.query(SkillGap).filter(
            SkillGap.analysis_id == analysis.id,
            SkillGap.match_status.in_(["missing", "partial"])
        ).order_by(SkillGap.gap_priority_score.desc()).all()

        roadmap = LearningRoadmap(
            user_id=user_id,
            target_role=role_name,
            title=f"Career Pathway to {role_name}",
            description=f"Personalized skill bridging plan formulated based on your resume analysis and {len(gaps)} identified skill growth areas.",
            total_tasks=len(gaps),
            completed_tasks=0
        )
        db.add(roadmap)
        db.flush()

        # Skill sequence ordering priority: Foundation (Languages, Databases) -> Frameworks -> Tools/DevOps/Testing
        category_weights = {
            "Programming Language": 1,
            "Database": 2,
            "Framework": 3,
            "Web Technology": 4,
            "AI / ML": 5,
            "DevOps": 6,
            "Testing / QA": 7,
            "Tool": 8,
            "Professional Skill": 9
        }

        # Sort gaps by logical sequence
        sorted_gaps = sorted(
            gaps,
            key=lambda g: (
                category_weights.get(g.category or "", 5),
                -g.gap_priority_score
            )
        )

        for seq_idx, gap in enumerate(sorted_gaps, start=1):
            s_name = gap.skill_name
            cat_data = SKILL_CURRICULUM_CATALOG.get(s_name, {
                "level": SkillLevel.BEGINNER if gap.match_status == "missing" else SkillLevel.INTERMEDIATE,
                "objective": f"Acquire practical, industry-standard working knowledge of {s_name} for {role_name}.",
                "practice_activity": f"Complete hands-on tutorials and build isolated code modules implementing core {s_name} patterns.",
                "mini_project_idea": f"Incorporate {s_name} into an end-to-end repository demo showcasing error handling and unit tests.",
                "hours": 10
            })

            priority = "Critical" if gap.gap_priority_score >= 8.0 else ("High" if gap.gap_priority_score >= 4.0 else "Medium")

            task = LearningTask(
                roadmap_id=roadmap.id,
                skill_name=s_name,
                learning_priority=priority,
                level=cat_data["level"],
                sequence_order=seq_idx,
                learning_objective=cat_data["objective"],
                practice_activity=cat_data["practice_activity"],
                mini_project_idea=cat_data["mini_project_idea"],
                estimated_hours=cat_data["hours"],
                is_completed=False
            )
            db.add(task)

        # Log user progress event
        db.add(UserProgress(
            user_id=user_id,
            event_type="roadmap_generated",
            title=f"Generated career roadmap for {role_name}",
            details={"roadmap_id": roadmap.id, "total_tasks": len(sorted_gaps)}
        ))

        db.commit()
        db.refresh(roadmap)
        return roadmap

    @classmethod
    def toggle_task_completion(
        cls,
        db: Session,
        task: LearningTask,
        is_completed: bool,
        user_id: int
    ) -> LearningTask:
        task.is_completed = is_completed
        task.completed_at = datetime.utcnow() if is_completed else None
        db.flush()
        
        # Update roadmap counters
        roadmap = task.roadmap
        completed_count = db.query(LearningTask).filter(
            LearningTask.roadmap_id == roadmap.id,
            LearningTask.is_completed == True
        ).count()
        roadmap.completed_tasks = completed_count

        # If completed, also register as an acquired skill in user progress & resume skills
        if is_completed:
            db.add(UserProgress(
                user_id=user_id,
                event_type="task_completed",
                title=f"Mastered skill: {task.skill_name}",
                details={"task_id": task.id, "skill_name": task.skill_name}
            ))

        db.commit()
        db.refresh(task)
        return task
