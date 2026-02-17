
import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load local .env if it exists
load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Dropout & Crisis Monitor"
    API_V1_STR: str = "/api/v1"
    
    # Render + Supabase Environment
    # Render provides 'JWT_SECRET' and 'DATABASE_URL'
    SECRET_KEY: str = os.getenv("JWT_SECRET", "super-secret-key-for-triage-ai-2024")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    
    # DATABASE_URL from Supabase
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./dropout_ai.db")
    
    # Google Gemini API Key from Render Environment
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    class Config:
        case_sensitive = True

settings = Settings()
