from typing import Dict, List, Any

# Curated ESCO & O*NET Aligned Taxonomy of Skills
SKILL_TAXONOMY: List[Dict[str, Any]] = [
    # Programming Languages
    {"name": "Python", "category": "Programming Language", "description": "High-level programming language widely used in AI, web development, and data analysis.", "taxonomy_source": "ESCO/O*NET", "aliases": ["python3", "py", "python-3"]},
    {"name": "JavaScript", "category": "Programming Language", "description": "Dynamic script language standard for modern web browsers and server applications.", "taxonomy_source": "ESCO/O*NET", "aliases": ["js", "ecmascript", "es6", "es2020", "vanilla js"]},
    {"name": "TypeScript", "category": "Programming Language", "description": "Strongly typed superset of JavaScript that compiles to plain JavaScript.", "taxonomy_source": "ESCO/O*NET", "aliases": ["ts"]},
    {"name": "Java", "category": "Programming Language", "description": "Object-oriented, class-based programming language for enterprise software and Android.", "taxonomy_source": "ESCO/O*NET", "aliases": ["java 8", "java 11", "java 17", "java 21", "core java"]},
    {"name": "C++", "category": "Programming Language", "description": "High-performance general-purpose systems programming language.", "taxonomy_source": "ESCO/O*NET", "aliases": ["cpp", "cplusplus"]},
    {"name": "C#", "category": "Programming Language", "description": "Modern, object-oriented programming language developed by Microsoft for .NET.", "taxonomy_source": "ESCO/O*NET", "aliases": ["csharp", "c-sharp"]},
    {"name": "Go", "category": "Programming Language", "description": "Statically typed, compiled programming language designed at Google for concurrent network services.", "taxonomy_source": "ESCO/O*NET", "aliases": ["golang"]},
    {"name": "Rust", "category": "Programming Language", "description": "Systems programming language focused on safety, speed, and memory concurrency.", "taxonomy_source": "ESCO/O*NET", "aliases": ["rust-lang"]},
    {"name": "SQL", "category": "Programming Language", "description": "Domain-specific language used in programming and designed for managing data in relational databases.", "taxonomy_source": "ESCO/O*NET", "aliases": ["structured query language", "t-sql", "pl-sql", "plsql"]},
    {"name": "HTML", "category": "Web Technology", "description": "Hypertext Markup Language standard for web documents.", "taxonomy_source": "ESCO", "aliases": ["html5"]},
    {"name": "CSS", "category": "Web Technology", "description": "Cascading Style Sheets standard for web presentation and layout.", "taxonomy_source": "ESCO", "aliases": ["css3", "sass", "scss", "less"]},

    # Frameworks & Libraries
    {"name": "React", "category": "Framework", "description": "Declarative, component-based front-end JavaScript library.", "taxonomy_source": "O*NET", "aliases": ["react.js", "reactjs", "react native"]},
    {"name": "Node.js", "category": "Framework", "description": "Open-source, cross-platform JavaScript runtime environment for server applications.", "taxonomy_source": "O*NET", "aliases": ["nodejs", "node"]},
    {"name": "FastAPI", "category": "Framework", "description": "Modern, high-performance web framework for building APIs with Python based on standard type hints.", "taxonomy_source": "Curated", "aliases": ["fast api"]},
    {"name": "Django", "category": "Framework", "description": "High-level Python web framework that encourages rapid development and clean design.", "taxonomy_source": "ESCO/O*NET", "aliases": ["django rest framework", "drf"]},
    {"name": "Flask", "category": "Framework", "description": "Lightweight WSGI Python web framework designed to make getting started quick and easy.", "taxonomy_source": "Curated", "aliases": ["flask-restful"]},
    {"name": "Spring Boot", "category": "Framework", "description": "Java-based framework used to create microservices and enterprise applications.", "taxonomy_source": "O*NET", "aliases": ["spring", "spring-boot", "spring framework"]},
    {"name": "Express.js", "category": "Framework", "description": "Fast, unopinionated, minimalist web framework for Node.js.", "taxonomy_source": "O*NET", "aliases": ["express", "expressjs"]},
    {"name": "Next.js", "category": "Framework", "description": "Full-stack React framework with server-side rendering and static generation.", "taxonomy_source": "Curated", "aliases": ["nextjs", "next"]},
    {"name": "Angular", "category": "Framework", "description": "TypeScript-based open-source web application framework led by Google.", "taxonomy_source": "O*NET", "aliases": ["angularjs", "angular 2+"]},
    {"name": "Vue.js", "category": "Framework", "description": "Progressive JavaScript framework for building user interfaces.", "taxonomy_source": "O*NET", "aliases": ["vue", "vuejs"]},
    {"name": "Tailwind CSS", "category": "Framework", "description": "Utility-first CSS framework for rapid UI development.", "taxonomy_source": "Curated", "aliases": ["tailwind", "tailwindcss"]},

    # Databases
    {"name": "PostgreSQL", "category": "Database", "description": "Powerful, open source object-relational database system.", "taxonomy_source": "ESCO/O*NET", "aliases": ["postgres", "pgsql", "psql"]},
    {"name": "MySQL", "category": "Database", "description": "Popular open-source relational database management system.", "taxonomy_source": "ESCO/O*NET", "aliases": ["my-sql"]},
    {"name": "MongoDB", "category": "Database", "description": "Document-based distributed database designed for modern apps and cloud era.", "taxonomy_source": "O*NET", "aliases": ["mongo", "mongodb atlas"]},
    {"name": "Redis", "category": "Database", "description": "In-memory data structure store used as a database, cache, message broker, and streaming engine.", "taxonomy_source": "O*NET", "aliases": ["redis cache"]},
    {"name": "SQLite", "category": "Database", "description": "C-language library that implements a small, fast, self-contained SQL database engine.", "taxonomy_source": "ESCO", "aliases": ["sqlite3"]},
    {"name": "Oracle Database", "category": "Database", "description": "Multi-model relational database management system by Oracle Corporation.", "taxonomy_source": "ESCO/O*NET", "aliases": ["oracle", "oracle db", "pl/sql"]},

    # Machine Learning & AI
    {"name": "Machine Learning", "category": "AI / ML", "description": "Study of algorithms that improve automatically through experience and data.", "taxonomy_source": "ESCO/O*NET", "aliases": ["ml", "applied ml", "machine learning algorithms"]},
    {"name": "Deep Learning", "category": "AI / ML", "description": "Subset of machine learning based on artificial neural networks with representation learning.", "taxonomy_source": "ESCO/O*NET", "aliases": ["dl", "neural networks", "ann", "cnn", "rnn"]},
    {"name": "Natural Language Processing", "category": "AI / ML", "description": "Branch of artificial intelligence that gives computers the ability to understand text and spoken words.", "taxonomy_source": "ESCO/O*NET", "aliases": ["nlp", "text mining", "text analytics", "computational linguistics"]},
    {"name": "Computer Vision", "category": "AI / ML", "description": "Field of artificial intelligence that trains computers to interpret and understand visual information.", "taxonomy_source": "ESCO/O*NET", "aliases": ["cv", "image processing", "opencv"]},
    {"name": "PyTorch", "category": "AI / ML", "description": "Open source machine learning framework based on the Torch library.", "taxonomy_source": "O*NET", "aliases": ["torch"]},
    {"name": "TensorFlow", "category": "AI / ML", "description": "End-to-end open-source machine learning platform developed by Google.", "taxonomy_source": "O*NET", "aliases": ["tf", "keras"]},
    {"name": "Scikit-Learn", "category": "AI / ML", "description": "Machine learning library for Python featuring various classification, regression, and clustering algorithms.", "taxonomy_source": "Curated", "aliases": ["sklearn", "scikit learn"]},
    {"name": "Pandas", "category": "Data Engineering", "description": "Fast, powerful, flexible and easy to use open source data analysis and manipulation tool.", "taxonomy_source": "Curated", "aliases": ["pandas dataframe"]},
    {"name": "NumPy", "category": "Data Engineering", "description": "Fundamental package for scientific computing with Python.", "taxonomy_source": "Curated", "aliases": ["numpy array"]},
    {"name": "Sentence Transformers", "category": "AI / ML", "description": "Python framework for state-of-the-art sentence, text and image embeddings.", "taxonomy_source": "Curated", "aliases": ["sbert", "sentence-transformers"]},
    {"name": "spaCy", "category": "AI / ML", "description": "Industrial-strength natural language processing library in Python.", "taxonomy_source": "Curated", "aliases": ["spacy nlp"]},

    # Cloud & DevOps
    {"name": "Docker", "category": "DevOps", "description": "Platform designed to help developers build, share, and run container applications.", "taxonomy_source": "O*NET", "aliases": ["containerization", "containers", "docker-compose"]},
    {"name": "Kubernetes", "category": "DevOps", "description": "Open-source system for automating deployment, scaling, and management of containerized applications.", "taxonomy_source": "O*NET", "aliases": ["k8s", "kube"]},
    {"name": "AWS", "category": "Cloud", "description": "Comprehensive, evolving cloud computing platform provided by Amazon.", "taxonomy_source": "O*NET", "aliases": ["amazon web services", "ec2", "s3", "lambda"]},
    {"name": "Azure", "category": "Cloud", "description": "Cloud computing platform and infrastructure created by Microsoft.", "taxonomy_source": "O*NET", "aliases": ["microsoft azure", "azure devops"]},
    {"name": "Google Cloud Platform", "category": "Cloud", "description": "Suite of cloud computing services offered by Google.", "taxonomy_source": "O*NET", "aliases": ["gcp", "google cloud"]},
    {"name": "CI/CD", "category": "DevOps", "description": "Method to frequently deliver apps to customers by introducing automation into app development stages.", "taxonomy_source": "ESCO/O*NET", "aliases": ["continuous integration", "continuous deployment", "jenkins", "github actions", "gitlab ci"]},
    {"name": "Linux", "category": "Operating System", "description": "Family of open-source Unix-like operating systems based on the Linux kernel.", "taxonomy_source": "ESCO/O*NET", "aliases": ["ubuntu", "debian", "centos", "bash", "shell scripting"]},

    # Tools & Testing
    {"name": "Git", "category": "Tool", "description": "Distributed version control system for tracking changes in source code during software development.", "taxonomy_source": "ESCO/O*NET", "aliases": ["github", "gitlab", "version control", "bitbucket"]},
    {"name": "REST API", "category": "Software Architecture", "description": "Architectural style for an application programming interface that uses HTTP requests.", "taxonomy_source": "ESCO", "aliases": ["rest", "restful api", "rest apis", "restful web services"]},
    {"name": "GraphQL", "category": "Software Architecture", "description": "Query language for APIs and runtime for fulfilling queries with existing data.", "taxonomy_source": "Curated", "aliases": ["graphql api"]},
    {"name": "Pytest", "category": "Testing / QA", "description": "Mature, full-featured Python testing tool that helps write better programs.", "taxonomy_source": "Curated", "aliases": ["py.test", "python unittest"]},
    {"name": "Selenium", "category": "Testing / QA", "description": "Open-source umbrella project for a range of tools and libraries that support browser automation.", "taxonomy_source": "ESCO/O*NET", "aliases": ["selenium webdriver", "automation testing"]},
    {"name": "Jira", "category": "Tool", "description": "Proprietary issue tracking product that allows bug tracking and agile project management.", "taxonomy_source": "ESCO", "aliases": ["atlassian jira", "jira software"]},
    {"name": "Postman", "category": "Tool", "description": "API platform for building and using APIs, testing endpoints, and automated assertions.", "taxonomy_source": "Curated", "aliases": ["postman api"]},

    # Professional & Soft Skills
    {"name": "Problem Solving", "category": "Professional Skill", "description": "Ability to handle complex situations and engineer pragmatic, effective solutions.", "taxonomy_source": "ESCO", "aliases": ["analytical thinking", "critical thinking", "troubleshooting"]},
    {"name": "Team Collaboration", "category": "Professional Skill", "description": "Working cooperatively with others across cross-functional engineering teams.", "taxonomy_source": "ESCO", "aliases": ["teamwork", "collaboration", "cross-functional collaboration"]},
    {"name": "Communication", "category": "Professional Skill", "description": "Clear written and verbal articulation of technical concepts and architecture.", "taxonomy_source": "ESCO", "aliases": ["verbal communication", "written communication", "presentation skills"]},
    {"name": "Agile Methodologies", "category": "Professional Skill", "description": "Iterative approach to project management and software development.", "taxonomy_source": "ESCO", "aliases": ["agile", "scrum", "sprints", "kanban"]},
    {"name": "Code Review", "category": "Professional Skill", "description": "Systematic examination of computer source code intended to find bugs and ensure quality.", "taxonomy_source": "Curated", "aliases": ["peer review", "pull request review"]}
]

def get_alias_map() -> Dict[str, str]:
    """Returns lowercased alias to canonical skill name mapping."""
    alias_map = {}
    for item in SKILL_TAXONOMY:
        canonical = item["name"]
        alias_map[canonical.lower()] = canonical
        for a in item.get("aliases", []):
            alias_map[a.lower()] = canonical
    return alias_map

