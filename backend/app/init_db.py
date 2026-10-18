"""TraumaSense AI - Resilient Database & Storage Initializer

Provisions:
1. All 9 relational database tables across SQLite or Supabase PostgreSQL
2. Local audio storage directory at backend/uploads/audio/
3. Non-blocking attempt to configure remote Supabase 'traumasense-audio' bucket
"""

import os
import logging
from pathlib import Path
from typing import Dict, Any
import httpx
from sqlalchemy import inspect
from app.core.config import get_settings
from app.db.session import Base, engine
# Import all models to ensure metadata registration
import app.models.core  # noqa: F401

logger = logging.getLogger("traumasense.init_db")
settings = get_settings()

BASE_DIR = Path(__file__).resolve().parent.parent
LOCAL_AUDIO_DIR = BASE_DIR / "uploads" / "audio"


def provision_tables() -> list[str]:
    """Execute DDL to create all tables defined in SQLAlchemy Base.metadata."""
    logger.info("Provisioning relational tables via Base.metadata.create_all...")
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    logger.info(f"Successfully verified tables in database: {tables}")
    return tables


def provision_local_storage() -> str:
    """Ensure local fallback audio storage directory exists."""
    os.makedirs(LOCAL_AUDIO_DIR, exist_ok=True)
    logger.info(f"Local audio directory verified at: {LOCAL_AUDIO_DIR}")
    return str(LOCAL_AUDIO_DIR)


def provision_supabase_storage() -> Dict[str, Any]:
    """Attempt non-blocking creation/verification of private 'traumasense-audio' bucket."""
    result = {
        "bucket_name": "traumasense-audio",
        "attempted": False,
        "success": False,
        "detail": None,
    }

    if not settings.SUPABASE_URL or not (settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY):
        result["detail"] = "Supabase credentials not configured; skipping remote storage provisioning."
        logger.info(result["detail"])
        return result

    result["attempted"] = True
    storage_api_url = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/bucket"
    auth_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    headers = {
        "apikey": auth_key,
        "Authorization": f"Bearer {auth_key}",
        "Content-Type": "application/json",
    }

    try:
        with httpx.Client(timeout=3.0) as client:
            # Check existing buckets
            list_resp = client.get(storage_api_url, headers=headers)
            if list_resp.status_code == 200:
                buckets = list_resp.json()
                bucket_names = [b.get("id") or b.get("name") for b in buckets if isinstance(b, dict)]
                if "traumasense-audio" in bucket_names:
                    result["success"] = True
                    result["detail"] = "Bucket 'traumasense-audio' already exists in Supabase storage."
                    logger.info(result["detail"])
                    return result

            # Create private bucket if not found
            create_resp = client.post(
                storage_api_url,
                headers=headers,
                json={"id": "traumasense-audio", "name": "traumasense-audio", "public": False},
            )
            if create_resp.status_code in (200, 201):
                result["success"] = True
                result["detail"] = "Created private bucket 'traumasense-audio' in Supabase storage."
                logger.info(result["detail"])
            else:
                result["detail"] = f"Supabase responded HTTP {create_resp.status_code}: {create_resp.text}"
                logger.warning(f"Remote storage notice: {result['detail']}")

    except Exception as exc:
        result["detail"] = f"Remote storage non-blocking notice: {str(exc)}"
        logger.warning(
            f"[Resilience Notice] Could not reach remote Supabase storage: {exc}. "
            "Local audio directory will serve as primary audio storage."
        )

    return result


def init_database() -> Dict[str, Any]:
    """Master entry point to initialize database tables and storage."""
    logger.info("Starting TraumaSense AI Step 2 Database & Storage Initialization...")
    tables = provision_tables()
    storage_dir = provision_local_storage()
    supabase_storage = provision_supabase_storage()

    summary = {
        "status": "ready",
        "tables": tables,
        "table_count": len(tables),
        "local_storage_path": storage_dir,
        "supabase_storage": supabase_storage,
    }
    logger.info(f"Initialization complete. Total tables: {len(tables)}. Storage: {storage_dir}")
    return summary


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_database()
