import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from db.database import engine, Base
from routes import auth, students, risk, mental_health, admin

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database initialization
@app.on_event("startup")
async def init_db():
    async with engine.begin() as conn:
        # Create all tables if they don't exist
        await conn.run_sync(Base.metadata.create_all)

# Router registration
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(students.router, prefix=f"{settings.API_V1_STR}/students", tags=["Students"])
app.include_router(risk.router, prefix=f"{settings.API_V1_STR}/risk", tags=["Risk Analysis"])
app.include_router(mental_health.router, prefix=f"{settings.API_V1_STR}/mental-health", tags=["Mental Health"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["Admin Analytics"])

@app.get("/")
async def root():
    return {
        "message": f"Welcome to the {settings.PROJECT_NAME} Backend API 🚀",
        "docs": "/docs",
        "status": "online"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)