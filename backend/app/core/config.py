"""TraumaSense AI - Core Application Settings

Loads and validates environment variables using Pydantic Settings.
Supports dual-mode database (Local SQLite vs Supabase PostgreSQL)
and Clerk Authentication parameters.
"""

from functools import lru_cache
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration and credentials loaded from environment."""

    # Project metadata
    PROJECT_NAME: str = "TraumaSense AI"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Server Configuration
    BACKEND_PORT: int = 8000
    FRONTEND_PORT: int = 3000
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

    # Database Configuration (Primary: Local SQLite; Remote: Supabase)
    USE_LOCAL_SQLITE: bool = Field(
        default=True,
        description="If True, boots immediately using local SQLite for zero latency. If False, connects to Supabase PostgreSQL with auto-fallback.",
    )
    SQLITE_URL: str = Field(
        default="sqlite:///./traumasense_local.db",
        description="Local SQLite connection string.",
    )
    SUPABASE_URL: str = Field(
        default="https://owwncervktxluajuzutq.supabase.co",
        description="Remote Supabase project URL.",
    )
    SUPABASE_KEY: str = Field(
        default="",
        description="Supabase anonymous public API key.",
    )
    SUPABASE_SERVICE_ROLE_KEY: str = Field(
        default="",
        description="Supabase service role secret key.",
    )
    DATABASE_URL: str = Field(
        default="",
        description="Supabase PostgreSQL connection URL.",
    )

    # Clerk Authentication Configuration
    CLERK_APP_ID: str = Field(
        default="app_3IVhah3CBQ6QZuu8GFl3EoQFPK6",
        description="Clerk Application ID.",
    )
    CLERK_SECRET_KEY: str = Field(
        default="sk_test_azZ2jOt33fanbHGI0atdo2sdKBLYiY1UIECBhyPNAx",
        description="Clerk Secret API Key.",
    )
    CLERK_PUBLISHABLE_KEY: str = Field(
        default="pk_test_cmVsYXRpdmUtbGlvbmVzcy00ODYwLmNsZXJrLmFjY291bnRzLmRldiQ",
        description="Clerk Publishable Key.",
    )
    CLERK_JWKS_URL: str = Field(
        default="https://relative-lioness-4860.clerk.accounts.dev/.well-known/jwks.json",
        description="Clerk JSON Web Key Set (JWKS) URL for RSA token verification.",
    )

    # AI / ML Model Settings
    WHISPER_MODEL_SIZE: str = Field(
        default="base",
        description="Whisper model size for medical audio transcription.",
    )
    DEVICE: str = Field(
        default="cpu",
        description="Inference target compute device (cpu / cuda).",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )


@lru_cache()
def get_settings() -> Settings:
    """Return cached instance of application settings."""
    return Settings()
