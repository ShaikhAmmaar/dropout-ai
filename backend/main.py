
import uvicorn
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from db.database import engine, Base
from routes import auth, students, risk, mental_health, admin

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database initialization with error handling
@app.on_event("startup")
async def init_db():
    logger.info("Starting up backend and initializing database connection...")
    try:
        async with engine.begin() as conn:
            # We don't log the full URL for security, but we log the attempt
            logger.info("Attempting to sync database tables...")
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables synced successfully.")
    except Exception as e:
        logger.error(f"CRITICAL: Database initialization failed: {e}")
        # We don't raise here to allow the app to stay alive for debugging/logs
        # but subsequent DB calls will fail.

# Router registration
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(students.router, prefix=f"{settings.API_V1_STR}/students", tags=["Students"])
app.include_router(risk.router, prefix=f"{settings.API_V1_STR}/risk", tags=["Risk Analysis"])
app.include_router(mental_health.router, prefix=f"{settings.API_V1_STR}/mental-health", tags=["Mental Health"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["Admin Analytics"])

@app.get("/")
async def root():
    return {
        "message": f"Welcome to the {settings.PROJECT_NAME} Backend API",
        "status": "online",
        "infrastructure": "Render + Supabase"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "check_logs"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
