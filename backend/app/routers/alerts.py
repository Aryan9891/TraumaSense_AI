"""TraumaSense AI - Emergency Alerts & Dispatch Router"""

import logging
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.core import Alert, AlertLevel, AlertStatus, Complaint, ComplaintStatus
from app.schemas.core import AlertDetailResponse, AlertResponse, AlertUpdate

logger = logging.getLogger("traumasense.router.alerts")
router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("", response_model=List[AlertDetailResponse])
def list_alerts(
    status: Optional[AlertStatus] = Query(None, description="Filter by alert status"),
    alert_level: Optional[AlertLevel] = Query(None, description="Filter by severity level"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Retrieve emergency dispatch alerts joined with parent complaint summary."""
    query = db.query(Alert)
    if status:
        query = query.filter(Alert.status == status)
    if alert_level:
        query = query.filter(Alert.alert_level == alert_level)

    return query.order_by(Alert.created_at.desc()).limit(limit).all()


@router.patch("/{alert_id}/acknowledge", response_model=AlertDetailResponse)
def acknowledge_alert(
    alert_id: str,
    update_in: AlertUpdate,
    db: Session = Depends(get_db),
):
    """Update alert status, record dispatch timestamp, and escalate complaint lifecycle."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with ID '{alert_id}' not found.",
        )

    alert.status = update_in.status
    alert.dispatched_at = update_in.dispatched_at or datetime.now(timezone.utc)

    # Sync parent complaint status
    if alert.complaint:
        if alert.status == AlertStatus.ACKNOWLEDGED:
            alert.complaint.status = ComplaintStatus.ESCALATED
        elif alert.status == AlertStatus.RESOLVED:
            alert.complaint.status = ComplaintStatus.RESOLVED

    db.commit()
    db.refresh(alert)

    logger.info(
        f"Alert '{alert.id}' updated to {alert.status.value}. "
        f"Parent complaint '{alert.complaint_id}' status set to {alert.complaint.status.value}."
    )
    return alert
