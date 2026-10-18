"""TraumaSense AI - Config Module Adapter."""

from app.core.config import Settings, get_settings

settings = get_settings()

__all__ = ["Settings", "get_settings", "settings"]
