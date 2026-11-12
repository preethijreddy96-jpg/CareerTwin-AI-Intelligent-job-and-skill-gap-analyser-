import re
import os
from typing import Dict, Any, List, Optional
import fitz  # PyMuPDF
from docx import Document
import spacy
from fastapi import HTTPException, UploadFile
from app.core.config import settings

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = None

class ResumeParserService:
    @staticmethod
    def validate_file(file: UploadFile):
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in [".pdf", ".docx"]:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type '{ext}'. Only PDF (.pdf) and Word documents (.docx) are supported."
            )

    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        try:
            doc = fitz.open(file_path)
            text_parts = []
            for page in doc:
                text_parts.append(page.get_text("text"))
            doc.close()
            text = "\n".join(text_parts).strip()
            
            # Check for scanned / unreadable PDF
            if len(text) < 50:
                raise HTTPException(
                    status_code=422,
                    detail="The uploaded PDF contains insufficient extractable text. It may be scanned, image-only, or corrupted. Please upload a selectable text-based PDF or DOCX file."
                )
            return text
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=422,
                detail=f"Error reading PDF file: {str(e)}. Please check if the file is valid and password-free."
            )

    @staticmethod
    def extract_text_from_docx(file_path: str) -> str:
        try:
            doc = Document(file_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        if cell.text.strip():
                            paragraphs.append(cell.text.strip())
            text = "\n".join(paragraphs).strip()
            if len(text) < 50:
                raise HTTPException(
                    status_code=422,
                    detail="The uploaded DOCX file contains insufficient extractable text. Please ensure it contains readable text."
                )
            return text
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=422,
                detail=f"Error reading DOCX file: {str(e)}."
            )

    @staticmethod
    def clean_text(text: str) -> str:
        # Normalize whitespace and control characters
        cleaned = re.sub(r'[\r\f\v]', '\n', text)
        cleaned = re.sub(r'\t+', ' ', cleaned)
        cleaned = re.sub(r' +', ' ', cleaned)
        cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
        return cleaned.strip()

    @staticmethod
    def extract_contact_info(text: str) -> Dict[str, Optional[str]]:
        email = None
        phone = None
        name = None

        # Email regex
        email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
        if email_match:
            email = email_match.group(0).strip()

        # Phone regex (Indian & International formats)
        phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}', text)
        if phone_match:
            phone_str = phone_match.group(0).strip()
            if len(re.sub(r'\D', '', phone_str)) >= 9:
                phone = phone_str

        # Name extraction via spaCy NER and header lines
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        if lines:
            # First non-empty line often contains the candidate's name
            first_few = " \n ".join(lines[:3])
            if nlp:
                doc = nlp(first_few)
                for ent in doc.ents:
                    if ent.label_ == "PERSON" and len(ent.text.split()) <= 4:
                        name = ent.text.strip()
                        break
            if not name:
                candidate_line = lines[0]
                if len(candidate_line.split()) <= 4 and not re.search(r'resume|curriculum|vitae|email|phone', candidate_line, re.IGNORECASE):
                    name = candidate_line

        return {
            "name": name or "Candidate",
            "email": email,
            "phone": phone
        }

    @classmethod
    def segment_resume(cls, text: str) -> Dict[str, Any]:
        """Segments text into Education, Experience, Projects, and Skills sections."""
        sections = {
            "education": [],
            "experience": [],
            "projects": [],
            "raw_sections": {}
        }

        # Common headers
        section_patterns = {
            "education": r'(?:education|academic qualifications|academic background|degrees)',
            "experience": r'(?:work experience|professional experience|employment history|experience|internships)',
            "projects": r'(?:projects|academic projects|technical projects|key projects)',
            "skills": r'(?:skills|technical skills|technologies|core competencies|areas of expertise)'
        }

        lines = text.split('\n')
        current_section = None
        section_buffers = {"education": [], "experience": [], "projects": [], "skills": [], "other": []}

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue

            matched_sec = None
            for sec_name, pattern in section_patterns.items():
                if re.match(rf'^{pattern}\b', stripped, re.IGNORECASE) and len(stripped.split()) <= 5:
                    matched_sec = sec_name
                    break

            if matched_sec:
                current_section = matched_sec
            elif current_section:
                section_buffers[current_section].append(stripped)
            else:
                section_buffers["other"].append(stripped)

        # Build structured summaries
        if section_buffers["education"]:
            sections["education"] = [
                {"degree": line} for line in section_buffers["education"][:5]
            ]
        
        if section_buffers["experience"]:
            sections["experience"] = [
                {"details": line} for line in section_buffers["experience"][:8]
            ]

        if section_buffers["projects"]:
            sections["projects"] = [
                {"title": line} for line in section_buffers["projects"][:6]
            ]

        sections["raw_sections"] = {k: "\n".join(v) for k, v in section_buffers.items()}
        return sections

