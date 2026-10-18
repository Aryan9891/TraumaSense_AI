"""TraumaSense AI - Step 3 Verification Test Suite

Automated verification script executing the 4 required Step 3 checks:
- Check 1: Real Acoustic Feature Extraction (Librosa / SoundFile DSP biomarkers)
- Check 2: Multilingual NLP, Token-Perturbation SHAP & SVI Triage Engine
- Check 3: FastAPI End-to-End Text & Audio Complaint Submission Endpoints
- Check 4: Dashboard Analytics Aggregation & Emergency Alert Dispatch Workflow
"""

import io
import os
import sys
from pathlib import Path

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import numpy as np
import soundfile as sf
from fastapi.testclient import TestClient

from app.main import app
from app.init_db import init_database
from app.seed import seed_database
from app.services.speech_service import extract_acoustic_features, transcribe_audio
from app.services.nlp_service import analyze_text_trauma
from app.services.explainability import generate_shap_explanations
from app.services.svi_engine import compute_svi_and_triage
from app.models.core import RiskCategory, ActionType, AlertLevel, AlertStatus
from app.schemas.core import ComplaintDetailResponse, DashboardAnalyticsResponse


def synthesize_distress_audio(
    duration: float = 2.0,
    sr: int = 16000,
    tone_freq: float = 320.0,
    pause_sec: float = 0.6,
) -> bytes:
    """Synthesizes a 16kHz WAV buffer containing a distress tone and silence pause."""
    total_samples = int(sr * duration)
    t = np.linspace(0, duration, total_samples, endpoint=False)

    # 320 Hz distress tone with amplitude modulation (AM tremor)
    signal = 0.5 * np.sin(2 * np.pi * tone_freq * t) * (0.8 + 0.2 * np.sin(2 * np.pi * 5 * t))

    # Insert silence pause of duration pause_sec starting at 0.5s
    pause_start = int(0.5 * sr)
    pause_len = int(pause_sec * sr)
    signal[pause_start : pause_start + pause_len] = 0.0

    buffer = io.BytesIO()
    sf.write(buffer, signal, sr, format="WAV", subtype="PCM_16")
    buffer.seek(0)
    return buffer.read()


# ==============================================================================
# Check 1: Real Acoustic Feature Extraction (Librosa / SoundFile)
# ==============================================================================

def check_1_acoustic_feature_extraction():
    print("\n--- Check 1 - Real Acoustic Feature Extraction (Librosa/SoundFile) ---")
    audio_bytes = synthesize_distress_audio(duration=2.0, sr=16000, tone_freq=320.0, pause_sec=0.6)
    assert len(audio_bytes) > 0, "Synthesized audio buffer is empty"

    features = extract_acoustic_features(audio_bytes, target_sr=16000)

    print(f"  [EXTRACTED ACOUSTIC BIOMARKERS]:")
    print(f"    - Pitch F0:                {features['pitch_f0']} Hz")
    print(f"    - RMS Energy:              {features['rms_energy']}")
    print(f"    - Zero Crossing Rate:      {features['zcr']}")
    print(f"    - Spectral Centroid:       {features['spectral_centroid']} Hz")
    print(f"    - Pause Ratio:             {features['pause_ratio']}")
    print(f"    - Duration:                {features['duration_sec']} sec")
    print(f"    - Acoustic Distress Score: {features['acoustic_distress_score']}")

    # Assertions required by Step 3 specification
    assert features["pitch_f0"] > 200.0, f"Expected pitch_f0 > 200, got {features['pitch_f0']}"
    assert features["rms_energy"] > 0.0, f"Expected rms_energy > 0, got {features['rms_energy']}"
    assert features["pause_ratio"] > 0.15, f"Expected pause_ratio > 0.15, got {features['pause_ratio']}"
    assert features["acoustic_distress_score"] > 0.0, f"Expected distress score > 0, got {features['acoustic_distress_score']}"

    # Verify resilient Whisper transcription fallback
    transcript_info = transcribe_audio(audio_bytes, filename="distress_test.wav")
    assert "transcript" in transcript_info, "Missing transcript in transcription output"
    print(f"  [TRANSCRIPTION]: {transcript_info}")

    print("Check 1 Status: [PASSED]")
    return features


# ==============================================================================
# Check 2: Multilingual NLP, SHAP & SVI Triage Engine
# ==============================================================================

def check_2_nlp_shap_and_svi_triage():
    print("\n--- Check 2 - Multilingual NLP, SHAP & SVI Triage Engine ---")

    # 1. Critical English Crisis Narrative
    crit_text = "He threatened to kill me tonight with a weapon, I am terrified and feel like ending my life"
    crit_nlp = analyze_text_trauma(crit_text, language="en")
    crit_shap = generate_shap_explanations(crit_text, language="en", top_k=8)
    crit_triage = compute_svi_and_triage(crit_nlp["emotion_scores"], crit_nlp["trauma_scores"])

    print(f"  [CRITICAL NARRATIVE (EN)]:")
    print(f"    - SVI Score:        {crit_triage['svi_score']} / 100.0")
    print(f"    - Risk Category:    {crit_triage['risk_category'].value}")
    print(f"    - Suicidal Marker:  {crit_nlp['trauma_scores']['suicidal_ideation']}")
    print(f"    - Violence Threat:  {crit_nlp['trauma_scores']['violence_indicators']}")
    print(f"    - Requires Alert:   {crit_triage['requires_alert']}")
    print(f"    - Top SHAP Tokens:  {[item['word'] for item in crit_shap[:5]]}")
    action_types = [rec["action_type"] for rec in crit_triage["recommendations"]]
    print(f"    - Actions Triggered: {[a.value for a in action_types]}")

    assert crit_triage["svi_score"] >= 76.0, f"Expected SVI >= 76.0, got {crit_triage['svi_score']}"
    assert crit_triage["risk_category"] == RiskCategory.CRITICAL, f"Expected CRITICAL risk, got {crit_triage['risk_category']}"
    assert len(crit_shap) > 0, "Expected non-empty SHAP keyword weights"
    assert ActionType.EMERGENCY_RESPONSE in action_types or ActionType.POLICE_INTERVENTION in action_types, \
        f"Expected emergency action in {action_types}"
    assert crit_triage["requires_alert"] is True, "Critical narrative must require an emergency alert"

    # 2. High-Distress Hindi Narrative
    hi_text = "मुझे जान से मारने की धमकी मिल रही है, मुझे बहुत डर और घबराहट हो रही है, कृपया पुलिस भेजें"
    hi_nlp = analyze_text_trauma(hi_text, language="hi")
    hi_shap = generate_shap_explanations(hi_text, language="hi", top_k=8)
    hi_triage = compute_svi_and_triage(hi_nlp["emotion_scores"], hi_nlp["trauma_scores"])

    print(f"  [HIGH-DISTRESS NARRATIVE (HI)]:")
    print(f"    - SVI Score:        {hi_triage['svi_score']} / 100.0")
    print(f"    - Risk Category:    {hi_triage['risk_category'].value}")
    print(f"    - Fear Score:       {hi_nlp['emotion_scores']['fear']}")
    print(f"    - Violence Threat:  {hi_nlp['trauma_scores']['violence_indicators']}")
    print(f"    - SHAP Token Count: {len(hi_shap)}")

    assert hi_triage["svi_score"] >= 75.0, f"Expected Hindi threat SVI >= 75.0, got {hi_triage['svi_score']}"
    assert hi_triage["risk_category"] in [RiskCategory.HIGH, RiskCategory.CRITICAL]

    # 3. Low-Distress Narrative
    low_text = "I would like information about general legal aid timings in my district"
    low_nlp = analyze_text_trauma(low_text, language="en")
    low_shap = generate_shap_explanations(low_text, language="en", top_k=8)
    low_triage = compute_svi_and_triage(low_nlp["emotion_scores"], low_nlp["trauma_scores"])

    print(f"  [LOW-DISTRESS NARRATIVE (EN)]:")
    print(f"    - SVI Score:        {low_triage['svi_score']} / 100.0")
    print(f"    - Risk Category:    {low_triage['risk_category'].value}")
    print(f"    - Requires Alert:   {low_triage['requires_alert']}")

    assert low_triage["svi_score"] <= 25.0, f"Expected low SVI <= 25.0, got {low_triage['svi_score']}"
    assert low_triage["risk_category"] == RiskCategory.LOW, f"Expected LOW risk, got {low_triage['risk_category']}"
    assert low_triage["requires_alert"] is False, "Low-distress complaint should not require alert"

    print("Check 2 Status: [PASSED]")


# ==============================================================================
# Check 3: FastAPI End-to-End Text & Audio Complaint Endpoints
# ==============================================================================

def check_3_fastapi_complaint_endpoints():
    print("\n--- Check 3 - FastAPI End-to-End Text & Audio Complaint Endpoints ---")
    client = TestClient(app)

    # 1. Text Complaint Submission
    crit_narrative = (
        "He threatened to kill me tonight with a weapon, I am terrified and feel like ending my life"
    )
    text_payload = {
        "title": "Automated Verification Critical Crisis",
        "raw_text": crit_narrative,
        "language": "en",
        "state_location": "Maharashtra",
    }
    res_text = client.post("/api/complaints/submit-text", json=text_payload)
    print(f"  [TEXT SUBMISSION RESPONSE]: HTTP {res_text.status_code}")
    assert res_text.status_code in [200, 201], f"Expected HTTP 200/201, got {res_text.status_code}: {res_text.text}"

    data_text = res_text.json()
    validated_text = ComplaintDetailResponse.model_validate(data_text)
    print(f"    - Complaint ID:   {validated_text.id}")
    print(f"    - SVI Score:      {validated_text.risk_score.svi_score}")
    print(f"    - Risk Category:  {validated_text.risk_score.risk_category.value}")
    print(f"    - Alerts Count:   {len(validated_text.alerts)}")

    assert validated_text.risk_score is not None
    assert validated_text.risk_score.risk_category == RiskCategory.CRITICAL, \
        f"Expected CRITICAL risk, got {validated_text.risk_score.risk_category}"
    assert len(validated_text.alerts) >= 1, "Expected at least 1 alert for critical narrative"
    assert validated_text.alerts[0].status == AlertStatus.OPEN, "Alert status must be OPEN"

    # 2. Audio Complaint Submission (Multipart)
    audio_bytes = synthesize_distress_audio(duration=2.0, sr=16000, tone_freq=320.0, pause_sec=0.6)
    files = {"file": ("distress_sample.wav", audio_bytes, "audio/wav")}
    form_data = {
        "title": "Automated Verification Audio Distress",
        "state_location": "Delhi",
        "language": "en",
        "raw_text": "Distress audio recording submitted via emergency portal",
    }
    res_audio = client.post("/api/complaints/submit-audio", files=files, data=form_data)
    print(f"  [AUDIO SUBMISSION RESPONSE]: HTTP {res_audio.status_code}")
    assert res_audio.status_code in [200, 201], f"Expected HTTP 200/201, got {res_audio.status_code}: {res_audio.text}"

    data_audio = res_audio.json()
    validated_audio = ComplaintDetailResponse.model_validate(data_audio)
    print(f"    - Complaint ID:   {validated_audio.id}")
    print(f"    - Audio Path:     {validated_audio.audio_file.storage_path}")
    print(f"    - Pitch F0:       {validated_audio.acoustic_features.pitch_f0} Hz")
    print(f"    - RMS Energy:     {validated_audio.acoustic_features.rms_energy}")
    print(f"    - Pause Ratio:    {validated_audio.acoustic_features.pause_ratio}")
    print(f"    - SVI Score:      {validated_audio.risk_score.svi_score}")

    assert validated_audio.audio_file is not None, "Missing persisted audio_file metadata"
    assert validated_audio.acoustic_features is not None, "Missing persisted acoustic_features"
    assert validated_audio.acoustic_features.pitch_f0 > 200.0, "Expected pitch_f0 > 200 in audio complaint"
    assert validated_audio.acoustic_features.rms_energy > 0.0, "Expected rms_energy > 0 in audio complaint"
    assert validated_audio.acoustic_features.pause_ratio > 0.15, "Expected pause_ratio > 0.15 in audio complaint"
    assert validated_audio.risk_score is not None, "Missing risk_score in audio complaint"

    # 3. GET /api/complaints and GET /api/complaints/{id}
    res_get_all = client.get("/api/complaints")
    assert res_get_all.status_code == 200
    complaints_list = res_get_all.json()
    assert len(complaints_list) >= 2, "Expected complaints list to include submissions"

    res_get_one = client.get(f"/api/complaints/{validated_text.id}")
    assert res_get_one.status_code == 200
    assert res_get_one.json()["id"] == validated_text.id

    print("Check 3 Status: [PASSED]")


# ==============================================================================
# Check 4: Dashboard Analytics & Alert Dispatch Workflow
# ==============================================================================

def check_4_analytics_and_alert_dispatch():
    print("\n--- Check 4 - Dashboard Analytics & Alert Dispatch Workflow ---")
    client = TestClient(app)

    # 1. Dashboard Aggregations
    res_dash = client.get("/api/analytics/dashboard")
    print(f"  [ANALYTICS DASHBOARD RESPONSE]: HTTP {res_dash.status_code}")
    assert res_dash.status_code == 200, f"Expected HTTP 200, got {res_dash.status_code}: {res_dash.text}"

    dash_data = res_dash.json()
    validated_dash = DashboardAnalyticsResponse.model_validate(dash_data)

    print(f"    - Total Complaints:      {validated_dash.total_complaints}")
    print(f"    - Active Cases:          {validated_dash.active_cases}")
    print(f"    - High Risk Alerts:      {validated_dash.high_risk_alerts}")
    print(f"    - Critical Risk Alerts:  {validated_dash.critical_risk_alerts}")
    print(f"    - States Monitored:      {len(validated_dash.state_wise_stats)}")
    print(f"    - Risk Categories:       {list(validated_dash.risk_distribution.keys())}")
    print(f"    - Emotion Metrics:       {list(validated_dash.emotion_distribution.keys())}")

    assert validated_dash.total_complaints >= 10, f"Expected total_complaints >= 10, got {validated_dash.total_complaints}"
    assert len(validated_dash.state_wise_stats) > 0, "Expected non-empty state_wise_stats"
    assert len(validated_dash.risk_distribution) > 0, "Expected non-empty risk_distribution"
    assert len(validated_dash.emotion_distribution) > 0, "Expected non-empty emotion_distribution"

    # 2. Alert Dispatch & Acknowledgment Workflow
    res_alerts = client.get("/api/alerts?status=OPEN")
    assert res_alerts.status_code == 200
    open_alerts = res_alerts.json()
    print(f"  [OPEN ALERTS RETRIEVED]: {len(open_alerts)} alert(s)")
    assert len(open_alerts) > 0, "Expected at least one OPEN emergency alert in system"

    target_alert = open_alerts[0]
    target_alert_id = target_alert["id"]
    print(f"    - Dispatching acknowledgment for Alert ID: {target_alert_id} (Level: {target_alert['alert_level']})")

    res_ack = client.patch(
        f"/api/alerts/{target_alert_id}/acknowledge",
        json={"status": "ACKNOWLEDGED"},
    )
    print(f"  [ALERT ACKNOWLEDGMENT RESPONSE]: HTTP {res_ack.status_code}")
    assert res_ack.status_code == 200, f"Expected HTTP 200, got {res_ack.status_code}: {res_ack.text}"

    ack_data = res_ack.json()
    assert ack_data["status"] == "ACKNOWLEDGED", f"Expected ACKNOWLEDGED, got {ack_data['status']}"
    assert ack_data["dispatched_at"] is not None, "Expected dispatched_at timestamp to be populated"
    print(f"    - Acknowledged At / Dispatched At: {ack_data['dispatched_at']}")

    print("Check 4 Status: [PASSED]")


# ==============================================================================
# Pytest Test Bindings
# ==============================================================================

def test_check_1_acoustic_feature_extraction():
    check_1_acoustic_feature_extraction()


def test_check_2_nlp_shap_and_svi_triage():
    check_2_nlp_shap_and_svi_triage()


def test_check_3_fastapi_complaint_endpoints():
    check_3_fastapi_complaint_endpoints()


def setup_test_db():
    """Ensure database schema is provisioned and seeded."""
    init_database()
    seed_database()


def test_check_1_acoustic_feature_extraction():
    setup_test_db()
    check_1_acoustic_feature_extraction()


def test_check_2_nlp_shap_and_svi_triage():
    setup_test_db()
    check_2_nlp_shap_and_svi_triage()


def test_check_3_fastapi_complaint_endpoints():
    setup_test_db()
    check_3_fastapi_complaint_endpoints()


def test_check_4_analytics_and_alert_dispatch():
    setup_test_db()
    check_4_analytics_and_alert_dispatch()


if __name__ == "__main__":
    print("=================================================================")
    print("TraumaSense AI - Step 3 Automated Verification Test Suite")
    print("=================================================================")
    try:
        setup_test_db()
        check_1_acoustic_feature_extraction()
        check_2_nlp_shap_and_svi_triage()
        check_3_fastapi_complaint_endpoints()
        check_4_analytics_and_alert_dispatch()
        print("\n=================================================================")
        print("ALL STEP 3 VERIFICATION CHECKS PASSED (100%)")
        print("=================================================================")
    except Exception as exc:
        print(f"\n[STEP 3 VERIFICATION FAILED]: {exc}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
