
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import risk, mental_health, history
from database import engine, Base

app = FastAPI(
    title="AI Crisis SaaS API",
    description="Backend API for AI-Based Dropout Prediction & Mental Health Risk Detection",
    version="1.0.0"
)

# Configure CORS
# In production, specify actual frontend origins for better security
origins = ["*"] 
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes registration
app.include_router(risk.router, prefix="/api", tags=["Risk"])
app.include_router(mental_health.router, prefix="/api", tags=["Mental Health"])
app.include_router(history.router, prefix="/api", tags=["History"])

@app.get("/")
def root():
    """Root endpoint to verify the API is running."""
    return {
        "message": "Dropout AI Backend is Running 🚀",
        "documentation": "/docs",
        "redoc": "/redoc",
        "health": "/health",
        "status": "online"
    }

@app.on_event("startup")
async def startup():
    """Ensure database tables are created on startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/health")
def health_check():
    """Simple health check endpoint."""
    return {
        "status": "ok", 
        "environment": os.getenv("ENV", "development"),
        "timestamp": os.getenv("RENDER_EXTERNAL_URL", "local")
    }

if __name__ == "__main__":
    import uvicorn
    # Use environment port or default to 8000
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
