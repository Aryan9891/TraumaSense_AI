"""TraumaSense AI - Authentication Module Adapter."""

from app.core.security import (
    ClerkAuthVerifier,
    clerk_verifier,
    verify_clerk_token,
    get_clerk_auth_status,
    require_clerk_auth,
    optional_clerk_auth,
)

__all__ = [
    "ClerkAuthVerifier",
    "clerk_verifier",
    "verify_clerk_token",
    "get_clerk_auth_status",
    "require_clerk_auth",
    "optional_clerk_auth",
]
