"""TraumaSense AI - Core Pydantic v2 Schemas

All ORM-backed schemas leverage model_config = ConfigDict(from_attributes=True)
for bidirectional serialization with SQLAlchemy models.
"""

from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, Field, ConfigDict
from app.models.core import (
    UserRole,
    ComplaintStatus,
    RiskCategory,
    ActionType,
    AlertLevel,
    AlertStatus,
)


# ==============================================================================
# User Schemas
# ==============================================================================

class UserBase(BaseModel):
    clerk_id: str = Field(..., description="Clerk identity identifier")
    email: str = Field(..., description="User email address")
    role: UserRole = Field(default=UserRole.VICTIM, description="Role authorization tier")


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==============================================================================
# AudioFile Schemas
# ==============================================================================

class AudioFileBase(BaseModel):
    storage_path: str = Field(..., description="Storage URI or relative upload path")
    duration_sec: float = Field(..., ge=0.0, description="Audio duration in seconds")
    sample_rate: int = Field(..., gt=0, description="Sampling rate in Hz (e.g. 16000)")


class AudioFileCreate(AudioFileBase):
    complaint_id: str


class AudioFileResponse(AudioFileBase):
    id: str
    complaint_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==============================================================================
# EmotionAnalysis Schemas
# ==============================================================================

class EmotionAnalysisBase(BaseModel):
    fear: float = Field(default=0.0, ge=0.0, le=1.0)
    anger: float = Field(default=0.0, ge=0.0, le=1.0)
    sadness: float = Field(default=0.0, ge=0.0, le=1.0)
    panic: float = Field(default=0.0, ge=0.0, le=1.0)
    anxiety: float = Field(default=0.0, ge=0.0, le=1.0)
    neutral: float = Field(default=0.0, ge=0.0, le=1.0)


class EmotionAnalysisCreate(EmotionAnalysisBase):
    complaint_id: str


class EmotionAnalysisResponse(EmotionAnalysisBase):
    id: str
    complaint_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==============================================================================
# TraumaAnalysis Schemas
# ==============================================================================

class TraumaAnalysisBase(BaseModel):
    violence_indicators: bool = Field(default=False)
    intimidation: float = Field(default=0.0, ge=0.0, le=1.0)
    social_isolation: float = Field(default=0.0, ge=0.0, le=1.0)
    suicidal_ideation: float = Field(default=0.0, ge=0.0, le=1.0)
    confidence_score: float = Field(default=0.0, ge=0.0, le=1.0)


class TraumaAnalysisCreate(TraumaAnalysisBase):
    complaint_id: str


class TraumaAnalysisResponse(TraumaAnalysisBase):
    id: str
    complaint_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==============================================================================
# AcousticFeatures Schemas
# ==============================================================================

class AcousticFeaturesBase(BaseModel):
    pitch_f0: float = Field(default=0.0, description="Fundamental pitch in Hz")
    rms_energy: float = Field(default=0.0, description="Root mean square energy")
    zcr: float = Field(default=0.0, description="Zero-crossing rate")
    pause_ratio: float = Field(default=0.0, description="Silence to speech ratio")
    spectral_centroid: float = Field(default=0.0, description="Spectral brightness")


class AcousticFeaturesCreate(AcousticFeaturesBase):
    complaint_id: str


class AcousticFeaturesResponse(AcousticFeaturesBase):
    id: str
    complaint_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==============================================================================
# RiskScore & SHAP Explanation Schemas
# ==============================================================================

class ShapExplanationItem(BaseModel):
    word: str = Field(..., description="Token / term triggering risk attribution")
    importance_weight: float = Field(..., description="Attribution score or SHAP coefficient")


class RiskScoreBase(BaseModel):
    svi_score: float = Field(..., ge=0.0, le=100.0, description="Severity Vulnerability Index (0-100)")
    risk_category: RiskCategory = Field(..., description="Severity classification tier")
    shap_explanations: List[ShapExplanationItem] = Field(
        default_factory=list,
        description="Explainable NLP word attribution tokens",
    )


class RiskScoreCreate(RiskScoreBase):
    complaint_id: str


class RiskScoreResponse(RiskScoreBase):
    id: str
    complaint_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==============================================================================
# Recommendation Schemas
# ==============================================================================

class RecommendationBase(BaseModel):
    action_type: ActionType
    description: str
    is_dispatched: bool = False


class RecommendationCreate(RecommendationBase):
    complaint_id: str


class RecommendationResponse(RecommendationBase):
    id: str
    complaint_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==============================================================================
# Alert Schemas
# ==============================================================================

class AlertBase(BaseModel):
    alert_level: AlertLevel
    status: AlertStatus = AlertStatus.OPEN


class AlertCreate(AlertBase):
    complaint_id: str
    dispatched_at: Optional[datetime] = None


class AlertUpdate(BaseModel):
    status: AlertStatus
    dispatched_at: Optional[datetime] = None


class AlertResponse(AlertBase):
    id: str
    complaint_id: str
    dispatched_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==============================================================================
# Complaint Schemas
# ==============================================================================

class ComplaintBase(BaseModel):
    title: str = Field(..., max_length=255)
    raw_text: Optional[str] = None
    audio_file_url: Optional[str] = None
    language: str = Field(default="en", max_length=10)
    state_location: str = Field(..., max_length=100)


class ComplaintCreateText(BaseModel):
    title: str = Field(..., max_length=255)
    raw_text: str = Field(..., min_length=5)
    language: str = Field(default="en", max_length=10)
    state_location: str = Field(..., max_length=100)
    user_id: Optional[str] = None


class ComplaintResponse(ComplaintBase):
    id: str
    user_id: Optional[str] = None
    status: ComplaintStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ComplaintDetailResponse(BaseModel):
    """Deep nested response containing the full multimodal assessment tree."""

    id: str
    user_id: Optional[str] = None
    title: str
    raw_text: Optional[str] = None
    audio_file_url: Optional[str] = None
    language: str
    status: ComplaintStatus
    state_location: str
    created_at: datetime

    # Nested Assessment Graph
    user: Optional[UserResponse] = None
    audio_file: Optional[AudioFileResponse] = None
    emotion_analysis: Optional[EmotionAnalysisResponse] = None
    trauma_analysis: Optional[TraumaAnalysisResponse] = None
    acoustic_features: Optional[AcousticFeaturesResponse] = None
    risk_score: Optional[RiskScoreResponse] = None
    recommendations: List[RecommendationResponse] = Field(default_factory=list)
    alerts: List[AlertResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


# ==============================================================================
# Dashboard Analytics Schema
# ==============================================================================

class DashboardAnalyticsResponse(BaseModel):
    """Aggregated clinical and operational dashboard analytics."""

    total_complaints: int
    risk_distribution: Dict[str, int]
    state_distribution: Dict[str, int]
    open_alerts_count: int
    average_svi_score: float
    status_distribution: Dict[str, int]
