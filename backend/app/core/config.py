import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "CareerTwin AI"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-careertwin-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database: SQLite fallback by default, or PostgreSQL if configured
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/careertwin.db")
    
    # Uploads
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", str(BASE_DIR / "uploads"))
    MAX_UPLOAD_SIZE_MB: int = 10
    
    # ML settings
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    USE_GPU: bool = False
    SIMILARITY_THRESHOLD: float = 0.75
    
    # Scoring weights
    WEIGHT_REQUIRED_SKILLS: float = 0.65
    WEIGHT_PREFERRED_SKILLS: float = 0.15
    WEIGHT_PROJECT_EXPERIENCE: float = 0.15
    WEIGHT_ROLE_RELEVANCE: float = 0.05

    # Google OAuth 2.0 Settings
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8001/api/auth/google/callback")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

