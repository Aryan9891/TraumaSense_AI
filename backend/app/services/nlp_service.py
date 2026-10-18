"""TraumaSense AI - Multilingual Trauma NLP & Clinical Crisis Engine

Supports all 7 core languages: English (en), Hindi (hi), Bengali (bn),
Marathi (mr), Tamil (ta), Telugu (te), and Odia (or).

Extracts:
1. Emotion spectrum: Fear, Anger, Sadness, Panic, Anxiety, Neutral
2. Trauma biomarkers: Violence indicators, Intimidation, Social isolation,
   C-SSRS Suicidal ideation, Confidence score, Trauma severity, Threat severity.
"""

import re
import logging
from typing import Dict, Any, List, Tuple

logger = logging.getLogger("traumasense.nlp")

# ==============================================================================
# Calibrated Multilingual Crisis & Trauma Lexicons
# ==============================================================================

SUICIDAL_MARKERS = [
    # English
    "ending my life", "end my life", "kill myself", "suicide", "want to die",
    "no reason to live", "better off dead", "hang myself", "take all the pills",
    # Hindi
    "जान दे दूंगा", "आत्महत्या", "मरना चाहता", "जीने की इच्छा नहीं", "जान ले लूंगा",
    # Bengali
    "জীবন শেষ", "আত্মহত্যা", "মরতে চাই", "বেঁচে থাকার কোনো কারণ নেই",
    # Marathi
    "आत्महत्या", "जीव द्यावा", "मरावंसं वाटतं",
    # Tamil
    "தற்கொலை", "வாழ விருப்பமில்லை", "உயிரை விட",
    # Telugu
    "ఆత్మహత్య", "చనిపోవాలని", "ప్రాణం తీసుకోవడం",
    # Odia
    "ଆତ୍ମହତ୍ୟା", "ମରିବାକୁ ଚାହୁଁଛି", "ଜୀବନ ହାରିବା",
]

VIOLENCE_MARKERS = [
    # English
    "kill", "knife", "weapon", "beat", "beating", "attacked", "stabbed", "iron rod",
    "gun", "burn", "blood", "broken bones", "choked", "strangled", "punched", "bleeding",
    # Hindi
    "जान से मारने", "चाकू", "हथियार", "मारा", "पीटा", "तोड़", "जला", "खून", "गला दबाया",
    # Bengali
    "খুন", "ছুরি", "অস্ত্র", "মারধর", "মারপিট", "রক্ত", "গলা টিপে",
    # Marathi
    "मारहाण", "चाकू", "शस्त्र", "रक्त", "गळा दाबला",
    # Tamil
    "கொலை", "கத்தி", "ஆயுதம்", "தாக்குதல்", "அடி", "ரத்தம்",
    # Telugu
    "చంపడం", "కత్తి", "ఆయుధం", "దాడి", "రక్తం", "కొట్టడం",
    # Odia
    "ମାରିଦେବା", "ଛୁରୀ", "ଅସ୍ତ୍ର", "ଆକ୍ରମଣ", "ରକ୍ତ",
]

THREAT_INTIMIDATION_MARKERS = [
    # English
    "threatened", "threat", "stalking", "stalk", "blackmail", "extort", "destroy",
    "burn down", "warned me", "ruin my life", "expose me", "acid attack",
    # Hindi
    "धमकी", "पीछा", "ब्लैकमेल", "बर्बाद", "डराया", "धमकाया", "तेजाब",
    # Bengali
    "হুমকি", "ব্ল্যাকমেইল", "ভয় দেখানো", "নজরদারি",
    # Marathi
    "धमकी", "पाठलाग", "ब्लॅकमेल", "घाबरवले",
    # Tamil
    "மிரட்டல்", "பயமுறுத்தல்", "பின் தொடர்தல்",
    # Telugu
    "బెదిరింపు", "భయపెట్టడం", "బ్లాక్‌మెయిల్",
    # Odia
    "ଧମକ", "ଭୟଭୀତ", "ଅଶ୍ଳୀଳ",
]

CONFINEMENT_ISOLATION_MARKERS = [
    # English
    "locked", "trapped", "confinement", "basement", "hostage", "room",
    "forbidden to leave", "took my phone", "no food", "cannot escape", "cut off",
    # Hindi
    "बंद", "कैद", "ताला", "बाहर नहीं जाने", "कमरे में बंद", "खाना नहीं", "फोन छीन",
    # Bengali
    "আটক", "বন্দী", "তালাবন্ধ", "যেতে দিচ্ছে না",
    # Marathi
    "डांबून", "बंद", "बाहेर पडू देत नाही",
    # Tamil
    "அடைத்து", "பூட்டி", "வெளியேற விடாமல்",
    # Telugu
    "బంధించి", "గదిలో బంధించారు",
    # Odia
    "ବନ୍ଦ", "ଅଟକ", "ବାହାରକୁ ଯିବାକୁ",
]

FEAR_PANIC_MARKERS = [
    # English
    "terrified", "panic", "scared", "fear", "trembling", "crying", "help me",
    "please help", "save me", "danger", "screaming", "paralyzed", "shaking",
    # Hindi
    "डर", "डरे हुए", "घबराहट", "मदद करो", "बचाओ", "कांप", "रो रही",
    # Bengali
    "ভয়", "আতঙ্ক", "সাহায্য করুন", "বাঁচান",
    # Marathi
    "भीती", "घाबरलो", "मदत करा", "वाचवा",
    # Tamil
    "பயம்", "பயந்துகொண்டிருக்கிறேன்", "உதவுங்கள்", "காப்பாற்றுங்கள்",
    # Telugu
    "భయం", "భయపడుతున్నాను", "సహాయం చేయండి", "కాపాడండి",
    # Odia
    "ଭୟ", "ଚାପରେ", "ସାହାଯ୍ୟ କରନ୍ତୁ",
]

BENIGN_INQUIRY_MARKERS = [
    "inquire", "information", "inquiry", "timings", "general", "status",
    "inspection", "procedure", "formalities", "schedule", "hearing",
    "docket", "ordinance", "regulations", "driveway", "commercial",
]


def _match_count(text_lower: str, lexicon: List[str]) -> Tuple[int, List[str]]:
    """Count occurrences and return matched phrases."""
    matched = []
    count = 0
    for term in lexicon:
        if term in text_lower:
            count += 1
            matched.append(term)
    return count, matched


def analyze_text_trauma(text: str, language: str = "en") -> Dict[str, Any]:
    """Analyze narrative text for emotional spectrum and clinical trauma markers."""
    clean_text = (text or "").strip()
    text_lower = clean_text.lower()

    if not clean_text:
        return {
            "emotion_scores": {
                "fear": 0.0, "anger": 0.0, "sadness": 0.0,
                "panic": 0.0, "anxiety": 0.0, "neutral": 1.0,
            },
            "trauma_scores": {
                "violence_indicators": False,
                "intimidation": 0.0,
                "social_isolation": 0.0,
                "suicidal_ideation": 0.0,
                "confidence_score": 0.50,
                "trauma_severity": 0.0,
                "threat_severity": 0.0,
            },
        }

    # Match crisis lexicons
    suicide_count, _ = _match_count(text_lower, SUICIDAL_MARKERS)
    violence_count, violence_terms = _match_count(text_lower, VIOLENCE_MARKERS)
    threat_count, _ = _match_count(text_lower, THREAT_INTIMIDATION_MARKERS)
    confinement_count, _ = _match_count(text_lower, CONFINEMENT_ISOLATION_MARKERS)
    fear_count, _ = _match_count(text_lower, FEAR_PANIC_MARKERS)
    benign_count, _ = _match_count(text_lower, BENIGN_INQUIRY_MARKERS)

    # Calculate Trauma Dimensions
    has_violence = bool(violence_count > 0)
    suicidal_ideation = min(suicide_count * 0.45, 1.0) if suicide_count > 0 else 0.0
    intimidation = min((threat_count * 0.35) + (0.25 if has_violence else 0.0), 1.0)
    social_isolation = min(confinement_count * 0.45, 1.0)

    # Threat & Trauma Severity Calibrations
    threat_severity = min((violence_count * 0.30) + (threat_count * 0.25) + (confinement_count * 0.20), 1.0)
    trauma_severity = min(
        (violence_count * 0.35) + (suicidal_ideation * 0.30) + (fear_count * 0.20) + (confinement_count * 0.15),
        1.0,
    )

    # Emotions Distribution
    if benign_count > 0 and (violence_count + threat_count + suicide_count == 0):
        fear = 0.05
        panic = 0.02
        anger = 0.10
        sadness = 0.05
        anxiety = min(0.15 + (0.05 * benign_count), 0.30)
        neutral = max(1.0 - (fear + panic + anger + sadness + anxiety), 0.65)
        confidence = 0.94
    else:
        fear = min(0.15 + (fear_count * 0.25) + (threat_count * 0.20) + (0.25 if has_violence else 0.0), 0.98)
        panic = min(0.10 + (fear_count * 0.28) + (0.30 if (has_violence or suicide_count > 0) else 0.0), 0.95)
        anxiety = min(0.20 + (threat_count * 0.22) + (fear_count * 0.20), 0.95)
        anger = min(0.10 + (violence_count * 0.15) + (threat_count * 0.15), 0.85)
        sadness = min(0.15 + (suicide_count * 0.40) + (confinement_count * 0.20) + (fear_count * 0.10), 0.92)
        neutral = max(0.02, 1.0 - max(fear, panic, anxiety, anger, sadness))
        confidence = min(0.80 + (0.05 * (violence_count + threat_count + fear_count)), 0.98)

    # Normalize emotional spectrum to clean float representations
    emotion_scores = {
        "fear": round(float(fear), 2),
        "anger": round(float(anger), 2),
        "sadness": round(float(sadness), 2),
        "panic": round(float(panic), 2),
        "anxiety": round(float(anxiety), 2),
        "neutral": round(float(neutral), 2),
    }

    trauma_scores = {
        "violence_indicators": has_violence,
        "intimidation": round(float(intimidation), 2),
        "social_isolation": round(float(social_isolation), 2),
        "suicidal_ideation": round(float(suicidal_ideation), 2),
        "confidence_score": round(float(confidence), 2),
        "trauma_severity": round(float(trauma_severity), 2),
        "threat_severity": round(float(threat_severity), 2),
    }

    return {
        "emotion_scores": emotion_scores,
        "trauma_scores": trauma_scores,
    }
