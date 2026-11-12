from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import Skill, SkillAlias, JobRole, Job, JobSkill, SkillImportance, User, UserProfile
from app.core.security import get_password_hash
from app.ml.taxonomy import SKILL_TAXONOMY

SEED_ROLES: List[Dict[str, Any]] = [
    {
        "title": "Python Developer",
        "slug": "python-developer",
        "category": "Backend Engineering",
        "description": "Designs, builds, and maintains server-side applications, APIs, and data pipelines using Python, FastAPI, Django, and modern databases.",
        "avg_salary_range": "$85,000 - $130,000 / ₹8 - ₹18 LPA",
        "market_demand": "High",
        "esco_code": "2512.1",
        "sample_job": {
            "title": "Junior to Mid-Level Python Backend Developer",
            "company": "Apex Cloud Systems",
            "location": "Bengaluru, India (Hybrid)",
            "experience_level": "Fresher / 0-2 Years",
            "description": "Looking for an energetic Python Developer to build scalable RESTful microservices. You will work with FastAPI, PostgreSQL, Docker, and Redis, creating high-throughput asynchronous services and maintaining clean code with Pytest.",
            "required_skills": ["Python", "FastAPI", "PostgreSQL", "Git", "REST API"],
            "preferred_skills": ["Docker", "Redis", "Pytest", "CI/CD", "Problem Solving"]
        }
    },
    {
        "title": "Full-Stack Developer",
        "slug": "full-stack-developer",
        "category": "Software Engineering",
        "description": "Builds end-to-end web applications covering user interface design, server-side business logic, APIs, and relational database systems.",
        "avg_salary_range": "$90,000 - $140,000 / ₹9 - ₹22 LPA",
        "market_demand": "Very High",
        "esco_code": "2512.2",
        "sample_job": {
            "title": "Full-Stack Software Engineer (React + Python/Node)",
            "company": "Nexus Web Solutions",
            "location": "Remote / Hyderabad",
            "experience_level": "1-3 Years",
            "description": "Seeking a Full-Stack Engineer proficient in building responsive React frontends and scalable backend APIs. You will implement features from UI design to PostgreSQL schema migrations and containerized deployments.",
            "required_skills": ["JavaScript", "TypeScript", "React", "Python", "SQL", "HTML", "CSS"],
            "preferred_skills": ["Node.js", "Docker", "Tailwind CSS", "REST API", "Team Collaboration"]
        }
    },
    {
        "title": "Frontend Developer",
        "slug": "frontend-developer",
        "category": "Frontend Engineering",
        "description": "Creates intuitive, responsive, and accessible client-side web interfaces using React, TypeScript, modern CSS, and component architectures.",
        "avg_salary_range": "$80,000 - $125,000 / ₹7 - ₹16 LPA",
        "market_demand": "High",
        "esco_code": "2513.1",
        "sample_job": {
            "title": "Frontend React Developer",
            "company": "PixelCraft Studios",
            "location": "Pune, India (Hybrid)",
            "experience_level": "Fresher / 0-2 Years",
            "description": "Join our design-led team to build sleek, lightning-fast web applications. Focus on React component lifecycles, Tailwind styling, state management, and seamless integration with backend REST endpoints.",
            "required_skills": ["JavaScript", "TypeScript", "React", "HTML", "CSS", "Tailwind CSS"],
            "preferred_skills": ["Next.js", "Git", "REST API", "Problem Solving"]
        }
    },
    {
        "title": "Backend Developer",
        "slug": "backend-developer",
        "category": "Backend Engineering",
        "description": "Architects resilient server systems, secure authentication pipelines, scalable databases, and high-performance microservices.",
        "avg_salary_range": "$90,000 - $135,000 / ₹8 - ₹19 LPA",
        "market_demand": "High",
        "esco_code": "2512.3",
        "sample_job": {
            "title": "Backend Systems Engineer",
            "company": "DataStream Corp",
            "location": "Remote",
            "experience_level": "Fresher / 1-3 Years",
            "description": "Responsible for designing performant REST APIs, optimizing relational queries, caching with Redis, and deploying services inside Docker containers.",
            "required_skills": ["Python", "FastAPI", "SQL", "PostgreSQL", "REST API", "Git"],
            "preferred_skills": ["Docker", "Redis", "Linux", "CI/CD", "Code Review"]
        }
    },
    {
        "title": "Data Analyst",
        "slug": "data-analyst",
        "category": "Data & Analytics",
        "description": "Transforms raw datasets into actionable business intelligence through SQL queries, statistical analysis, and interactive dashboards.",
        "avg_salary_range": "$70,000 - $110,000 / ₹6 - ₹14 LPA",
        "market_demand": "High",
        "esco_code": "2511.1",
        "sample_job": {
            "title": "Associate Data Analyst",
            "company": "Insight Metrics",
            "location": "Mumbai, India",
            "experience_level": "Fresher / 0-2 Years",
            "description": "Extract, clean, and analyze enterprise datasets to support executive decisions. Write complex SQL queries, build automated pipelines using Pandas, and communicate data findings clearly.",
            "required_skills": ["SQL", "Python", "Pandas", "NumPy", "Problem Solving"],
            "preferred_skills": ["PostgreSQL", "Communication", "Git", "Agile Methodologies"]
        }
    },
    {
        "title": "Data Scientist",
        "slug": "data-scientist",
        "category": "Data & Analytics",
        "description": "Builds predictive statistical models, machine learning algorithms, and exploratory data pipelines to solve complex business challenges.",
        "avg_salary_range": "$95,000 - $150,000 / ₹10 - ₹24 LPA",
        "market_demand": "Very High",
        "esco_code": "2120.1",
        "sample_job": {
            "title": "Junior Data Scientist",
            "company": "Cognitive Dynamics",
            "location": "Bengaluru, India (Hybrid)",
            "experience_level": "0-2 Years",
            "description": "Apply statistical learning, regression, classification, and exploratory data analysis to large datasets. Develop predictive pipelines using Scikit-Learn, Pandas, and Python.",
            "required_skills": ["Python", "Machine Learning", "Scikit-Learn", "Pandas", "NumPy", "SQL"],
            "preferred_skills": ["Deep Learning", "PyTorch", "Docker", "Git", "Communication"]
        }
    },
    {
        "title": "AI/ML Engineer",
        "slug": "ai-ml-engineer",
        "category": "Artificial Intelligence",
        "description": "Engineers and deploys production machine learning, natural language processing, and deep neural network architectures into scalable software.",
        "avg_salary_range": "$105,000 - $165,000 / ₹12 - ₹28 LPA",
        "market_demand": "Very High",
        "esco_code": "2512.4",
        "sample_job": {
            "title": "Applied AI / Machine Learning Engineer",
            "company": "Synthetix AI Labs",
            "location": "Remote / Bengaluru",
            "experience_level": "1-3 Years",
            "description": "Deploy state-of-the-art NLP and ML pipelines. Implement Sentence Transformers, spaCy, PyTorch models, and integrate them with high-speed FastAPI endpoints in Docker containers.",
            "required_skills": ["Python", "Machine Learning", "Natural Language Processing", "PyTorch", "Scikit-Learn", "FastAPI"],
            "preferred_skills": ["Deep Learning", "Sentence Transformers", "Docker", "Git", "spaCy"]
        }
    },
    {
        "title": "Java Developer",
        "slug": "java-developer",
        "category": "Enterprise Software",
        "description": "Develops mission-critical enterprise services, microservices, and high-concurrency systems utilizing Java and the Spring Boot ecosystem.",
        "avg_salary_range": "$85,000 - $130,000 / ₹8 - ₹18 LPA",
        "market_demand": "High",
        "esco_code": "2512.5",
        "sample_job": {
            "title": "Java Software Engineer",
            "company": "Fintech Solutions International",
            "location": "Chennai, India",
            "experience_level": "Fresher / 1-3 Years",
            "description": "Build resilient, secure financial transaction microservices using Spring Boot, PostgreSQL, and RESTful architectures. Write comprehensive unit tests and adhere to clean code principles.",
            "required_skills": ["Java", "Spring Boot", "SQL", "PostgreSQL", "REST API", "Git"],
            "preferred_skills": ["Docker", "Redis", "CI/CD", "Problem Solving", "Code Review"]
        }
    },
    {
        "title": "Software Tester",
        "slug": "software-tester",
        "category": "Quality Assurance",
        "description": "Designs automated test suites, functional test plans, and regression runs to guarantee software quality, security, and stability.",
        "avg_salary_range": "$65,000 - $105,000 / ₹5 - ₹13 LPA",
        "market_demand": "Moderate to High",
        "esco_code": "2519.1",
        "sample_job": {
            "title": "QA Automation Engineer",
            "company": "QualityFirst Tech",
            "location": "Noida, India",
            "experience_level": "Fresher / 0-2 Years",
            "description": "Create automated test frameworks using Selenium and Pytest/Java. Verify REST APIs with Postman, document bugs in Jira, and collaborate with developers to ensure defect-free releases.",
            "required_skills": ["Selenium", "Python", "Pytest", "Postman", "Git", "Problem Solving"],
            "preferred_skills": ["Java", "SQL", "Jira", "CI/CD", "Team Collaboration"]
        }
    },
    {
        "title": "SQL Developer",
        "slug": "sql-developer",
        "category": "Database Engineering",
        "description": "Designs relational schemas, stored procedures, query optimization strategies, and ETL data migration routines.",
        "avg_salary_range": "$75,000 - $115,000 / ₹6 - ₹15 LPA",
        "market_demand": "Moderate to High",
        "esco_code": "2521.1",
        "sample_job": {
            "title": "Database Developer / SQL Specialist",
            "company": "Transact Data Systems",
            "location": "Gurugram, India",
            "experience_level": "Fresher / 1-3 Years",
            "description": "Focus on PostgreSQL and MySQL database architectures, query index optimization, transactional data integrity, stored procedures, and ETL pipelines.",
            "required_skills": ["SQL", "PostgreSQL", "MySQL", "Problem Solving"],
            "preferred_skills": ["Python", "Linux", "Git", "Redis"]
        }
    }
]

def seed_database(db: Session):
    """Populates skills, aliases, job roles, and sample jobs if table is empty."""
    if db.query(Skill).count() == 0:
        skill_cache = {}
        for item in SKILL_TAXONOMY:
            skill = Skill(
                name=item["name"],
                canonical_name=item["name"],
                category=item["category"],
                description=item.get("description", ""),
                taxonomy_source=item.get("taxonomy_source", "ESCO/O*NET")
            )
            db.add(skill)
            db.flush()
            skill_cache[skill.name.lower()] = skill

            for alias in item.get("aliases", []):
                alias_obj = SkillAlias(
                    skill_id=skill.id,
                    alias=alias.lower()
                )
                db.add(alias_obj)
        db.commit()

    if db.query(JobRole).count() == 0:
        # Load skills map for foreign key associations
        all_skills = {s.name.lower(): s for s in db.query(Skill).all()}
        
        for role_data in SEED_ROLES:
            role = JobRole(
                title=role_data["title"],
                slug=role_data["slug"],
                category=role_data["category"],
                description=role_data["description"],
                avg_salary_range=role_data["avg_salary_range"],
                market_demand=role_data["market_demand"],
                esco_code=role_data.get("esco_code")
            )
            db.add(role)
            db.flush()

            # Seed sample job for this role
            sample = role_data["sample_job"]
            job = Job(
                role_id=role.id,
                title=sample["title"],
                company=sample["company"],
                location=sample["location"],
                experience_level=sample["experience_level"],
                description=sample["description"],
                is_sample=True
            )
            db.add(job)
            db.flush()

            for req_skill in sample["required_skills"]:
                s_obj = all_skills.get(req_skill.lower())
                if s_obj:
                    db.add(JobSkill(
                        job_id=job.id,
                        skill_id=s_obj.id,
                        importance=SkillImportance.REQUIRED,
                        weight=1.0
                    ))
            
            for pref_skill in sample["preferred_skills"]:
                s_obj = all_skills.get(pref_skill.lower())
                if s_obj:
                    db.add(JobSkill(
                        job_id=job.id,
                        skill_id=s_obj.id,
                        importance=SkillImportance.PREFERRED,
                        weight=0.75
                    ))
        db.commit()

    # Seed Verified Demo Candidate User
    demo_email = "demo.developer@careertwin.ai"
    demo_user = db.query(User).filter(User.email == demo_email).first()
    if not demo_user:
        demo_user = User(
            email=demo_email,
            hashed_password=get_password_hash("DemoCareer2026!#"),
            full_name="Demo Candidate (Full-Stack)",
            is_verified=True
        )
        db.add(demo_user)
        db.flush()

        profile = UserProfile(
            user_id=demo_user.id,
            current_title="Associate Full-Stack Developer",
            target_role="Full-Stack Developer",
            years_experience=2.0,
            education_level="Bachelor's Degree",
            institution="Indian Institute of Technology",
            graduation_year=2024,
            career_interests=["Full-Stack Architecture", "Backend Engineering", "Artificial Intelligence / NLP"],
            bio="Passionate engineer building scalable applications with React, TypeScript, FastAPI, and PostgreSQL."
        )
        db.add(profile)
        db.commit()
    elif not demo_user.is_verified:
        demo_user.is_verified = True
        demo_user.hashed_password = get_password_hash("DemoCareer2026!#")
        db.commit()

