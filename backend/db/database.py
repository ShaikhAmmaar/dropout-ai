
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from core.config import settings
import os

# Robust DATABASE_URL handling for Supabase + asyncpg
db_url = os.getenv("DATABASE_URL", settings.DATABASE_URL)

if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)

# Ensure Supabase connections use SSL if not specified
if "sslmode" not in db_url and "sqlite" not in db_url:
    separator = "&" if "?" in db_url else "?"
    db_url += f"{separator}sslmode=require"

engine = create_async_engine(
    db_url, 
    echo=False,
    pool_pre_ping=True,  # Important for Render to detect dropped connections
    pool_recycle=300
)

AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
