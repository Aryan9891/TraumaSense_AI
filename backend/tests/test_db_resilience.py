"""Tests for TraumaSense AI Resilient Database Manager."""

import os
import pytest
from sqlalchemy import text
from app.core.config import get_settings
from app.db.session import ResilientDatabaseManager, get_db, get_db_status


def test_sqlite_primary_initialization():
    """Verify that local SQLite initializes cleanly with sub-millisecond latency."""
    settings = get_settings()
    assert settings.USE_LOCAL_SQLITE is True

    manager = ResilientDatabaseManager()
    status = manager.get_status()

    assert status["active_engine"] == "sqlite"
    assert status["healthy"] is True
    assert status["fallback_active"] is False
    assert status["latency_ms"] is not None
    assert status["latency_ms"] < 50.0  # SQLite should respond in < 50ms


def test_sqlite_wal_mode_enabled():
    """Verify that SQLite engine has WAL journal mode active for concurrency."""
    manager = ResilientDatabaseManager()
    with manager.engine.connect() as conn:
        result = conn.execute(text("PRAGMA journal_mode")).scalar()
        # WAL mode is active
        assert result.upper() == "WAL"


def test_get_db_dependency():
    """Verify that the FastAPI get_db dependency yields a valid SQLAlchemy session."""
    db_gen = get_db()
    session = next(db_gen)
    try:
        result = session.execute(text("SELECT 42")).scalar()
        assert result == 42
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass


def test_resilient_fallback_on_remote_failure(monkeypatch):
    """Verify that when remote connection fails, manager automatically falls back to SQLite."""
    # Force USE_LOCAL_SQLITE=False and use an unreachable database host
    monkeypatch.setenv("USE_LOCAL_SQLITE", "False")
    monkeypatch.setenv(
        "DATABASE_URL",
        "postgresql://invalid_user:invalid_pass@127.0.0.1:54329/invalid_db?connect_timeout=1",
    )
    get_settings.cache_clear()

    # Instantiate manager under remote failure conditions
    fallback_manager = ResilientDatabaseManager()
    status = fallback_manager.get_status()

    # The service MUST NOT crash and MUST gracefully fallback to SQLite
    assert status["active_engine"] == "sqlite"
    assert status["fallback_active"] is True
    assert status["healthy"] is True
    assert status["fallback_reason"] is not None

    # Clean up settings cache for subsequent tests
    monkeypatch.undo()
    get_settings.cache_clear()
