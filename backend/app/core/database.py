"""
Database Connection and Session Management
Async SQLAlchemy setup with connection pooling and session management
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional

from sqlalchemy import MetaData, event, text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    AsyncEngine,
    create_async_engine,
    async_sessionmaker
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.pool import NullPool, AsyncAdaptedQueuePool
from sqlalchemy.engine import Engine
import asyncpg

from app.core.config import settings

logger = logging.getLogger(__name__)

# Database metadata and base
metadata = MetaData()
Base = declarative_base(metadata=metadata)

# Global engine and session factory
engine: Optional[AsyncEngine] = None
AsyncSessionLocal: Optional[async_sessionmaker] = None


def create_engine() -> AsyncEngine:
    """Create async database engine with proper configuration"""
    
    # Connection pool configuration
    pool_class = AsyncAdaptedQueuePool if not settings.DATABASE_URL.startswith("sqlite") else NullPool
    
    # Engine configuration
    engine_config = {
        "echo": settings.DATABASE_ECHO,
        "future": True,
        "pool_pre_ping": True,
    }
    
    # Add pool configuration for non-SQLite databases
    if pool_class == AsyncAdaptedQueuePool:
        engine_config.update({
            "poolclass": pool_class,
            "pool_size": settings.DATABASE_POOL_SIZE,
            "max_overflow": settings.DATABASE_MAX_OVERFLOW,
            "pool_recycle": 3600,  # Recycle connections every hour
            "pool_timeout": 30,
        })
    else:
        engine_config["poolclass"] = pool_class
    
    return create_async_engine(
        settings.get_database_url(),
        **engine_config
    )


async def init_db() -> None:
    """Initialize database connection and create tables if needed"""
    global engine, AsyncSessionLocal
    
    try:
        # Create engine
        engine = create_engine()
        
        # Test connection
        async with engine.begin() as conn:
            # Test basic connectivity
            await conn.execute(text("SELECT 1"))
            logger.info("Database connection established successfully")
        
        # Create session factory
        AsyncSessionLocal = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            autocommit=False,
            autoflush=False,
            expire_on_commit=False
        )
        
        logger.info("Database initialization completed")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")
        raise


async def close_db_connections() -> None:
    """Close all database connections"""
    global engine
    
    if engine:
        await engine.dispose()
        logger.info("Database connections closed")


@asynccontextmanager
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get database session context manager"""
    if not AsyncSessionLocal:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error(f"Database session error: {str(e)}")
            raise
        finally:
            await session.close()


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency function for FastAPI to inject database sessions"""
    async with get_db() as session:
        yield session


# Database event listeners for logging and monitoring
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Set SQLite pragmas for better performance (if using SQLite)"""
    if "sqlite" in str(dbapi_connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA cache_size=1000")
        cursor.execute("PRAGMA temp_store=MEMORY")
        cursor.close()


# Connection health check
async def check_database_health() -> bool:
    """Check if database is accessible and healthy"""
    try:
        async with get_db() as session:
            result = await session.execute("SELECT 1")
            return result.scalar() == 1
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        return False


# Database utilities
class DatabaseManager:
    """Database management utilities"""
    
    @staticmethod
    async def create_all_tables():
        """Create all database tables"""
        if not engine:
            raise RuntimeError("Database engine not initialized")
        
        async with engine.begin() as conn:
            # Import all models to ensure they're registered
            from app.models import database_models  # noqa
            
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
            logger.info("All database tables created")
    
    @staticmethod
    async def drop_all_tables():
        """Drop all database tables (use with caution!)"""
        if not engine:
            raise RuntimeError("Database engine not initialized")
        
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            logger.warning("All database tables dropped")
    
    @staticmethod
    async def get_table_info():
        """Get information about database tables"""
        if not engine:
            raise RuntimeError("Database engine not initialized")
        
        async with get_db() as session:
            # Get table names
            if "postgresql" in settings.DATABASE_URL:
                result = await session.execute("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                """)
            else:
                result = await session.execute("""
                    SELECT name FROM sqlite_master 
                    WHERE type='table'
                """)
            
            tables = [row[0] for row in result.fetchall()]
            return {"tables": tables, "count": len(tables)}
    
    @staticmethod
    async def vacuum_database():
        """Vacuum database to reclaim space (SQLite only)"""
        if "sqlite" in settings.DATABASE_URL:
            async with engine.begin() as conn:
                await conn.execute("VACUUM")
                logger.info("Database vacuumed")


# Transaction management utilities
@asynccontextmanager
async def database_transaction():
    """Context manager for database transactions with automatic rollback on error"""
    async with get_db() as session:
        transaction = await session.begin()
        try:
            yield session
            await transaction.commit()
        except Exception as e:
            await transaction.rollback()
            logger.error(f"Transaction rolled back due to error: {str(e)}")
            raise


# Connection pooling monitoring
class ConnectionPoolMonitor:
    """Monitor database connection pool health"""
    
    @staticmethod
    def get_pool_status():
        """Get current connection pool status"""
        if not engine or not hasattr(engine.pool, 'status'):
            return {"status": "unavailable"}
        
        pool = engine.pool
        return {
            "pool_size": pool.size(),
            "checked_in": pool.checkedin(),
            "checked_out": pool.checkedout(),
            "invalid": pool.invalid(),
            "total": pool.size() + pool.checkedout(),
        }
    
    @staticmethod
    async def test_connection_performance():
        """Test database connection performance"""
        import time
        
        start_time = time.time()
        try:
            async with get_db() as session:
                await session.execute("SELECT 1")
            
            end_time = time.time()
            return {
                "success": True,
                "response_time_ms": (end_time - start_time) * 1000,
                "status": "healthy"
            }
        except Exception as e:
            end_time = time.time()
            return {
                "success": False,
                "response_time_ms": (end_time - start_time) * 1000,
                "status": "unhealthy",
                "error": str(e)
            }


# Export main components
__all__ = [
    "Base",
    "engine", 
    "AsyncSessionLocal",
    "init_db",
    "close_db_connections",
    "get_db",
    "get_db_session",
    "check_database_health",
    "DatabaseManager",
    "database_transaction",
    "ConnectionPoolMonitor"
]
