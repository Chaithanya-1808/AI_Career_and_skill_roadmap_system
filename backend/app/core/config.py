import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_DB_PATH = (BACKEND_DIR / "career_path.db").as_posix()

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Career & Smart Roadmap System"
    API_V1_STR: str = "/api"
    
    # Security & JWT
    SECRET_KEY: str = "ai-career-smart-roadmap-dev-secret-key-32chars-min-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:3000",
    ]
    
    # Database
    DATABASE_URL: str = f"sqlite:///{DEFAULT_DB_PATH}"
    
    # Supabase (Optional for local hybrid execution, required for cloud Supabase)
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    # AI Provider (Google Gemini)
    GEMINI_API_KEY: str = ""
    AI_MODEL: str = "gemini-2.5-flash"
    
    # Public Certificate Verification Base URL
    CERTIFICATE_VERIFICATION_BASE_URL: str = "http://localhost:5173/verify-certificate"
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

