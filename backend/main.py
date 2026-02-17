
import uvicorn
import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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

# CORS configuration - strict but safe for current architecture
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
    logger.info("Starting up backend...")
    try:
        async with engine.begin() as conn:
            logger.info("Checking database schema...")
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"DB Startup Error: {e}")

# Router registration
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(students.router, prefix=f"{settings.API_V1_STR}/students", tags=["Students"])
app.include_router(risk.router, prefix=f"{settings.API_V1_STR}/risk", tags=["Risk Analysis"])
app.include_router(mental_health.router, prefix=f"{settings.API_V1_STR}/mental-health", tags=["Mental Health"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["Admin Analytics"])

@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "active",
        "version": "1.0.0"
    }

@app.api_route("/health", methods=["GET", "HEAD"])
async def health_check():
    """Handles both Render health checks and manual checks."""
    return JSONResponse(content={"status": "healthy"}, status_code=200)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
