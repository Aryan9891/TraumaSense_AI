"""TraumaSense AI - Idempotent Multi-Tier Database Seeder

Seeds:
1. 3 System Users: ADMIN, OFFICER, VICTIM
2. 8 Multimodal Complaints spanning:
   - All 4 SVI Risk Categories (LOW, MODERATE, HIGH, CRITICAL)
   - 8 Indian States (Delhi, Maharashtra, Jharkhand, West Bengal, Tamil Nadu, Odisha, Karnataka, Uttar Pradesh)
   - 7 Languages (en, hi, bn, mr, ta, te, or)
   - Complete linked trees: AudioFile, EmotionAnalysis, TraumaAnalysis, AcousticFeatures,
     RiskScore (with explainable SHAP array), Recommendations, and Alerts.
"""

import logging
from typing import Dict, Any, List
from datetime import datetime, timezone, timedelta
from app.db.session import SessionLocal
from app.init_db import init_database
from app.models.core import (
    User,
    UserRole,
    Complaint,
    ComplaintStatus,
    AudioFile,
    EmotionAnalysis,
    TraumaAnalysis,
    AcousticFeatures,
    RiskScore,
    RiskCategory,
    Recommendation,
    ActionType,
    Alert,
    AlertLevel,
    AlertStatus,
)

logger = logging.getLogger("traumasense.seed")

# Deterministic Seed User Identifiers
ADMIN_CLERK_ID = "clerk_admin_001"
OFFICER_CLERK_ID = "clerk_officer_001"
VICTIM_CLERK_ID = "clerk_victim_001"

SEED_COMPLAINT_TITLES = [
    "Severe physical abuse, stalking, and continuous death threats",
    "Forced confinement and repeated violent physical battery",
    "Domestic extortion and aggressive intimidation by in-laws",
    "Workplace stalking, blackmail, and sexual harassment",
    "Neighborhood verbal harassment and property boundary dispute",
    "Cyber harassment and unsolicited contact via messaging platforms",
    "Inquiry regarding past civil trespass report status",
    "Public noise nuisance and sound ordinance violation",
]


def seed_database() -> Dict[str, Any]:
    """Execute idempotent database seeding."""
    logger.info("Initializing tables before seeding...")
    init_database()

    db = SessionLocal()
    try:
        # ======================================================================
        # 1. Seed or Upsert Users
        # ======================================================================
        users_map = {}

        # Admin
        admin = db.query(User).filter(User.clerk_id == ADMIN_CLERK_ID).first()
        if not admin:
            admin = User(
                clerk_id=ADMIN_CLERK_ID,
                email="admin@traumasense.ai",
                role=UserRole.ADMIN,
            )
            db.add(admin)
        users_map["ADMIN"] = admin

        # Officer
        officer = db.query(User).filter(User.clerk_id == OFFICER_CLERK_ID).first()
        if not officer:
            officer = User(
                clerk_id=OFFICER_CLERK_ID,
                email="officer.sharma@traumasense.ai",
                role=UserRole.OFFICER,
            )
            db.add(officer)
        users_map["OFFICER"] = officer

        # Victim
        victim = db.query(User).filter(User.clerk_id == VICTIM_CLERK_ID).first()
        if not victim:
            victim = User(
                clerk_id=VICTIM_CLERK_ID,
                email="citizen.support@traumasense.ai",
                role=UserRole.VICTIM,
            )
            db.add(victim)
        users_map["VICTIM"] = victim

        db.flush()

        # ======================================================================
        # 2. Idempotent Clean-up of Existing Seed Complaints
        # ======================================================================
        existing_complaints = (
            db.query(Complaint)
            .filter(Complaint.title.in_(SEED_COMPLAINT_TITLES))
            .all()
        )
        for existing in existing_complaints:
            db.delete(existing)
        db.flush()

        now = datetime.now(timezone.utc)

        # ======================================================================
        # 3. Multi-Tier Complaint Definitions
        # ======================================================================

        complaints_data = [
            # ------------------------------------------------------------------
            # 1. CRITICAL Tier - Jharkhand (Hindi)
            # ------------------------------------------------------------------
            {
                "title": SEED_COMPLAINT_TITLES[0],
                "raw_text": "मेरा पूर्व पति मुझे और मेरे बच्चों को जान से मारने की धमकी दे रहा है। उसने कल रात हमारे घर का दरवाज़ा तोड़ने की कोशिश की और चाकू दिखाकर डराया। हम कमरे में बंद हैं और बहुत डरे हुए हैं।",
                "audio_file_url": "/uploads/audio/jharkhand_distress_01.wav",
                "language": "hi",
                "status": ComplaintStatus.ESCALATED,
                "state_location": "Jharkhand",
                "created_at": now - timedelta(hours=2),
                "audio": {
                    "storage_path": "uploads/audio/jharkhand_distress_01.wav",
                    "duration_sec": 42.5,
                    "sample_rate": 16000,
                },
                "emotion": {
                    "fear": 0.95, "panic": 0.92, "anger": 0.35,
                    "sadness": 0.80, "anxiety": 0.94, "neutral": 0.02,
                },
                "trauma": {
                    "violence_indicators": True,
                    "intimidation": 0.96,
                    "social_isolation": 0.88,
                    "suicidal_ideation": 0.65,
                    "confidence_score": 0.97,
                },
                "acoustic": {
                    "pitch_f0": 285.4,
                    "rms_energy": 0.78,
                    "zcr": 0.18,
                    "pause_ratio": 0.32,
                    "spectral_centroid": 3120.5,
                },
                "risk": {
                    "svi_score": 94.5,
                    "risk_category": RiskCategory.CRITICAL,
                    "shap_explanations": [
                        {"word": "जान से मारने (kill)", "importance_weight": 0.95},
                        {"word": "चाकू (knife)", "importance_weight": 0.91},
                        {"word": "तोड़ने (break in)", "importance_weight": 0.82},
                        {"word": "धमकी (threat)", "importance_weight": 0.88},
                    ],
                },
                "recommendations": [
                    {
                        "action_type": ActionType.EMERGENCY_RESPONSE,
                        "description": "Immediate armed police dispatch to victim's residential location in Ranchi district.",
                        "is_dispatched": True,
                    },
                    {
                        "action_type": ActionType.WITNESS_PROTECTION,
                        "description": "Emergency relocation to secure women's crisis shelter for mother and minor children.",
                        "is_dispatched": False,
                    },
                ],
                "alerts": [
                    {
                        "alert_level": AlertLevel.CRITICAL,
                        "status": AlertStatus.OPEN,
                        "dispatched_at": now - timedelta(hours=1, minutes=50),
                    }
                ],
            },
            # ------------------------------------------------------------------
            # 2. CRITICAL Tier - Uttar Pradesh (English)
            # ------------------------------------------------------------------
            {
                "title": SEED_COMPLAINT_TITLES[1],
                "raw_text": "I have been locked inside the basement for three days without food. He attacked me with a heavy iron rod and threatened to burn down the house if I called the police. I managed to find this phone.",
                "audio_file_url": "/uploads/audio/up_battery_02.wav",
                "language": "en",
                "status": ComplaintStatus.PENDING,
                "state_location": "Uttar Pradesh",
                "created_at": now - timedelta(hours=1),
                "audio": {
                    "storage_path": "uploads/audio/up_battery_02.wav",
                    "duration_sec": 36.2,
                    "sample_rate": 16000,
                },
                "emotion": {
                    "fear": 0.91, "panic": 0.89, "anger": 0.40,
                    "sadness": 0.85, "anxiety": 0.90, "neutral": 0.03,
                },
                "trauma": {
                    "violence_indicators": True,
                    "intimidation": 0.94,
                    "social_isolation": 0.95,
                    "suicidal_ideation": 0.72,
                    "confidence_score": 0.95,
                },
                "acoustic": {
                    "pitch_f0": 272.1,
                    "rms_energy": 0.69,
                    "zcr": 0.16,
                    "pause_ratio": 0.38,
                    "spectral_centroid": 2980.0,
                },
                "risk": {
                    "svi_score": 88.0,
                    "risk_category": RiskCategory.CRITICAL,
                    "shap_explanations": [
                        {"word": "locked", "importance_weight": 0.92},
                        {"word": "iron rod", "importance_weight": 0.96},
                        {"word": "burn down", "importance_weight": 0.89},
                        {"word": "threatened", "importance_weight": 0.85},
                    ],
                },
                "recommendations": [
                    {
                        "action_type": ActionType.POLICE_INTERVENTION,
                        "description": "Immediate distress dispatch and forensic rescue team for forcible confinement.",
                        "is_dispatched": True,
                    },
                    {
                        "action_type": ActionType.MEDICAL_ASSISTANCE,
                        "description": "Emergency paramedic dispatch for blunt force trauma and severe dehydration.",
                        "is_dispatched": False,
                    },
                ],
                "alerts": [
                    {
                        "alert_level": AlertLevel.CRITICAL,
                        "status": AlertStatus.OPEN,
                        "dispatched_at": now - timedelta(minutes=50),
                    }
                ],
            },
            # ------------------------------------------------------------------
            # 3. HIGH Tier - West Bengal (Bengali)
            # ------------------------------------------------------------------
            {
                "title": SEED_COMPLAINT_TITLES[2],
                "raw_text": "আমার শ্বশুরবাড়ির লোকজন যৌতুকের জন্য প্রতিদিন আমাকে মানসিক ও শারীরিকভাবে নির্যাতন করছে। আমাকে বাবার বাড়ি যেতে দিচ্ছে না এবং হুমকি দিচ্ছে।",
                "audio_file_url": "/uploads/audio/wb_dowry_03.wav",
                "language": "bn",
                "status": ComplaintStatus.IN_REVIEW,
                "state_location": "West Bengal",
                "created_at": now - timedelta(days=1),
                "audio": {
                    "storage_path": "uploads/audio/wb_dowry_03.wav",
                    "duration_sec": 55.0,
                    "sample_rate": 16000,
                },
                "emotion": {
                    "fear": 0.76, "panic": 0.62, "anger": 0.68,
                    "sadness": 0.79, "anxiety": 0.81, "neutral": 0.08,
                },
                "trauma": {
                    "violence_indicators": True,
                    "intimidation": 0.78,
                    "social_isolation": 0.82,
                    "suicidal_ideation": 0.25,
                    "confidence_score": 0.89,
                },
                "acoustic": {
                    "pitch_f0": 235.8,
                    "rms_energy": 0.55,
                    "zcr": 0.13,
                    "pause_ratio": 0.24,
                    "spectral_centroid": 2450.2,
                },
                "risk": {
                    "svi_score": 68.5,
                    "risk_category": RiskCategory.HIGH,
                    "shap_explanations": [
                        {"word": "যৌতুক (dowry)", "importance_weight": 0.82},
                        {"word": "নির্যাতন (torture)", "importance_weight": 0.88},
                        {"word": "হুমকি (threat)", "importance_weight": 0.74},
                    ],
                },
                "recommendations": [
                    {
                        "action_type": ActionType.LEGAL_AID,
                        "description": "Fast-track legal counseling under Protection of Women from Domestic Violence Act.",
                        "is_dispatched": False,
                    },
                    {
                        "action_type": ActionType.COUNSELLING,
                        "description": "Psychological crisis counseling session with trauma-informed therapist.",
                        "is_dispatched": False,
                    },
                ],
                "alerts": [
                    {
                        "alert_level": AlertLevel.HIGH,
                        "status": AlertStatus.OPEN,
                        "dispatched_at": None,
                    }
                ],
            },
            # ------------------------------------------------------------------
            # 4. HIGH Tier - Odisha (Odia)
            # ------------------------------------------------------------------
            {
                "title": SEED_COMPLAINT_TITLES[3],
                "raw_text": "ମୋର ଉପରିସ୍ଥ ଅଧିକାରୀ ମୋତେ ବାରମ୍ବାର ଅଶ୍ଳୀଳ ମେସେଜ ପଠାଉଛନ୍ତି ଏବଂ ଚାକିରିରୁ ବାହାର କରିଦେବାକୁ ଧମକ ଦେଉଛନ୍ତି। ମୁଁ ବହୁତ ଚାପରେ ଅଛି।",
                "audio_file_url": "/uploads/audio/odisha_harass_04.wav",
                "language": "or",
                "status": ComplaintStatus.PENDING,
                "state_location": "Odisha",
                "created_at": now - timedelta(days=2),
                "audio": {
                    "storage_path": "uploads/audio/odisha_harass_04.wav",
                    "duration_sec": 48.0,
                    "sample_rate": 16000,
                },
                "emotion": {
                    "fear": 0.68, "panic": 0.58, "anger": 0.72,
                    "sadness": 0.64, "anxiety": 0.83, "neutral": 0.11,
                },
                "trauma": {
                    "violence_indicators": False,
                    "intimidation": 0.81,
                    "social_isolation": 0.60,
                    "suicidal_ideation": 0.18,
                    "confidence_score": 0.86,
                },
                "acoustic": {
                    "pitch_f0": 218.4,
                    "rms_energy": 0.48,
                    "zcr": 0.12,
                    "pause_ratio": 0.21,
                    "spectral_centroid": 2310.0,
                },
                "risk": {
                    "svi_score": 59.0,
                    "risk_category": RiskCategory.HIGH,
                    "shap_explanations": [
                        {"word": "ଅଶ୍ଳୀଳ ମେସେଜ (harassment)", "importance_weight": 0.79},
                        {"word": "ଧମକ (threat)", "importance_weight": 0.84},
                    ],
                },
                "recommendations": [
                    {
                        "action_type": ActionType.LEGAL_AID,
                        "description": "Workplace harassment complaint filing with Internal Complaints Committee (POSH).",
                        "is_dispatched": False,
                    },
                ],
                "alerts": [
                    {
                        "alert_level": AlertLevel.HIGH,
                        "status": AlertStatus.ACKNOWLEDGED,
                        "dispatched_at": now - timedelta(days=1),
                    }
                ],
            },
            # ------------------------------------------------------------------
            # 5. MODERATE Tier - Maharashtra (Marathi)
            # ------------------------------------------------------------------
            {
                "title": SEED_COMPLAINT_TITLES[4],
                "raw_text": "आमच्या शेजाऱ्यांनी सीमा भिंतीवरून जोरदार वाद घातला आणि मला व माझ्या आईला अपमानास्पद शब्द वापरले. आम्हाला असुरक्षित वाटत आहे.",
                "audio_file_url": "/uploads/audio/mh_dispute_05.wav",
                "language": "mr",
                "status": ComplaintStatus.IN_REVIEW,
                "state_location": "Maharashtra",
                "created_at": now - timedelta(days=3),
                "audio": {
                    "storage_path": "uploads/audio/mh_dispute_05.wav",
                    "duration_sec": 62.4,
                    "sample_rate": 16000,
                },
                "emotion": {
                    "fear": 0.38, "panic": 0.25, "anger": 0.75,
                    "sadness": 0.35, "anxiety": 0.52, "neutral": 0.22,
                },
                "trauma": {
                    "violence_indicators": False,
                    "intimidation": 0.48,
                    "social_isolation": 0.20,
                    "suicidal_ideation": 0.02,
                    "confidence_score": 0.81,
                },
                "acoustic": {
                    "pitch_f0": 195.0,
                    "rms_energy": 0.42,
                    "zcr": 0.09,
                    "pause_ratio": 0.18,
                    "spectral_centroid": 1980.5,
                },
                "risk": {
                    "svi_score": 42.0,
                    "risk_category": RiskCategory.MODERATE,
                    "shap_explanations": [
                        {"word": "अपमानास्पद (abusive)", "importance_weight": 0.58},
                        {"word": "वाद (dispute)", "importance_weight": 0.44},
                    ],
                },
                "recommendations": [
                    {
                        "action_type": ActionType.POLICE_INTERVENTION,
                        "description": "Local beat officer mediation to issue formal community conduct notice.",
                        "is_dispatched": False,
                    },
                ],
                "alerts": [],
            },
            # ------------------------------------------------------------------
            # 6. MODERATE Tier - Tamil Nadu (Tamil)
            # ------------------------------------------------------------------
            {
                "title": SEED_COMPLAINT_TITLES[5],
                "raw_text": "தெரியாத எண்ணிலிருந்து தொடர்ந்து குறுஞ்செய்திகள் வருகின்றன. நிறுத்துமாறு கூறியும் அவர்கள் கேட்பதில்லை. எனக்கு பயமாக இருக்கிறது.",
                "audio_file_url": "/uploads/audio/tn_cyber_06.wav",
                "language": "ta",
                "status": ComplaintStatus.PENDING,
                "state_location": "Tamil Nadu",
                "created_at": now - timedelta(days=4),
                "audio": {
                    "storage_path": "uploads/audio/tn_cyber_06.wav",
                    "duration_sec": 38.0,
                    "sample_rate": 16000,
                },
                "emotion": {
                    "fear": 0.45, "panic": 0.28, "anger": 0.55,
                    "sadness": 0.32, "anxiety": 0.62, "neutral": 0.25,
                },
                "trauma": {
                    "violence_indicators": False,
                    "intimidation": 0.42,
                    "social_isolation": 0.15,
                    "suicidal_ideation": 0.0,
                    "confidence_score": 0.83,
                },
                "acoustic": {
                    "pitch_f0": 205.3,
                    "rms_energy": 0.39,
                    "zcr": 0.10,
                    "pause_ratio": 0.16,
                    "spectral_centroid": 2050.0,
                },
                "risk": {
                    "svi_score": 35.5,
                    "risk_category": RiskCategory.MODERATE,
                    "shap_explanations": [
                        {"word": "குறுஞ்செய்திகள் (messages)", "importance_weight": 0.49},
                        {"word": "பயமாக (fear)", "importance_weight": 0.52},
                    ],
                },
                "recommendations": [
                    {
                        "action_type": ActionType.LEGAL_AID,
                        "description": "Advisory support to report unsolicited contact to National Cyber Crime portal.",
                        "is_dispatched": False,
                    },
                ],
                "alerts": [],
            },
            # ------------------------------------------------------------------
            # 7. LOW Tier - Delhi (English)
            # ------------------------------------------------------------------
            {
                "title": SEED_COMPLAINT_TITLES[6],
                "raw_text": "I filed a formal report regarding trespass on our shared commercial driveway last month. I am writing to inquire if the civic authorities have scheduled an inspection.",
                "audio_file_url": "/uploads/audio/delhi_inquiry_07.wav",
                "language": "en",
                "status": ComplaintStatus.RESOLVED,
                "state_location": "Delhi",
                "created_at": now - timedelta(days=6),
                "audio": {
                    "storage_path": "uploads/audio/delhi_inquiry_07.wav",
                    "duration_sec": 28.5,
                    "sample_rate": 16000,
                },
                "emotion": {
                    "fear": 0.08, "panic": 0.02, "anger": 0.20,
                    "sadness": 0.05, "anxiety": 0.18, "neutral": 0.82,
                },
                "trauma": {
                    "violence_indicators": False,
                    "intimidation": 0.10,
                    "social_isolation": 0.05,
                    "suicidal_ideation": 0.0,
                    "confidence_score": 0.92,
                },
                "acoustic": {
                    "pitch_f0": 160.2,
                    "rms_energy": 0.28,
                    "zcr": 0.06,
                    "pause_ratio": 0.12,
                    "spectral_centroid": 1650.0,
                },
                "risk": {
                    "svi_score": 18.0,
                    "risk_category": RiskCategory.LOW,
                    "shap_explanations": [
                        {"word": "inspection", "importance_weight": 0.22},
                        {"word": "trespass", "importance_weight": 0.28},
                    ],
                },
                "recommendations": [
                    {
                        "action_type": ActionType.LEGAL_AID,
                        "description": "Provide official municipal hearing docket number and civic inspector contact.",
                        "is_dispatched": True,
                    },
                ],
                "alerts": [],
            },
            # ------------------------------------------------------------------
            # 8. LOW Tier - Karnataka (Telugu)
            # ------------------------------------------------------------------
            {
                "title": SEED_COMPLAINT_TITLES[7],
                "raw_text": "రాత్రి 11 గంటల తర్వాత కూడా సమీపంలోని వేడుక హాలులో పెద్ద శబ్దంతో సంగీతం ప్లే చేస్తున్నారు. ఇది విద్యార్థుల పరీక్షలకు ఇబ్బందిగా ఉంది.",
                "audio_file_url": "/uploads/audio/ka_noise_08.wav",
                "language": "te",
                "status": ComplaintStatus.RESOLVED,
                "state_location": "Karnataka",
                "created_at": now - timedelta(days=7),
                "audio": {
                    "storage_path": "uploads/audio/ka_noise_08.wav",
                    "duration_sec": 31.0,
                    "sample_rate": 16000,
                },
                "emotion": {
                    "fear": 0.05, "panic": 0.01, "anger": 0.32,
                    "sadness": 0.04, "anxiety": 0.12, "neutral": 0.88,
                },
                "trauma": {
                    "violence_indicators": False,
                    "intimidation": 0.05,
                    "social_isolation": 0.02,
                    "suicidal_ideation": 0.0,
                    "confidence_score": 0.94,
                },
                "acoustic": {
                    "pitch_f0": 152.0,
                    "rms_energy": 0.24,
                    "zcr": 0.05,
                    "pause_ratio": 0.10,
                    "spectral_centroid": 1520.0,
                },
                "risk": {
                    "svi_score": 12.5,
                    "risk_category": RiskCategory.LOW,
                    "shap_explanations": [
                        {"word": "శబ్దం (noise)", "importance_weight": 0.25},
                        {"word": "సంగీతం (music)", "importance_weight": 0.15},
                    ],
                },
                "recommendations": [
                    {
                        "action_type": ActionType.POLICE_INTERVENTION,
                        "description": "Standard advisory notice issued to event venue regarding noise decibel limits.",
                        "is_dispatched": True,
                    },
                ],
                "alerts": [],
            },
        ]

        # Associate victim user with complaints (or alternate for diversity)
        for c_data in complaints_data:
            complaint = Complaint(
                user_id=users_map["VICTIM"].id,
                title=c_data["title"],
                raw_text=c_data["raw_text"],
                audio_file_url=c_data["audio_file_url"],
                language=c_data["language"],
                status=c_data["status"],
                state_location=c_data["state_location"],
                created_at=c_data["created_at"],
            )

            # Child 1: AudioFile
            complaint.audio_file = AudioFile(**c_data["audio"])

            # Child 2: EmotionAnalysis
            complaint.emotion_analysis = EmotionAnalysis(**c_data["emotion"])

            # Child 3: TraumaAnalysis
            complaint.trauma_analysis = TraumaAnalysis(**c_data["trauma"])

            # Child 4: AcousticFeatures
            complaint.acoustic_features = AcousticFeatures(**c_data["acoustic"])

            # Child 5: RiskScore
            complaint.risk_score = RiskScore(**c_data["risk"])

            # Child 6: Recommendations
            for r_info in c_data["recommendations"]:
                complaint.recommendations.append(Recommendation(**r_info))

            # Child 7: Alerts
            for a_info in c_data["alerts"]:
                complaint.alerts.append(Alert(**a_info))

            db.add(complaint)

        db.commit()

        # Telemetry
        user_count = db.query(User).count()
        complaint_count = db.query(Complaint).count()
        alert_count = db.query(Alert).count()
        critical_count = (
            db.query(RiskScore)
            .filter(RiskScore.risk_category == RiskCategory.CRITICAL)
            .count()
        )

        logger.info(
            f"Database seeded successfully. Total Users: {user_count}, "
            f"Complaints: {complaint_count}, Critical: {critical_count}, Alerts: {alert_count}"
        )

        return {
            "status": "success",
            "users_count": user_count,
            "complaints_count": complaint_count,
            "critical_risk_count": critical_count,
            "alerts_count": alert_count,
        }

    except Exception as exc:
        db.rollback()
        logger.error(f"Seeding failed: {exc}")
        raise exc
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    seed_database()
