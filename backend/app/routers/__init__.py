"""TraumaSense AI - Routers Package."""

from app.routers.auth import router as auth_router
from app.routers.complaints import router as complaints_router
from app.routers.analytics import router as analytics_router
from app.routers.alerts import router as alerts_router

__all__ = [
    "auth_router",
    "complaints_router",
    "analytics_router",
    "alerts_router",
]
