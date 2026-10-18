"""Tests for TraumaSense AI Clerk Authentication Configuration."""

import pytest
from fastapi import HTTPException
from app.core.config import get_settings
from app.core.security import (
    clerk_verifier,
    verify_clerk_token,
    get_clerk_auth_status,
)


def test_clerk_settings_loaded():
    """Verify that all Clerk environment variables are correctly populated."""
    settings = get_settings()
    assert settings.CLERK_APP_ID.startswith("app_")
    assert settings.CLERK_SECRET_KEY.startswith("sk_test_")
    assert settings.CLERK_PUBLISHABLE_KEY.startswith("pk_test_")
    assert "jwks.json" in settings.CLERK_JWKS_URL


def test_clerk_jwks_connectivity():
    """Verify that Clerk's live JWKS endpoint is reachable and exposes valid RSA signing keys."""
    status = get_clerk_auth_status()
    assert status["configured"] is True
    assert status["reachable"] is True
    assert status["keys_count"] >= 1
    assert len(status["key_ids"]) >= 1


def test_invalid_token_rejection():
    """Verify that a malformed or forged token raises HTTP 401 Unauthorized."""
    bogus_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.boguspayload.bogussignature"
    with pytest.raises(HTTPException) as exc_info:
        verify_clerk_token(bogus_token)

    assert exc_info.value.status_code == 401
    assert "Invalid authentication token" in exc_info.value.detail
