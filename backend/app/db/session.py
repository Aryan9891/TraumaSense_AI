"""TraumaSense AI - Resilient Database Manager

Architected with Dual-Engine Resilience:
- Primary Engine: High-performance Local SQLite (zero-latency boot, offline-ready)
- Remote Engine: Supabase PostgreSQL (managed cloud database)
- Auto-Fallback: Automatically switches to Local SQLite if Supabase is unreachable,
  preventing application crash and maintaining 100% uptime.
"""

import logging
import time
from typing import Generator, Dict, Any, Optional
from sqlalchemy import create_engine, text, event
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.engine import Engine
from app.core.config import get_settings

logger = logging.getLogger("traumasense.db")
settings = get_settings()

Base = declarative_base()


class ResilientDatabaseManager:
    """Manages database connectivity with resilient automatic fallback."""

    def __init__(self):
        self._engine: Optional[Engine] = None
        self._session_factory: Optional[sessionmaker] = None
        self.active_engine_type: str = "unknown"
        self.fallback_active: bool = False
        self.fallback_reason: Optional[str] = None
        self.connected_url: str = ""
        self.initialize_engine()

    def _setup_sqlite_engine(self, url: str) -> Engine:
        """Create and optimize local SQLite engine with WAL mode for concurrency."""
        sqlite_engine = create_engine(
            url,
            connect_args={"check_same_thread": False},
        )

        @event.listens_for(sqlite_engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA synchronous=NORMAL")
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

        return sqlite_engine

    def _setup_postgres_engine(self, url: str) -> Engine:
        """Create Supabase PostgreSQL engine with connection pooling."""
        return create_engine(
            url,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
            pool_recycle=300,
            connect_args={"connect_timeout": 5},
        )

    def initialize_engine(self) -> None:
        """Initialize the primary database engine or activate resilient fallback."""
        current_settings = get_settings()
        if current_settings.USE_LOCAL_SQLITE:
            logger.info("Initializing Primary Local SQLite Database Engine...")
            try:
                self._engine = self._setup_sqlite_engine(current_settings.SQLITE_URL)
                # Verify SQLite connectivity
                with self._engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                self.active_engine_type = "sqlite"
                self.fallback_active = False
                self.fallback_reason = None
                self.connected_url = current_settings.SQLITE_URL
                logger.info(f"Local SQLite database engine active at: {current_settings.SQLITE_URL}")
            except Exception as e:
                logger.error(f"Failed to initialize local SQLite engine: {e}")
                raise e
        else:
            logger.info("Attempting Remote Supabase PostgreSQL Database Engine...")
            try:
                if not current_settings.DATABASE_URL:
                    raise ValueError("DATABASE_URL is not configured for remote database mode.")

                postgres_engine = self._setup_postgres_engine(current_settings.DATABASE_URL)
                # Test remote connectivity with a short ping
                with postgres_engine.connect() as conn:
                    conn.execute(text("SELECT 1"))

                self._engine = postgres_engine
                self.active_engine_type = "postgresql"
                self.fallback_active = False
                self.fallback_reason = None
                self.connected_url = current_settings.DATABASE_URL
                logger.info("Remote Supabase PostgreSQL connection verified and active.")

            except Exception as remote_err:
                # Resilient Fallback Trigger
                logger.warning(
                    f"[Resilience Alert] Remote Supabase connection failed: {remote_err}. "
                    "Initiating graceful automatic fallback to Local SQLite database engine."
                )
                self._engine = self._setup_sqlite_engine(current_settings.SQLITE_URL)
                with self._engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                self.active_engine_type = "sqlite"
                self.fallback_active = True
                self.fallback_reason = str(remote_err)
                self.connected_url = current_settings.SQLITE_URL
                logger.info("Automatic fallback to Local SQLite complete. Service operational.")

        self._session_factory = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self._engine,
        )

    @property
    def engine(self) -> Engine:
        if self._engine is None:
            self.initialize_engine()
        return self._engine

    @property
    def session_factory(self) -> sessionmaker:
        if self._session_factory is None:
            self.initialize_engine()
        return self._session_factory

    def get_status(self) -> Dict[str, Any]:
        """Check active engine health and return status telemetry."""
        current_settings = get_settings()
        status = {
            "configured_mode": "sqlite" if current_settings.USE_LOCAL_SQLITE else "supabase_postgres",
            "active_engine": self.active_engine_type,
            "fallback_active": self.fallback_active,
            "fallback_reason": self.fallback_reason,
            "healthy": False,
            "latency_ms": None,
        }
        try:
            start_time = time.perf_counter()
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            latency = (time.perf_counter() - start_time) * 1000
            status["healthy"] = True
            status["latency_ms"] = round(latency, 2)
        except Exception as ping_err:
            status["healthy"] = False
            status["error"] = str(ping_err)

        return status


# Global Database Manager Instance
db_manager = ResilientDatabaseManager()
engine = db_manager.engine
SessionLocal = db_manager.session_factory


def get_db() -> Generator[Session, None, None]:
    """FastAPI request dependency for database session lifecycle."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_db_status() -> Dict[str, Any]:
    """Retrieve runtime database telemetry and resilience status."""
    return db_manager.get_status()
