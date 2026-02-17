import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import risk, mental_health, history
from database import engine, Base

app = FastAPI(title="AI Crisis SaaS API")

# Configure CORS
origins = ["*"]  # In production, replace with actual frontend URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(risk.router, prefix="/api", tags=["Risk"])
app.include_router(mental_health.router, prefix="/api", tags=["Mental Health"])
app.include_router(history.router, prefix="/api", tags=["History"])

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/health")
def health_check():
    return {"status": "ok", "environment": os.getenv("ENV", "development")}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))