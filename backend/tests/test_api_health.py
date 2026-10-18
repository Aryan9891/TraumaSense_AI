"""Tests for TraumaSense AI Health & Diagnostics Endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    """Verify that root endpoint returns platform blueprint metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "TraumaSense AI"
    assert "Step 1 Initialized" in data["step_status"]
    assert data["ports"]["backend"] == 8000
    assert data["ports"]["frontend"] == 3000


def test_health_endpoint():
    """Verify system health check endpoint reports database and auth statuses."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["ok", "healthy"]
    assert data["db_mode"] == "sqlite"
    assert data["service"] == "traumasense-backend"

    # Database telemetry verification
    assert data["database"]["healthy"] is True
    assert data["database"]["active_engine"] in ["sqlite", "postgresql"]

    # Clerk Auth telemetry verification
    assert data["clerk_auth"]["configured"] is True
    assert data["clerk_auth"]["jwks_reachable"] is True

    # ML Config verification
    assert data["ml_runtime_config"]["whisper_model_size"] == "base"
    assert data["ml_runtime_config"]["target_device"] == "cpu"


def test_auth_status_endpoint():
    """Verify detailed Clerk auth status endpoint."""
    response = client.get("/auth/status")
    assert response.status_code == 200
    data = response.json()
    assert data["configured"] is True
    assert data["reachable"] is True
    assert data["keys_count"] >= 1
