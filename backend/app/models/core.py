"""TraumaSense AI - Core SQLAlchemy ORM Models

Cross-database compatible (Local SQLite & Supabase PostgreSQL):
- String(36) UUIDs for universal primary and foreign key compatibility
- Generic SQLAlchemy JSON type for cross-dialect JSON storage
- String-backed Enums (native_enum=False) for consistent SQLite/Postgres behavior
- Explicit cascade delete rules ('all, delete-orphan') on all complaint child entities
"""

import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Text,
    Float,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Enum,
    JSON,
    Index,
)
from sqlalchemy.orm import relationship
from app.db.session import Base


# ==============================================================================
# Domain Enums
# ==============================================================================

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    OFFICER = "OFFICER"
    VICTIM = "VICTIM"


class ComplaintStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_REVIEW = "IN_REVIEW"
    RESOLVED = "RESOLVED"
    ESCALATED = "ESCALATED"


class RiskCategory(str, enum.Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ActionType(str, enum.Enum):
    COUNSELLING = "COUNSELLING"
    LEGAL_AID = "LEGAL_AID"
    MEDICAL_ASSISTANCE = "MEDICAL_ASSISTANCE"
    POLICE_INTERVENTION = "POLICE_INTERVENTION"
    WITNESS_PROTECTION = "WITNESS_PROTECTION"
    EMERGENCY_RESPONSE = "EMERGENCY_RESPONSE"


class AlertLevel(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"


class AlertStatus(str, enum.Enum):
    OPEN = "OPEN"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"


def utc_now() -> datetime:
    """Return timezone-aware current UTC datetime."""
    return datetime.now(timezone.utc)


def generate_uuid() -> str:
    """Generate string UUID4 for primary and foreign key values."""
    return str(uuid.uuid4())


# ==============================================================================
# Model 1: User
# ==============================================================================

class User(Base):
    """User account linked with Clerk authentication identity."""

    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    clerk_id = Column(String(128), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    role = Column(
        Enum(UserRole, native_enum=False, create_constraint=True),
        default=UserRole.VICTIM,
        nullable=False,
    )
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    complaints = relationship(
        "Complaint",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"


# ==============================================================================
# Model 2: Complaint
# ==============================================================================

class Complaint(Base):
    """Central trauma incident complaint filed by or on behalf of a victim."""

    __tablename__ = "complaints"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title = Column(String(255), nullable=False)
    raw_text = Column(Text, nullable=True)
    audio_file_url = Column(String(512), nullable=True)
    language = Column(String(10), default="en", nullable=False)
    status = Column(
        Enum(ComplaintStatus, native_enum=False, create_constraint=True),
        default=ComplaintStatus.PENDING,
        nullable=False,
        index=True,
    )
    state_location = Column(String(100), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="complaints")
    audio_file = relationship(
        "AudioFile",
        back_populates="complaint",
        uselist=False,
        cascade="all, delete-orphan",
    )
    emotion_analysis = relationship(
        "EmotionAnalysis",
        back_populates="complaint",
        uselist=False,
        cascade="all, delete-orphan",
    )
    trauma_analysis = relationship(
        "TraumaAnalysis",
        back_populates="complaint",
        uselist=False,
        cascade="all, delete-orphan",
    )
    acoustic_features = relationship(
        "AcousticFeatures",
        back_populates="complaint",
        uselist=False,
        cascade="all, delete-orphan",
    )
    risk_score = relationship(
        "RiskScore",
        back_populates="complaint",
        uselist=False,
        cascade="all, delete-orphan",
    )
    recommendations = relationship(
        "Recommendation",
        back_populates="complaint",
        cascade="all, delete-orphan",
    )
    alerts = relationship(
        "Alert",
        back_populates="complaint",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Complaint(id={self.id}, title='{self.title}', status={self.status}, state='{self.state_location}')>"


# ==============================================================================
# Model 3: AudioFile
# ==============================================================================

class AudioFile(Base):
    """Metadata and storage path for recorded distress/statement audio."""

    __tablename__ = "audio_files"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(
        String(36),
        ForeignKey("complaints.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    storage_path = Column(String(512), nullable=False)
    duration_sec = Column(Float, nullable=False)
    sample_rate = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    complaint = relationship("Complaint", back_populates="audio_file")

    def __repr__(self) -> str:
        return f"<AudioFile(id={self.id}, duration={self.duration_sec}s, path='{self.storage_path}')>"


# ==============================================================================
# Model 4: EmotionAnalysis
# ==============================================================================

class EmotionAnalysis(Base):
    """Multidimensional emotional spectrum extracted from verbal & acoustic cues."""

    __tablename__ = "emotion_analysis"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(
        String(36),
        ForeignKey("complaints.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    fear = Column(Float, nullable=False, default=0.0)
    anger = Column(Float, nullable=False, default=0.0)
    sadness = Column(Float, nullable=False, default=0.0)
    panic = Column(Float, nullable=False, default=0.0)
    anxiety = Column(Float, nullable=False, default=0.0)
    neutral = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    complaint = relationship("Complaint", back_populates="emotion_analysis")

    def __repr__(self) -> str:
        return f"<EmotionAnalysis(fear={self.fear}, panic={self.panic}, anger={self.anger})>"


# ==============================================================================
# Model 5: TraumaAnalysis
# ==============================================================================

class TraumaAnalysis(Base):
    """Clinical trauma and danger markers evaluated by NLP and audio classifiers."""

    __tablename__ = "trauma_analysis"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(
        String(36),
        ForeignKey("complaints.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    violence_indicators = Column(Boolean, nullable=False, default=False)
    intimidation = Column(Float, nullable=False, default=0.0)
    social_isolation = Column(Float, nullable=False, default=0.0)
    suicidal_ideation = Column(Float, nullable=False, default=0.0)
    confidence_score = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    complaint = relationship("Complaint", back_populates="trauma_analysis")

    def __repr__(self) -> str:
        return f"<TraumaAnalysis(violence={self.violence_indicators}, intimidation={self.intimidation})>"


# ==============================================================================
# Model 6: AcousticFeatures
# ==============================================================================

class AcousticFeatures(Base):
    """Digital signal processing (DSP) acoustic biomarkers from speech audio."""

    __tablename__ = "acoustic_features"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(
        String(36),
        ForeignKey("complaints.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    pitch_f0 = Column(Float, nullable=False, default=0.0)
    rms_energy = Column(Float, nullable=False, default=0.0)
    zcr = Column(Float, nullable=False, default=0.0)  # Zero Crossing Rate
    pause_ratio = Column(Float, nullable=False, default=0.0)
    spectral_centroid = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    complaint = relationship("Complaint", back_populates="acoustic_features")

    def __repr__(self) -> str:
        return f"<AcousticFeatures(pitch={self.pitch_f0}, pause_ratio={self.pause_ratio})>"


# ==============================================================================
# Model 7: RiskScore
# ==============================================================================

class RiskScore(Base):
    """Synthesized Severity Vulnerability Index (SVI 0-100) with explainable SHAP weights."""

    __tablename__ = "risk_scores"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(
        String(36),
        ForeignKey("complaints.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    svi_score = Column(Float, nullable=False, index=True)  # 0.0 to 100.0
    risk_category = Column(
        Enum(RiskCategory, native_enum=False, create_constraint=True),
        nullable=False,
        index=True,
    )
    # Stored as list of {"word": str, "importance_weight": float}
    shap_explanations = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    complaint = relationship("Complaint", back_populates="risk_score")

    def __repr__(self) -> str:
        return f"<RiskScore(svi={self.svi_score}, category={self.risk_category})>"


# ==============================================================================
# Model 8: Recommendation
# ==============================================================================

class Recommendation(Base):
    """Automated prescriptive intervention generated based on trauma severity."""

    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(
        String(36),
        ForeignKey("complaints.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    action_type = Column(
        Enum(ActionType, native_enum=False, create_constraint=True),
        nullable=False,
    )
    description = Column(Text, nullable=False)
    is_dispatched = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    complaint = relationship("Complaint", back_populates="recommendations")

    def __repr__(self) -> str:
        return f"<Recommendation(action={self.action_type}, dispatched={self.is_dispatched})>"


# ==============================================================================
# Model 9: Alert
# ==============================================================================

class Alert(Base):
    """Urgent emergency escalation notification for critical and high risk incidents."""

    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(
        String(36),
        ForeignKey("complaints.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    alert_level = Column(
        Enum(AlertLevel, native_enum=False, create_constraint=True),
        nullable=False,
    )
    status = Column(
        Enum(AlertStatus, native_enum=False, create_constraint=True),
        default=AlertStatus.OPEN,
        nullable=False,
        index=True,
    )
    dispatched_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    complaint = relationship("Complaint", back_populates="alerts")

    def __repr__(self) -> str:
        return f"<Alert(level={self.alert_level}, status={self.status})>"
