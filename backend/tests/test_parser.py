import io
import pytest
from docx import Document
import fitz
from app.services.resume_parser import ResumeParserService

def test_docx_generation_and_extraction(tmp_path):
    doc_path = str(tmp_path / "test_resume.docx")
    doc = Document()
    doc.add_heading("Jane Doe", 0)
    doc.add_paragraph("Email: jane.doe@example.com | Phone: +1-555-0199")
    doc.add_heading("Skills", level=1)
    doc.add_paragraph("Python, FastAPI, Docker, PostgreSQL, Pytest")
    doc.add_heading("Work Experience", level=1)
    doc.add_paragraph("Software Engineer at CloudTech. Built REST APIs using FastAPI and optimized queries.")
    doc.save(doc_path)

    extracted_text = ResumeParserService.extract_text_from_docx(doc_path)
    assert "Jane Doe" in extracted_text
    assert "jane.doe@example.com" in extracted_text
    assert "FastAPI" in extracted_text

    contact = ResumeParserService.extract_contact_info(extracted_text)
    assert contact["email"] == "jane.doe@example.com"

def test_pdf_generation_and_extraction(tmp_path):
    pdf_path = str(tmp_path / "test_resume.pdf")
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), "Alex Smith\nalex.smith@example.com\nSkills: React, TypeScript, Node.js, SQL\nExperience: Frontend Developer building web apps.")
    doc.save(pdf_path)
    doc.close()

    extracted_text = ResumeParserService.extract_text_from_pdf(pdf_path)
    assert "Alex Smith" in extracted_text
    assert "alex.smith@example.com" in extracted_text
    assert "React" in extracted_text

def test_unreadable_file_handling(tmp_path):
    empty_pdf = str(tmp_path / "empty.pdf")
    doc = fitz.open()
    doc.new_page()
    doc.save(empty_pdf)
    doc.close()

    with pytest.raises(Exception):
        ResumeParserService.extract_text_from_pdf(empty_pdf)

