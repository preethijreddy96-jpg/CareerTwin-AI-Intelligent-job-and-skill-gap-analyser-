import os
from pathlib import Path
import fitz
from docx import Document

OUTPUT_DIR = Path(__file__).resolve().parent.parent.parent / "sample_resumes"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def generate_pdf_resume():
    pdf_path = OUTPUT_DIR / "sample_alex_morgan_python_developer.pdf"
    doc = fitz.open()
    page = doc.new_page(width=595, height=842) # A4 size

    content = """Alex Morgan
alex.morgan@example.com | +91 9876543210 | Bengaluru, India | github.com/alexmorgan

PROFESSIONAL SUMMARY
Dynamic Python Backend Developer with 2+ years of experience designing high-performance RESTful APIs,
microservices architectures, and asynchronous data pipelines using FastAPI, PostgreSQL, and Docker.

TECHNICAL SKILLS
• Languages: Python (3.10+), SQL, JavaScript, HTML, CSS
• Frameworks & Libraries: FastAPI, Django, Scikit-Learn, Pytest
• Databases: PostgreSQL, SQLite, Redis
• DevOps & Tools: Docker, Git, GitHub Actions, CI/CD, Linux

WORK EXPERIENCE
Backend Software Developer | CloudScale Solutions | 2023 - Present
• Architected and deployed 14 asynchronous REST microservices using FastAPI and SQLAlchemy.
• Optimized PostgreSQL query execution plans, reducing average API response latency by 38%.
• Implemented automated CI/CD pipelines with GitHub Actions and Docker containerization.
• Wrote comprehensive test suites with Pytest achieving 92% code coverage.

ACADEMIC QUALIFICATIONS
Bachelor of Technology in Computer Science & Engineering | 2019 - 2023
National Institute of Technology | CGPA: 8.7/10

KEY PROJECTS
• Distributed Task Queue & Worker: Built an asynchronous distributed job scheduler using Python, Redis, and FastAPI.
• Resume Intelligence Parser: Developed an NLP extraction pipeline utilizing spaCy and semantic vector embeddings.
"""
    rect = fitz.Rect(50, 50, 545, 800)
    page.insert_textbox(rect, content, fontsize=10, fontname="helv", color=(0.1, 0.1, 0.15))
    doc.save(str(pdf_path))
    doc.close()
    print(f"Generated sample PDF: {pdf_path}")

def generate_docx_resume():
    docx_path = OUTPUT_DIR / "sample_priya_sharma_fullstack.docx"
    doc = Document()
    doc.add_heading("Priya Sharma", level=0)
    doc.add_paragraph("priya.sharma@example.com | +91 9123456789 | Hyderabad, India")
    
    doc.add_heading("Professional Summary", level=1)
    doc.add_paragraph(
        "Full-Stack Web Developer skilled in building interactive user interfaces with React, TypeScript, "
        "and scalable server-side systems with Node.js, Express, and PostgreSQL."
    )

    doc.add_heading("Technical Skills", level=1)
    doc.add_paragraph(
        "React, TypeScript, JavaScript, HTML, CSS, Tailwind CSS, Node.js, PostgreSQL, SQL, Docker, Git, REST API"
    )

    doc.add_heading("Work Experience", level=1)
    doc.add_paragraph(
        "Full-Stack Engineer at WebNext Labs (2023 - Present):\n"
        "• Engineered responsive frontend components using React, TypeScript, and Tailwind CSS.\n"
        "• Built secure authentication flows and REST APIs connecting to PostgreSQL databases.\n"
        "• Spearheaded unit testing and automated build routines using Git and Docker."
    )

    doc.add_heading("Education", level=1)
    doc.add_paragraph("Bachelor of Engineering in Information Technology | 2019 - 2023")

    doc.save(str(docx_path))
    print(f"Generated sample DOCX: {docx_path}")

if __name__ == "__main__":
    generate_pdf_resume()
    generate_docx_resume()

