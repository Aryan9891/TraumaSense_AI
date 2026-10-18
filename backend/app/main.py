"""TraumaSense AI - Backend Application Entry Point

Step 1 Blueprint: Monorepo Workspace, Resilient Database (Supabase + Local SQLite Fallback),
and Clerk Authentication Configuration.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.db.session import get_db_status, db_manager
from app.core.security import get_clerk_auth_status

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)
logger = logging.getLogger("traumasense.main")
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager to verify database and auth connectivity on boot."""
    logger.info("==================================================")
    logger.info(f"Starting {settings.PROJECT_NAME} ({settings.ENVIRONMENT})")
    logger.info("Executing Step 1: Workspace, Resilient DB, Clerk Auth")
    logger.info("==================================================")

    # 1. Inspect Resilient Database Status
    db_telemetry = get_db_status()
    logger.info(
        f"Database Status: Active Engine = {db_telemetry['active_engine']}, "
        f"Fallback Active = {db_telemetry['fallback_active']}, "
        f"Healthy = {db_telemetry['healthy']}, Latency = {db_telemetry.get('latency_ms')}ms"
    )

    # 2. Inspect Clerk JWKS Reachability
    auth_telemetry = get_clerk_auth_status()
    logger.info(
        f"Clerk Auth Status: Configured = {auth_telemetry['configured']}, "
        f"JWKS Reachable = {auth_telemetry['reachable']}, "
        f"Keys Loaded = {auth_telemetry['keys_count']}"
    )

    yield

    logger.info(f"Shutting down {settings.PROJECT_NAME} gracefully.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="TraumaSense AI Platform Backend - Intelligent Trauma Assessment & Medical AI",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Step 3 Feature Routers under /api
from app.routers import (
    auth_router,
    complaints_router,
    analytics_router,
    alerts_router,
)

app.include_router(auth_router, prefix="/api")
app.include_router(complaints_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")


@app.get("/", tags=["Blueprint"])
async def root():
    """Root platform blueprint and Step 1 initialization status."""
    return {
        "platform": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "step_status": "Step 1 Initialized (Workspace, Resilient DB & Clerk Auth)",
        "ports": {
            "backend": settings.BACKEND_PORT,
            "frontend": settings.FRONTEND_PORT,
        },
        "docs_url": "/docs",
        "health_url": "/health",
        "auth_status_url": "/auth/status",
    }


@app.get("/health", tags=["Diagnostics"])
async def health_check():
    """System health check reporting database resilience, Clerk auth, and ML config."""
    db_info = get_db_status()
    clerk_info = get_clerk_auth_status()

    is_overall_healthy = db_info.get("healthy", False)

    return {
        "status": "ok" if is_overall_healthy else "degraded",
        "db_mode": db_info.get("active_engine", "sqlite"),
        "service": "traumasense-backend",
        "database": {
            "mode_configured": "local_sqlite" if settings.USE_LOCAL_SQLITE else "supabase_postgres",
            "active_engine": db_info.get("active_engine"),
            "fallback_active": db_info.get("fallback_active"),
            "fallback_reason": db_info.get("fallback_reason"),
            "healthy": db_info.get("healthy"),
            "latency_ms": db_info.get("latency_ms"),
        },
        "clerk_auth": {
            "configured": clerk_info.get("configured"),
            "jwks_reachable": clerk_info.get("reachable"),
            "jwks_latency_ms": clerk_info.get("latency_ms"),
            "active_keys_count": clerk_info.get("keys_count"),
            "key_ids": clerk_info.get("key_ids"),
            "app_id": clerk_info.get("app_id"),
        },
        "ml_runtime_config": {
            "whisper_model_size": settings.WHISPER_MODEL_SIZE,
            "target_device": settings.DEVICE,
        },
    }


@app.get("/auth/status", tags=["Diagnostics"])
async def auth_status():
    """Detailed Clerk authentication verification and JWKS endpoint status."""
    return get_clerk_auth_status()
