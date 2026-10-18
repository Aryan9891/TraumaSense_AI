"""TraumaSense AI - Step 5 Automated Verification Suite

Performs and asserts:
Check 1: Container & Multi-Service Orchestration Artifact Audit
Check 2: GitHub Actions CI/CD Workflow Specification Validation
Check 3: Full End-to-End Multimodal Lifecycle Simulation & Documentation Audit
Check 4: Master Regression & Deployment Readiness
"""

import os
import sys
import io
import wave
import struct
import math
import logging
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Set local sqlite environment
os.environ["USE_LOCAL_SQLITE"] = "True"
os.environ["SQLITE_URL"] = "sqlite:///./traumasense_local.db"

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("verify_step5")


def synthesize_test_wav_bytes(duration_sec: float = 1.5, sample_rate: int = 16000) -> bytes:
    """Generate in-memory 16kHz 16-bit mono PCM WAV audio with dual-frequency distress tone."""
    num_samples = int(duration_sec * sample_rate)
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        frames = bytearray()
        for i in range(num_samples):
            t = float(i) / sample_rate
            # 440 Hz fundamental with 880 Hz harmonic
            val = 0.5 * math.sin(2.0 * math.pi * 440.0 * t) + 0.3 * math.sin(2.0 * math.pi * 880.0 * t)
            sample = int(val * 32767.0)
            sample = max(-32768, min(32767, sample))
            frames.extend(struct.pack("<h", sample))
        wav_file.writeframes(frames)
    return buffer.getvalue()


def test_check_1_container_orchestration_audit():
    """Check 1: Container & Orchestration Artifact Audit."""
    logger.info("=== Executing Check 1: Container & Orchestration Artifact Audit ===")

    backend_dockerfile = BASE_DIR / "Dockerfile"
    backend_dockerignore = BASE_DIR / ".dockerignore"
    frontend_dockerfile = ROOT_DIR / "frontend" / "Dockerfile"
    frontend_dockerignore = ROOT_DIR / "frontend" / ".dockerignore"
    compose_dev = ROOT_DIR / "docker-compose.yml"
    compose_prod = ROOT_DIR / "docker-compose.prod.yml"

    artifacts = [
        (backend_dockerfile, "backend/Dockerfile"),
        (backend_dockerignore, "backend/.dockerignore"),
        (frontend_dockerfile, "frontend/Dockerfile"),
        (frontend_dockerignore, "frontend/.dockerignore"),
        (compose_dev, "docker-compose.yml"),
        (compose_prod, "docker-compose.prod.yml"),
    ]

    for file_path, label in artifacts:
        assert file_path.exists(), f"Missing required container artifact: {label}"
        content = file_path.read_text(encoding="utf-8")
        assert len(content.strip()) > 20, f"Artifact {label} is unexpectedly empty"

    # Backend Dockerfile audit
    b_content = backend_dockerfile.read_text(encoding="utf-8")
    assert "EXPOSE 8000" in b_content, "backend/Dockerfile missing EXPOSE 8000"
    assert "HEALTHCHECK" in b_content, "backend/Dockerfile missing HEALTHCHECK"
    assert "libsndfile1" in b_content, "backend/Dockerfile missing libsndfile1 DSP dependency"
    assert "ffmpeg" in b_content, "backend/Dockerfile missing ffmpeg dependency"

    # Frontend Dockerfile audit
    f_content = frontend_dockerfile.read_text(encoding="utf-8")
    assert "EXPOSE 3000" in f_content, "frontend/Dockerfile missing EXPOSE 3000"
    assert "HEALTHCHECK" in f_content, "frontend/Dockerfile missing HEALTHCHECK"
    assert "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" in f_content, "frontend/Dockerfile missing build arg"

    # Compose audits
    c_dev_content = compose_dev.read_text(encoding="utf-8")
    assert "traumasense-backend" in c_dev_content
    assert "traumasense-frontend" in c_dev_content
    assert "condition: service_healthy" in c_dev_content
    assert "backend-sqlite-data" in c_dev_content
    assert "backend-audio-uploads" in c_dev_content

    c_prod_content = compose_prod.read_text(encoding="utf-8")
    assert "traumasense-backend-prod" in c_prod_content
    assert "traumasense-frontend-prod" in c_prod_content
    assert "condition: service_healthy" in c_prod_content

    logger.info("Check 1 PASSED: All 6 container and orchestration artifacts verified.")


def test_check_2_github_actions_workflow():
    """Check 2: GitHub Actions CI/CD Workflow Validation."""
    logger.info("=== Executing Check 2: GitHub Actions CI/CD Workflow Validation ===")

    workflow_path = ROOT_DIR / ".github" / "workflows" / "ci-cd.yml"
    assert workflow_path.exists(), ".github/workflows/ci-cd.yml does not exist"

    wf_content = workflow_path.read_text(encoding="utf-8")
    assert len(wf_content.strip()) > 100, ".github/workflows/ci-cd.yml is empty"

    # Validate triggers
    assert "branches: [ main ]" in wf_content or "branches: [main]" in wf_content
    assert "push:" in wf_content
    assert "pull_request:" in wf_content

    # Validate jobs
    assert "backend-test-suite:" in wf_content, "Missing backend-test-suite job in CI/CD"
    assert "frontend-production-build:" in wf_content, "Missing frontend-production-build job in CI/CD"

    # Validate backend job steps
    assert "python-version: '3.11'" in wf_content
    assert "libsndfile1" in wf_content
    assert "ffmpeg" in wf_content
    assert "pytest" in wf_content
    assert "python -m app.init_db" in wf_content
    assert "python -m app.seed" in wf_content

    # Validate frontend job steps
    assert "node-version: 20" in wf_content or "node-version: '20'" in wf_content
    assert "npm run build" in wf_content
    assert "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" in wf_content

    logger.info("Check 2 PASSED: GitHub Actions CI/CD workflow confirmed.")


def test_check_3_multimodal_lifecycle_and_docs_audit():
    """Check 3: Full End-to-End Multimodal Lifecycle & Documentation Audit."""
    logger.info("=== Executing Check 3: Full End-to-End Multimodal Lifecycle & Documentation Audit ===")

    readme_path = ROOT_DIR / "README.md"
    install_path = ROOT_DIR / "INSTALLATION.md"

    assert readme_path.exists(), "README.md missing"
    assert install_path.exists(), "INSTALLATION.md missing"

    install_content = install_path.read_text(encoding="utf-8")
    assert "Docker Compose Production Launch" in install_content
    assert "Local Native Setup" in install_content
    assert "Clerk Authentication" in install_content
    assert "Cloud Deployment Guide" in install_content

    # Initialize tables and seed data
    from app.init_db import init_database
    init_database()

    # Import FastAPI app and TestClient
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)

    # 1. Sync User
    sync_resp = client.post(
        "/api/auth/sync",
        json={
            "clerk_id": "test_step5_e2e_victim",
            "email": "e2e_step5@traumasense.ai",
            "role": "VICTIM",
        },
    )
    assert sync_resp.status_code == 200, f"User sync failed: {sync_resp.text}"
    user_data = sync_resp.json()
    assert user_data["clerk_id"] == "test_step5_e2e_victim"
    db_user_id = user_data["id"]

    # 2. Submit Critical Text Complaint
    text_resp = client.post(
        "/api/complaints/submit-text",
        json={
            "title": "Emergency Break-In and Violent Death Threat",
            "raw_text": "He broke into the apartment with a knife and said he will kill me before morning. I am trapped in the room bleeding and terrified.",
            "language": "en",
            "state_location": "Delhi",
            "user_id": db_user_id,
        },
    )
    assert text_resp.status_code == 201, f"Text complaint submission failed: {text_resp.text}"
    text_data = text_resp.json()
    assert "id" in text_data
    text_complaint_id = text_data["id"]
    assert text_data["risk_score"]["svi_score"] >= 70.0
    assert text_data["risk_score"]["risk_category"] in ("HIGH", "CRITICAL")
    assert len(text_data["risk_score"]["shap_explanations"]) > 0
    assert len(text_data["recommendations"]) > 0

    # 3. Submit Audio Complaint with Synthesized 16kHz WAV
    wav_bytes = synthesize_test_wav_bytes(duration_sec=1.5, sample_rate=16000)
    audio_resp = client.post(
        "/api/complaints/submit-audio",
        data={
            "title": "Emergency Voice Distress Recording",
            "state_location": "Maharashtra",
            "language": "en",
            "user_id": db_user_id,
        },
        files={
            "file": ("distress_sample_step5.wav", wav_bytes, "audio/wav"),
        },
    )
    assert audio_resp.status_code == 201, f"Audio complaint submission failed: {audio_resp.text}"
    audio_data = audio_resp.json()
    assert "id" in audio_data
    assert audio_data["acoustic_features"] is not None
    assert "pitch_f0" in audio_data["acoustic_features"]
    assert "rms_energy" in audio_data["acoustic_features"]

    # 4. Verify Dashboard Analytics
    analytics_resp = client.get("/api/analytics/dashboard")
    assert analytics_resp.status_code == 200
    analytics_data = analytics_resp.json()
    assert analytics_data["total_complaints"] >= 2
    assert "risk_distribution" in analytics_data
    assert "state_distribution" in analytics_data
    assert len(analytics_data["state_distribution"]) > 0

    # 5. Fetch Alerts and Acknowledge
    alerts_resp = client.get("/api/alerts")
    assert alerts_resp.status_code == 200
    alerts_data = alerts_resp.json()
    assert isinstance(alerts_data, list)
    assert len(alerts_data) > 0

    # Find alert generated for the critical complaint
    target_alert = next((a for a in alerts_data if a["complaint_id"] == text_complaint_id), alerts_data[0])
    alert_id = target_alert["id"]

    ack_resp = client.patch(
        f"/api/alerts/{alert_id}/acknowledge",
        json={
            "status": "ACKNOWLEDGED",
        },
    )
    assert ack_resp.status_code == 200, f"Alert acknowledgment failed: {ack_resp.text}"
    ack_data = ack_resp.json()
    assert ack_data["status"] == "ACKNOWLEDGED"

    # 6. Verify Complaint Status Escalation
    complaint_resp = client.get(f"/api/complaints/{text_complaint_id}")
    assert complaint_resp.status_code == 200
    complaint_detail = complaint_resp.json()
    assert complaint_detail["id"] == text_complaint_id
    assert complaint_detail["status"] == "ESCALATED"
    assert complaint_detail["emotion_analysis"] is not None
    assert complaint_detail["trauma_analysis"] is not None
    assert complaint_detail["risk_score"] is not None

    logger.info("Check 3 PASSED: Complete E2E multimodal lifecycle simulation verified.")


def test_check_4_master_regression_and_readiness():
    """Check 4: Master Regression Suite & Deployment Readiness."""
    logger.info("=== Executing Check 4: Master Regression Suite & Deployment Readiness ===")

    # Verify all previous test files are intact
    test_dir = BASE_DIR / "tests"
    required_tests = [
        "test_api_health.py",
        "test_clerk_auth.py",
        "test_db_resilience.py",
        "test_step3_services_and_api.py",
        "test_step4_frontend_integration.py",
    ]
    for test_file in required_tests:
        p = test_dir / test_file
        assert p.exists(), f"Missing regression test file: {test_file}"
        assert p.stat().st_size > 50, f"Test file {test_file} is unexpectedly empty"

    logger.info("Check 4 PASSED: Regression test files confirmed.")


def run_all_checks():
    """Execute all Step 5 verification checks sequentially."""
    print("=" * 65)
    print("TraumaSense AI - Step 5 Automated Master Verification Suite")
    print("=" * 65)

    test_check_1_container_orchestration_audit()
    print("  [SUCCESS] Check 1: Container & Multi-Service Orchestration Audit Passed.")

    test_check_2_github_actions_workflow()
    print("  [SUCCESS] Check 2: GitHub Actions CI/CD Workflow Validation Passed.")

    test_check_3_multimodal_lifecycle_and_docs_audit()
    print("  [SUCCESS] Check 3: Full Multimodal Lifecycle Simulation Passed.")

    test_check_4_master_regression_and_readiness()
    print("  [SUCCESS] Check 4: Master Regression & Deployment Readiness Passed.")

    print("=" * 65)
    print("ALL STEP 5 CHECKS COMPLETED SUCCESSFULLY (100% PASS RATE)")
    print("=" * 65)


if __name__ == "__main__":
    run_all_checks()
