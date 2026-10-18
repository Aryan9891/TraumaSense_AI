"""TraumaSense AI - Stress Vulnerability Index (SVI) & Triage Engine

Calculates:
1. Multimodal / Text-only SVI Score (0.0 to 100.0)
2. Clinical Override Gating (Suicidal ideation >= 0.70 or acute violence threat)
3. Risk Category Assignment (LOW, MODERATE, HIGH, CRITICAL)
4. Prescriptive Intervention Recommendations
5. Emergency Alert Triggers (CRITICAL / HIGH)
"""

import logging
from typing import Dict, Any, Optional, List
from app.models.core import RiskCategory, ActionType, AlertLevel, AlertStatus

logger = logging.getLogger("traumasense.svi")


def compute_svi_and_triage(
    emotion_scores: Dict[str, float],
    trauma_scores: Dict[str, Any],
    acoustic_features: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Compute SVI score, triage severity category, and prescribe interventions."""
    # Extract dimensions
    fear = float(emotion_scores.get("fear", 0.0))
    panic = float(emotion_scores.get("panic", 0.0))
    anxiety = float(emotion_scores.get("anxiety", 0.0))
    peak_distress_emotion = max(fear, panic, anxiety)

    trauma_severity = float(trauma_scores.get("trauma_severity", 0.0))
    threat_severity = float(trauma_scores.get("threat_severity", 0.0))
    suicidal_ideation = float(trauma_scores.get("suicidal_ideation", 0.0))
    violence_indicators = bool(trauma_scores.get("violence_indicators", False))

    # Determine whether audio features are present
    has_audio = (
        acoustic_features is not None
        and acoustic_features.get("acoustic_distress_score") is not None
        and float(acoustic_features.get("duration_sec", 0.0)) > 0.0
    )

    if has_audio:
        acoustic_distress = float(acoustic_features.get("acoustic_distress_score", 0.0))
        raw_svi = 100.0 * (
            (0.30 * trauma_severity)
            + (0.25 * threat_severity)
            + (0.25 * suicidal_ideation)
            + (0.10 * peak_distress_emotion)
            + (0.10 * acoustic_distress)
        )
    else:
        raw_svi = 100.0 * (
            (0.35 * trauma_severity)
            + (0.30 * threat_severity)
            + (0.25 * suicidal_ideation)
            + (0.10 * peak_distress_emotion)
        )

    # Clinical Override: Acute suicidal ideation or imminent lethal violence
    is_clinical_override = False
    if suicidal_ideation >= 0.70 or (violence_indicators and threat_severity >= 0.75):
        raw_svi = max(raw_svi, 78.0)
        is_clinical_override = True

    svi_score = round(float(min(max(raw_svi, 0.0), 100.0)), 1)

    # Map SVI to Risk Category
    if svi_score >= 76.0:
        risk_category = RiskCategory.CRITICAL
    elif svi_score >= 51.0:
        risk_category = RiskCategory.HIGH
    elif svi_score >= 26.0:
        risk_category = RiskCategory.MODERATE
    else:
        risk_category = RiskCategory.LOW

    # Generate Prescriptive Interventions
    recommendations: List[Dict[str, Any]] = []

    if risk_category == RiskCategory.CRITICAL:
        recommendations.append({
            "action_type": ActionType.EMERGENCY_RESPONSE,
            "description": "Immediate armed emergency response and crisis rescue dispatch to victim's location.",
            "is_dispatched": True,
        })
        recommendations.append({
            "action_type": ActionType.WITNESS_PROTECTION,
            "description": "Emergency relocation to confidential crisis shelter for victim and immediate dependents.",
            "is_dispatched": False,
        })
        if suicidal_ideation >= 0.35:
            recommendations.append({
                "action_type": ActionType.MEDICAL_ASSISTANCE,
                "description": "Emergency psychiatric crisis team and hospital trauma assessment.",
                "is_dispatched": True,
            })
        if violence_indicators:
            recommendations.append({
                "action_type": ActionType.POLICE_INTERVENTION,
                "description": "Forensic evidence collection and emergency protection order enforcement.",
                "is_dispatched": True,
            })

    elif risk_category == RiskCategory.HIGH:
        recommendations.append({
            "action_type": ActionType.POLICE_INTERVENTION,
            "description": "Priority police inquiry and formal protection order filing.",
            "is_dispatched": False,
        })
        recommendations.append({
            "action_type": ActionType.LEGAL_AID,
            "description": "Fast-track legal counseling under protection of women and criminal harassment acts.",
            "is_dispatched": False,
        })
        recommendations.append({
            "action_type": ActionType.COUNSELLING,
            "description": "Clinical trauma counseling and emotional crisis stabilization.",
            "is_dispatched": False,
        })

    elif risk_category == RiskCategory.MODERATE:
        recommendations.append({
            "action_type": ActionType.LEGAL_AID,
            "description": "Legal aid counseling and official notice dispatch to perpetrators.",
            "is_dispatched": False,
        })
        recommendations.append({
            "action_type": ActionType.COUNSELLING,
            "description": "Trauma-informed mental health support and personalized safety planning.",
            "is_dispatched": False,
        })

    else:  # LOW
        recommendations.append({
            "action_type": ActionType.LEGAL_AID,
            "description": "Informational guidance regarding administrative and legal remedies.",
            "is_dispatched": False,
        })

    # Alert Trigger Logic
    requires_alert = risk_category in (RiskCategory.CRITICAL, RiskCategory.HIGH)
    alert_level = AlertLevel.CRITICAL if risk_category == RiskCategory.CRITICAL else (AlertLevel.HIGH if requires_alert else None)
    alert_status = AlertStatus.OPEN if requires_alert else None

    return {
        "svi_score": svi_score,
        "risk_category": risk_category,
        "is_clinical_override": is_clinical_override,
        "peak_distress_emotion": round(peak_distress_emotion, 2),
        "recommendations": recommendations,
        "requires_alert": requires_alert,
        "alert_level": alert_level,
        "alert_status": alert_status,
    }
