"""TraumaSense AI - Step 2 Verification Test Suite

Executes automated checks for:
- Check 1: Schema & Table Provisioning (9 tables & local storage folder)
- Check 2: Idempotent Multi-Tier Database Seeding (ran twice with identical counts)
- Check 3: Relational Graph & Cascade Integrity (multimodal tree navigation)
- Check 4: Pydantic v2 Serialization Validation (deep nested ComplaintDetailResponse)
"""

import os
import sys
import json
from pathlib import Path
from sqlalchemy import inspect
from app.db.session import engine, SessionLocal
from app.init_db import init_database, LOCAL_AUDIO_DIR
from app.seed import seed_database
from app.models.core import (
    User,
    Complaint,
    AudioFile,
    EmotionAnalysis,
    TraumaAnalysis,
    AcousticFeatures,
    RiskScore,
    RiskCategory,
    Recommendation,
    Alert,
)
from app.schemas.core import ComplaintDetailResponse

REQUIRED_TABLES = [
    "users",
    "complaints",
    "audio_files",
    "emotion_analysis",
    "trauma_analysis",
    "acoustic_features",
    "risk_scores",
    "recommendations",
    "alerts",
]


def check_1_schema_and_tables():
    print("\n--- Check 1 - Schema & Table Provisioning ---")
    summary = init_database()
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()

    print(f"  [DISCOVERED TABLES]: {existing_tables}")
    for req_table in REQUIRED_TABLES:
        assert req_table in existing_tables, f"Missing required table: {req_table}"
        print(f"  [TABLE VERIFIED] {req_table} exists in database")

    assert os.path.isdir(LOCAL_AUDIO_DIR), f"Missing local audio directory: {LOCAL_AUDIO_DIR}"
    print(f"  [STORAGE VERIFIED] Local audio storage folder verified at: {LOCAL_AUDIO_DIR}")
    print("Check 1 Status: [PASSED]")


def check_2_idempotent_seeding():
    print("\n--- Check 2 - Idempotent Seed Execution ---")
    # Run seed 1
    print("  Executing Seed Run 1...")
    result_1 = seed_database()
    print(f"  [RUN 1 RESULT]: {result_1}")

    # Run seed 2 (Idempotency confirmation)
    print("  Executing Seed Run 2 (Idempotency Test)...")
    result_2 = seed_database()
    print(f"  [RUN 2 RESULT]: {result_2}")

    assert result_1["users_count"] == result_2["users_count"] >= 3, "User count mismatch or < 3"
    assert result_1["complaints_count"] == result_2["complaints_count"] >= 8, "Complaint count mismatch or < 8"

    # Verify risk tier distribution
    db = SessionLocal()
    try:
        categories = [
            row[0]
            for row in db.query(RiskScore.risk_category).distinct().all()
        ]
        print(f"  [VERIFIED RISK TIERS PERSISTED]: {categories}")
        for tier in [RiskCategory.LOW, RiskCategory.MODERATE, RiskCategory.HIGH, RiskCategory.CRITICAL]:
            assert tier in categories, f"Missing risk tier: {tier}"
            tier_count = db.query(RiskScore).filter(RiskScore.risk_category == tier).count()
            print(f"    - Tier {tier.value}: {tier_count} complaint(s)")
    finally:
        db.close()

    print("  [VERIFIED] Idempotent seed execution confirmed across all 4 SVI risk categories")
    print("Check 2 Status: [PASSED]")


def check_3_relational_graph_integrity():
    print("\n--- Check 3 - Relational Graph & Cascade Integrity ---")
    db = SessionLocal()
    try:
        # Query a critical complaint
        critical_complaint = (
            db.query(Complaint)
            .join(RiskScore)
            .filter(RiskScore.risk_category == RiskCategory.CRITICAL)
            .first()
        )
        assert critical_complaint is not None, "Critical complaint not found in database"
        print(f"  [SELECTED CRITICAL COMPLAINT]: ID={critical_complaint.id}, Title='{critical_complaint.title}'")

        # 1. User
        assert critical_complaint.user is not None, "User relationship failed to load"
        print(f"  [USER RELATIONSHIP]: {critical_complaint.user.email} (Role: {critical_complaint.user.role.value})")

        # 2. AudioFile
        assert critical_complaint.audio_file is not None, "AudioFile relationship failed to load"
        print(f"  [AUDIO FILE RELATIONSHIP]: {critical_complaint.audio_file.storage_path} ({critical_complaint.audio_file.duration_sec}s)")

        # 3. EmotionAnalysis
        assert critical_complaint.emotion_analysis is not None, "EmotionAnalysis relationship failed to load"
        print(f"  [EMOTION RELATIONSHIP]: Fear={critical_complaint.emotion_analysis.fear}, Panic={critical_complaint.emotion_analysis.panic}")

        # 4. TraumaAnalysis
        assert critical_complaint.trauma_analysis is not None, "TraumaAnalysis relationship failed to load"
        print(f"  [TRAUMA RELATIONSHIP]: Violence={critical_complaint.trauma_analysis.violence_indicators}, Intimidation={critical_complaint.trauma_analysis.intimidation}")

        # 5. AcousticFeatures
        assert critical_complaint.acoustic_features is not None, "AcousticFeatures relationship failed to load"
        print(f"  [ACOUSTIC RELATIONSHIP]: Pitch={critical_complaint.acoustic_features.pitch_f0}Hz, RMS={critical_complaint.acoustic_features.rms_energy}")

        # 6. RiskScore with non-empty SHAP JSON
        assert critical_complaint.risk_score is not None, "RiskScore relationship failed to load"
        assert len(critical_complaint.risk_score.shap_explanations) > 0, "SHAP explanations array is empty"
        print(f"  [RISK RELATIONSHIP]: SVI Score={critical_complaint.risk_score.svi_score}, SHAP Tokens={len(critical_complaint.risk_score.shap_explanations)}")

        # 7. Recommendations
        assert len(critical_complaint.recommendations) > 0, "Recommendations collection is empty"
        print(f"  [RECOMMENDATIONS RELATIONSHIP]: {len(critical_complaint.recommendations)} recommendation(s) generated")

        # 8. Alerts
        assert len(critical_complaint.alerts) > 0, "Alerts collection is empty for critical complaint"
        print(f"  [ALERTS RELATIONSHIP]: {len(critical_complaint.alerts)} alert(s) linked (Level={critical_complaint.alerts[0].alert_level.value}, Status={critical_complaint.alerts[0].status.value})")

    finally:
        db.close()

    print("  [VERIFIED] Full relational graph navigated cleanly with zero detached instance errors")
    print("Check 3 Status: [PASSED]")


def check_4_pydantic_serialization():
    print("\n--- Check 4 - Pydantic v2 Serialization Validation ---")
    db = SessionLocal()
    try:
        critical_complaint = (
            db.query(Complaint)
            .join(RiskScore)
            .filter(RiskScore.risk_category == RiskCategory.CRITICAL)
            .first()
        )
        assert critical_complaint is not None, "Critical complaint not found"

        # Validate through Pydantic v2 model_validate
        validated_complaint = ComplaintDetailResponse.model_validate(critical_complaint)
        assert validated_complaint.id == critical_complaint.id
        assert validated_complaint.risk_score.svi_score == critical_complaint.risk_score.svi_score
        assert len(validated_complaint.recommendations) == len(critical_complaint.recommendations)
        assert len(validated_complaint.alerts) == len(critical_complaint.alerts)

        # Confirm JSON serialization
        json_payload = validated_complaint.model_dump_json(indent=2)
        parsed = json.loads(json_payload)
        assert parsed["title"] == critical_complaint.title
        assert parsed["risk_score"]["risk_category"] == "CRITICAL"
        assert len(parsed["risk_score"]["shap_explanations"]) >= 1

        print(f"  [PYDANTIC v2 VALIDATION OK]: Successfully serialized {len(json_payload)} bytes of nested JSON")
        print(f"  [SAMPLE SERIALIZED RISK]: SVI={parsed['risk_score']['svi_score']}, SHAP count={len(parsed['risk_score']['shap_explanations'])}")
        print(f"  [SAMPLE SERIALIZED ACTIONS]: {len(parsed['recommendations'])} recommendation(s), {len(parsed['alerts'])} alert(s)")
    finally:
        db.close()

    print("  [VERIFIED] ComplaintDetailResponse.model_validate and .model_dump_json() executed with zero validation errors")
    print("Check 4 Status: [PASSED]")


if __name__ == "__main__":
    print("=================================================================")
    print("TraumaSense AI - Step 2 Verification Test Suite")
    print("=================================================================")
    try:
        check_1_schema_and_tables()
        check_2_idempotent_seeding()
        check_3_relational_graph_integrity()
        check_4_pydantic_serialization()
        print("\n=================================================================")
        print("ALL STEP 2 VERIFICATION CHECKS PASSED (100%)")
        print("=================================================================")
    except Exception as exc:
        print(f"\n[VERIFICATION FAILED]: {exc}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
