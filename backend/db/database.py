
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from core.config import settings
import os
import logging

logger = logging.getLogger(__name__)

# Fetch the raw URL from environment or settings
raw_url = os.getenv("DATABASE_URL", settings.DATABASE_URL)

def get_async_url(url: str) -> str:
    """
    Ensures the connection string is compatible with asyncpg and 
    Supabase's port 6543 (PgBouncer).
    """
    if not url:
        return "sqlite+aiosqlite:///./dropout_fallback.db"
    
    # Standardize driver
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    # Fix for Supabase Pooled Connection (port 6543)
    if ":6543" in url:
        # asyncpg + pgbouncer (port 6543) requires specific params to work
        params = []
        if "sslmode" not in url:
            params.append("sslmode=require")
        # prepare_threshold=0 is critical for Transaction mode poolers
        if "prepare_threshold" not in url:
            params.append("prepare_threshold=0")
            
        if params:
            connector = "&" if "?" in url else "?"
            url += f"{connector}{'&'.join(params)}"
            
    return url

async_db_url = get_async_url(raw_url)

try:
    engine = create_async_engine(
        async_db_url,
        echo=False,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        pool_recycle=300 # Shorter recycle for better stability on shared hosting
    )
except Exception as e:
    logger.error(f"Failed to create engine: {e}")
    engine = create_async_engine("sqlite+aiosqlite:///./fatal_fallback.db")

AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
