"""TraumaSense AI - Clinical & Operational Analytics Router"""

import logging
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.core import (
    Complaint,
    ComplaintStatus,
    RiskScore,
    RiskCategory,
    EmotionAnalysis,
    Alert,
    AlertLevel,
    AlertStatus,
)
from app.schemas.core import DashboardAnalyticsResponse

logger = logging.getLogger("traumasense.router.analytics")
router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=DashboardAnalyticsResponse)
def get_dashboard_analytics(db: Session = Depends(get_db)):
    """Compute real-time operational and clinical trauma analytics from the database."""
    total_complaints = db.query(Complaint).count()

    active_cases = (
        db.query(Complaint)
        .filter(Complaint.status != ComplaintStatus.RESOLVED)
        .count()
    )

    open_alerts_count = (
        db.query(Alert)
        .filter(Alert.status == AlertStatus.OPEN)
        .count()
    )

    high_risk_alerts = (
        db.query(Alert)
        .filter(Alert.alert_level == AlertLevel.HIGH)
        .count()
    )

    critical_risk_alerts = (
        db.query(Alert)
        .filter(Alert.alert_level == AlertLevel.CRITICAL)
        .count()
    )

    avg_svi_row = db.query(func.avg(RiskScore.svi_score)).scalar()
    average_svi_score = round(float(avg_svi_row), 1) if avg_svi_row else 0.0

    # Risk Distribution
    risk_distribution = {cat.value: 0 for cat in RiskCategory}
    risk_rows = (
        db.query(RiskScore.risk_category, func.count(RiskScore.id))
        .group_by(RiskScore.risk_category)
        .all()
    )
    for cat, count in risk_rows:
        val = cat.value if hasattr(cat, "value") else str(cat)
        risk_distribution[val] = count

    # State Distribution
    state_distribution: dict[str, int] = defaultdict(int)
    state_rows = (
        db.query(Complaint.state_location, func.count(Complaint.id))
        .group_by(Complaint.state_location)
        .all()
    )
    for state, count in state_rows:
        state_distribution[state] = count

    # Status Distribution
    status_distribution = {stat.value: 0 for stat in ComplaintStatus}
    status_rows = (
        db.query(Complaint.status, func.count(Complaint.id))
        .group_by(Complaint.status)
        .all()
    )
    for stat, count in status_rows:
        val = stat.value if hasattr(stat, "value") else str(stat)
        status_distribution[val] = count

    # Emotion Distribution (Averages across recorded complaints)
    emotion_distribution = {
        "fear": 0.0,
        "anger": 0.0,
        "sadness": 0.0,
        "panic": 0.0,
        "anxiety": 0.0,
        "neutral": 0.0,
    }
    emotion_averages = db.query(
        func.avg(EmotionAnalysis.fear),
        func.avg(EmotionAnalysis.anger),
        func.avg(EmotionAnalysis.sadness),
        func.avg(EmotionAnalysis.panic),
        func.avg(EmotionAnalysis.anxiety),
        func.avg(EmotionAnalysis.neutral),
    ).first()

    if emotion_averages and any(emotion_averages):
        emotion_distribution["fear"] = round(float(emotion_averages[0] or 0.0), 3)
        emotion_distribution["anger"] = round(float(emotion_averages[1] or 0.0), 3)
        emotion_distribution["sadness"] = round(float(emotion_averages[2] or 0.0), 3)
        emotion_distribution["panic"] = round(float(emotion_averages[3] or 0.0), 3)
        emotion_distribution["anxiety"] = round(float(emotion_averages[4] or 0.0), 3)
        emotion_distribution["neutral"] = round(float(emotion_averages[5] or 0.0), 3)

    # Complaint Trends
    trends = []
    trend_rows = (
        db.query(
            func.date(Complaint.created_at).label("day"),
            func.count(Complaint.id).label("count"),
        )
        .group_by(func.date(Complaint.created_at))
        .order_by(func.date(Complaint.created_at).asc())
        .limit(30)
        .all()
    )
    for day, count in trend_rows:
        trends.append({"date": str(day), "count": count})

    return DashboardAnalyticsResponse(
        total_complaints=total_complaints,
        active_cases=active_cases,
        high_risk_alerts=high_risk_alerts,
        critical_risk_alerts=critical_risk_alerts,
        open_alerts_count=open_alerts_count,
        average_svi_score=average_svi_score,
        state_wise_stats=dict(state_distribution),
        state_distribution=dict(state_distribution),
        risk_distribution=risk_distribution,
        emotion_distribution=emotion_distribution,
        status_distribution=status_distribution,
        complaint_trends=trends,
    )
