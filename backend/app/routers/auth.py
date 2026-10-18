"""TraumaSense AI - Authentication & User Sync Router"""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.core import User, UserRole
from app.schemas.core import UserCreate, UserResponse
from app.core.security import optional_clerk_auth

logger = logging.getLogger("traumasense.router.auth")
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/sync", response_model=UserResponse, status_code=status.HTTP_200_OK)
def sync_clerk_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """Sync or provision a user from Clerk authentication credentials."""
    user = db.query(User).filter(User.clerk_id == user_in.clerk_id).first()
    if user:
        user.email = user_in.email
        user.role = user_in.role
        db.commit()
        db.refresh(user)
        logger.info(f"User synced: {user.email} (Role: {user.role.value})")
        return user

    new_user = User(
        clerk_id=user_in.clerk_id,
        email=user_in.email,
        role=user_in.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    logger.info(f"New user provisioned: {new_user.email} (Role: {new_user.role.value})")
    return new_user


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    auth_payload: Optional[dict] = Depends(optional_clerk_auth),
    db: Session = Depends(get_db),
):
    """Retrieve profile of currently authenticated user (with graceful fallback)."""
    if auth_payload and "sub" in auth_payload:
        user = db.query(User).filter(User.clerk_id == auth_payload["sub"]).first()
        if user:
            return user

    # Graceful fallback to default seed user for local development/testing
    fallback_user = db.query(User).filter(User.clerk_id == "clerk_victim_001").first()
    if not fallback_user:
        fallback_user = db.query(User).first()

    if not fallback_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No user accounts provisioned in database.",
        )
    return fallback_user
