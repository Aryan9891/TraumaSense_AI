"""TraumaSense AI - Complaints Intake & Multimodal Assessment Router"""

import os
import uuid
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.init_db import LOCAL_AUDIO_DIR
from app.models.core import (
    Complaint,
    ComplaintStatus,
    AudioFile,
    EmotionAnalysis,
    TraumaAnalysis,
    AcousticFeatures,
    RiskScore,
    RiskCategory,
    Recommendation,
    Alert,
)
from app.schemas.core import (
    ComplaintCreateText,
    ComplaintDetailResponse,
)
from app.services.speech_service import extract_acoustic_features, transcribe_audio
from app.services.nlp_service import analyze_text_trauma
from app.services.explainability import generate_shap_explanations
from app.services.svi_engine import compute_svi_and_triage

logger = logging.getLogger("traumasense.router.complaints")
router = APIRouter(prefix="/complaints", tags=["Complaints"])


@router.post("/submit-text", response_model=ComplaintDetailResponse, status_code=status.HTTP_201_CREATED)
def submit_text_complaint(
    complaint_in: ComplaintCreateText,
    db: Session = Depends(get_db),
):
    """Submit written trauma narrative, run AI multimodal pipeline, and persist assessment."""
    logger.info(f"Processing text complaint submission: '{complaint_in.title}' (State: {complaint_in.state_location})")

    # 1. NLP Trauma & Emotion Analysis
    nlp_result = analyze_text_trauma(complaint_in.raw_text, language=complaint_in.language)
    emotion_scores = nlp_result["emotion_scores"]
    trauma_scores = nlp_result["trauma_scores"]

    # 2. XAI / SHAP Token Attribution
    shap_explanations = generate_shap_explanations(complaint_in.raw_text, language=complaint_in.language)

    # 3. SVI Triage Engine
    triage = compute_svi_and_triage(emotion_scores, trauma_scores, acoustic_features=None)

    # 4. Construct Relational Database Records
    complaint_status = (
        ComplaintStatus.ESCALATED
        if triage["risk_category"] == RiskCategory.CRITICAL
        else ComplaintStatus.PENDING
    )

    complaint = Complaint(
        user_id=complaint_in.user_id,
        title=complaint_in.title,
        raw_text=complaint_in.raw_text,
        language=complaint_in.language,
        status=complaint_status,
        state_location=complaint_in.state_location,
    )

    # Child Entities
    complaint.emotion_analysis = EmotionAnalysis(
        fear=emotion_scores.get("fear", 0.0),
        anger=emotion_scores.get("anger", 0.0),
        sadness=emotion_scores.get("sadness", 0.0),
        panic=emotion_scores.get("panic", 0.0),
        anxiety=emotion_scores.get("anxiety", 0.0),
        neutral=emotion_scores.get("neutral", 0.0),
    )
    complaint.trauma_analysis = TraumaAnalysis(
        violence_indicators=bool(trauma_scores.get("violence_indicators", False)),
        intimidation=float(trauma_scores.get("intimidation", 0.0)),
        social_isolation=float(trauma_scores.get("social_isolation", 0.0)),
        suicidal_ideation=float(trauma_scores.get("suicidal_ideation", 0.0)),
        confidence_score=float(trauma_scores.get("confidence_score", 0.0)),
    )
    complaint.risk_score = RiskScore(
        svi_score=triage["svi_score"],
        risk_category=triage["risk_category"],
        shap_explanations=shap_explanations,
    )

    for rec in triage["recommendations"]:
        complaint.recommendations.append(Recommendation(**rec))

    if triage["requires_alert"]:
        complaint.alerts.append(Alert(
            alert_level=triage["alert_level"],
            status=triage["alert_status"],
        ))

    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    logger.info(
        f"Complaint persisted (ID: {complaint.id}): SVI={triage['svi_score']}, "
        f"Risk={triage['risk_category'].value}, Alerts={len(complaint.alerts)}"
    )
    return complaint


@router.post("/submit-audio", response_model=ComplaintDetailResponse, status_code=status.HTTP_201_CREATED)
async def submit_audio_complaint(
    file: UploadFile = File(...),
    title: str = Form(...),
    state_location: str = Form(...),
    language: str = Form("en"),
    raw_text: Optional[str] = Form(None),
    user_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    """Submit recorded audio distress statement, extract signal biomarkers, transcribe, and assess."""
    logger.info(f"Processing audio complaint submission: '{title}' (Filename: {file.filename})")

    # 1. Read and persist audio locally
    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded audio file is empty.",
        )

    file_extension = os.path.splitext(file.filename or "")[1] or ".wav"
    safe_filename = f"{uuid.uuid4()}{file_extension}"
    save_path = LOCAL_AUDIO_DIR / safe_filename
    with open(save_path, "wb") as f_out:
        f_out.write(audio_bytes)

    relative_storage_path = f"uploads/audio/{safe_filename}"

    # 2. Extract Acoustic Biomarkers
    acoustic_features = extract_acoustic_features(audio_bytes, target_sr=16000)

    # 3. Transcribe Audio (if raw_text not explicitly provided)
    if not raw_text or not raw_text.strip():
        transcription_res = transcribe_audio(audio_bytes, filename=file.filename or "audio.wav", language_hint=language)
        effective_text = transcription_res.get("text", "")
    else:
        effective_text = raw_text

    # 4. Multilingual NLP Analysis & SHAP
    nlp_result = analyze_text_trauma(effective_text, language=language)
    emotion_scores = nlp_result["emotion_scores"]
    trauma_scores = nlp_result["trauma_scores"]
    shap_explanations = generate_shap_explanations(effective_text, language=language)

    # 5. Multimodal SVI Triage Engine
    triage = compute_svi_and_triage(emotion_scores, trauma_scores, acoustic_features=acoustic_features)

    complaint_status = (
        ComplaintStatus.ESCALATED
        if triage["risk_category"] == RiskCategory.CRITICAL
        else ComplaintStatus.PENDING
    )

    complaint = Complaint(
        user_id=user_id,
        title=title,
        raw_text=effective_text,
        audio_file_url=f"/{relative_storage_path}",
        language=language,
        status=complaint_status,
        state_location=state_location,
    )

    # Attach Audio File Metadata
    complaint.audio_file = AudioFile(
        storage_path=relative_storage_path,
        duration_sec=acoustic_features["duration_sec"],
        sample_rate=acoustic_features["sample_rate"],
    )

    # Attach Acoustic Features
    complaint.acoustic_features = AcousticFeatures(
        pitch_f0=acoustic_features["pitch_f0"],
        rms_energy=acoustic_features["rms_energy"],
        zcr=acoustic_features["zcr"],
        pause_ratio=acoustic_features["pause_ratio"],
        spectral_centroid=acoustic_features["spectral_centroid"],
    )

    # Attach Emotion & Trauma Analytics
    complaint.emotion_analysis = EmotionAnalysis(
        fear=emotion_scores.get("fear", 0.0),
        anger=emotion_scores.get("anger", 0.0),
        sadness=emotion_scores.get("sadness", 0.0),
        panic=emotion_scores.get("panic", 0.0),
        anxiety=emotion_scores.get("anxiety", 0.0),
        neutral=emotion_scores.get("neutral", 0.0),
    )
    complaint.trauma_analysis = TraumaAnalysis(
        violence_indicators=bool(trauma_scores.get("violence_indicators", False)),
        intimidation=float(trauma_scores.get("intimidation", 0.0)),
        social_isolation=float(trauma_scores.get("social_isolation", 0.0)),
        suicidal_ideation=float(trauma_scores.get("suicidal_ideation", 0.0)),
        confidence_score=float(trauma_scores.get("confidence_score", 0.0)),
    )
    complaint.risk_score = RiskScore(
        svi_score=triage["svi_score"],
        risk_category=triage["risk_category"],
        shap_explanations=shap_explanations,
    )

    for rec in triage["recommendations"]:
        complaint.recommendations.append(Recommendation(**rec))

    if triage["requires_alert"]:
        complaint.alerts.append(Alert(
            alert_level=triage["alert_level"],
            status=triage["alert_status"],
        ))

    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    logger.info(
        f"Audio complaint persisted (ID: {complaint.id}): Duration={acoustic_features['duration_sec']}s, "
        f"SVI={triage['svi_score']}, Risk={triage['risk_category'].value}"
    )
    return complaint


@router.get("", response_model=List[ComplaintDetailResponse])
def list_complaints(
    risk_category: Optional[RiskCategory] = Query(None, description="Filter by risk category"),
    status: Optional[ComplaintStatus] = Query(None, description="Filter by complaint status"),
    state_location: Optional[str] = Query(None, description="Filter by Indian state"),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Retrieve filtered list of complaints with full multimodal assessment graphs."""
    query = db.query(Complaint)

    if risk_category:
        query = query.join(RiskScore).filter(RiskScore.risk_category == risk_category)
    if status:
        query = query.filter(Complaint.status == status)
    if state_location:
        query = query.filter(Complaint.state_location.ilike(f"%{state_location}%"))

    return query.order_by(Complaint.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{complaint_id}", response_model=ComplaintDetailResponse)
def get_complaint_by_id(complaint_id: str, db: Session = Depends(get_db)):
    """Retrieve single complaint detail by UUID."""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID '{complaint_id}' not found.",
        )
    return complaint


@router.get("/user/{user_id}", response_model=List[ComplaintDetailResponse])
def get_complaints_by_user(
    user_id: str,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Retrieve all complaints filed by a specific user account."""
    return (
        db.query(Complaint)
        .filter(Complaint.user_id == user_id)
        .order_by(Complaint.created_at.desc())
        .limit(limit)
        .all()
    )
