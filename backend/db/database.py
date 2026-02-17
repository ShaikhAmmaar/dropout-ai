
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from core.config import settings
import os
import logging

logger = logging.getLogger(__name__)

# Fetch the raw URL from environment or settings
raw_url = os.getenv("DATABASE_URL", settings.DATABASE_URL)

def get_async_url(url: str) -> str:
    """Converts standard postgres URLs to asyncpg compatible ones."""
    if not url:
        return "sqlite+aiosqlite:///./dropout_fallback.db"
    
    # Replace the driver
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    # Handle Supabase-specific pooling issues (port 6543)
    # If using the pooler, asyncpg needs sslmode=require and sometimes pgbouncer=true
    if "pooler.supabase.com" in url or ":6543" in url:
        if "sslmode" not in url:
            connector = "&" if "?" in url else "?"
            url += f"{connector}sslmode=require"
            
    return url

async_db_url = get_async_url(raw_url)

try:
    engine = create_async_engine(
        async_db_url,
        echo=False,
        pool_pre_ping=True,  # Check connection validity before using
        pool_size=5,
        max_overflow=10,
        pool_timeout=30,
        pool_recycle=1800
    )
except Exception as e:
    logger.error(f"Failed to create engine: {e}")
    # Last resort fallback to local sqlite so the app doesn't crash on boot
    engine = create_async_engine("sqlite+aiosqlite:///./fatal_fallback.db")

AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
