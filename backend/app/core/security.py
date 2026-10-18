"""TraumaSense AI - Clerk Authentication Configuration & Verifier

Handles RS256 JWT cryptographic verification using Clerk's JWKS
(JSON Web Key Sets), token decoding, claims extraction, and FastAPI
security dependencies.
"""

import logging
import time
from typing import Optional, Dict, Any
import httpx
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import get_settings

logger = logging.getLogger("traumasense.auth")
settings = get_settings()

bearer_security = HTTPBearer(auto_error=False)


class ClerkAuthVerifier:
    """Cryptographic verifier for Clerk JWT tokens using public JWKS keys."""

    def __init__(self):
        self.jwks_url = settings.CLERK_JWKS_URL
        self.app_id = settings.CLERK_APP_ID
        self.publishable_key = settings.CLERK_PUBLISHABLE_KEY
        self.secret_key = settings.CLERK_SECRET_KEY
        self._jwks_client: Optional[jwt.PyJWKClient] = None
        self._initialize_jwks_client()

    def _initialize_jwks_client(self) -> None:
        """Instantiate the cached PyJWKClient."""
        if self.jwks_url:
            try:
                self._jwks_client = jwt.PyJWKClient(
                    self.jwks_url,
                    cache_keys=True,
                    max_cached_keys=16,
                    cache_jwk_set=True,
                    lifespan=3600,
                )
                logger.info(f"Clerk JWKS Client initialized for URL: {self.jwks_url}")
            except Exception as e:
                logger.error(f"Failed to initialize PyJWKClient: {e}")
                self._jwks_client = None

    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify Clerk JWT signature and decode claims."""
        if not self._jwks_client:
            self._initialize_jwks_client()
            if not self._jwks_client:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Clerk JWKS verification service is unavailable.",
                )

        try:
            signing_key = self._jwks_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                options={
                    "verify_signature": True,
                    "verify_exp": True,
                    "verify_iat": True,
                },
            )
            return payload

        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token has expired.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.PyJWTError as e:
            logger.warning(f"Invalid Clerk token presented: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid authentication token: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )

    def check_jwks_connectivity(self) -> Dict[str, Any]:
        """Probe the Clerk JWKS endpoint to verify network availability and key presence."""
        result = {
            "jwks_url": self.jwks_url,
            "configured": bool(self.jwks_url and self.publishable_key),
            "app_id": self.app_id,
            "publishable_key_prefix": self.publishable_key[:12] + "..." if self.publishable_key else None,
            "reachable": False,
            "latency_ms": None,
            "keys_count": 0,
            "key_ids": [],
        }

        if not self.jwks_url:
            result["error"] = "CLERK_JWKS_URL is not set."
            return result

        try:
            start_time = time.perf_counter()
            with httpx.Client(timeout=4.0) as client:
                response = client.get(self.jwks_url)
            latency = (time.perf_counter() - start_time) * 1000

            if response.status_code == 200:
                data = response.json()
                keys = data.get("keys", [])
                result["reachable"] = True
                result["latency_ms"] = round(latency, 2)
                result["keys_count"] = len(keys)
                result["key_ids"] = [k.get("kid") for k in keys if "kid" in k]
            else:
                result["reachable"] = False
                result["status_code"] = response.status_code
        except Exception as e:
            result["reachable"] = False
            result["error"] = str(e)

        return result


# Global Clerk Authenticator instance
clerk_verifier = ClerkAuthVerifier()


def verify_clerk_token(token: str) -> Dict[str, Any]:
    """Helper to verify a Clerk JWT token."""
    return clerk_verifier.verify_token(token)


def get_clerk_auth_status() -> Dict[str, Any]:
    """Diagnostic status for Clerk configuration and JWKS connectivity."""
    return clerk_verifier.check_jwks_connectivity()


def require_clerk_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_security),
) -> Dict[str, Any]:
    """FastAPI route dependency requiring valid Clerk Bearer authentication."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Bearer authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return verify_clerk_token(credentials.credentials)


def optional_clerk_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_security),
) -> Optional[Dict[str, Any]]:
    """FastAPI route dependency allowing optional Clerk Bearer authentication."""
    if not credentials or not credentials.credentials:
        return None
    try:
        return verify_clerk_token(credentials.credentials)
    except HTTPException:
        return None
