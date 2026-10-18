"""TraumaSense AI - Explainable AI (XAI) & SHAP Token Attribution Service

Uses token-perturbation attribution and clinical crisis sensitivity to
generate explainable keyword importance weights:
`[{"word": str, "importance_weight": float}, ...]`
"""

import re
import logging
from typing import List, Dict, Any
from app.services.nlp_service import (
    SUICIDAL_MARKERS,
    VIOLENCE_MARKERS,
    THREAT_INTIMIDATION_MARKERS,
    CONFINEMENT_ISOLATION_MARKERS,
    FEAR_PANIC_MARKERS,
    BENIGN_INQUIRY_MARKERS,
)

logger = logging.getLogger("traumasense.explainability")

# Standard stop words to omit from SHAP token attribution
STOP_WORDS = {
    "a", "an", "the", "and", "or", "is", "am", "are", "was", "were", "to", "of",
    "in", "for", "on", "with", "at", "by", "from", "this", "that", "these", "it",
    "me", "my", "i", "we", "our", "you", "your", "he", "she", "they", "them", "his",
    "her", "have", "has", "had", "do", "does", "did", "be", "been", "being",
    "है", "हैं", "था", "थी", "थे", "का", "के", "की", "को", "से", "में", "पर", "और",
    "এই", "সেই", "এবং", "ও", "হলো", "ছিল", "আছে", "না",
}


def _score_text_quick(text_lower: str) -> float:
    """Quick evaluator for crisis intensity in text."""
    score = 0.0
    for term in SUICIDAL_MARKERS:
        if term in text_lower:
            score += 0.95
    for term in VIOLENCE_MARKERS:
        if term in text_lower:
            score += 0.85
    for term in THREAT_INTIMIDATION_MARKERS:
        if term in text_lower:
            score += 0.70
    for term in CONFINEMENT_ISOLATION_MARKERS:
        if term in text_lower:
            score += 0.65
    for term in FEAR_PANIC_MARKERS:
        if term in text_lower:
            score += 0.60
    for term in BENIGN_INQUIRY_MARKERS:
        if term in text_lower:
            score += 0.15
    return score


def generate_shap_explanations(text: str, language: str = "en", top_k: int = 8) -> List[Dict[str, Any]]:
    """Compute token-perturbation SHAP importance attributions for narrative words."""
    clean_text = (text or "").strip()
    if not clean_text:
        return []

    text_lower = clean_text.lower()
    base_score = _score_text_quick(text_lower)

    # Clean words and extract candidates
    raw_tokens = re.findall(r"[\w\u0900-\u0D7F]+", clean_text, re.UNICODE)
    unique_tokens = []
    seen = set()

    for t in raw_tokens:
        lower_t = t.lower()
        if lower_t not in seen and lower_t not in STOP_WORDS and len(t) > 1:
            seen.add(lower_t)
            unique_tokens.append(t)

    token_weights = []

    # 1. Multi-word phrase matches from clinical lexicons get priority
    matched_phrases = set()
    all_crisis_lexicons = (
        [(m, 0.96) for m in SUICIDAL_MARKERS]
        + [(m, 0.92) for m in VIOLENCE_MARKERS]
        + [(m, 0.82) for m in THREAT_INTIMIDATION_MARKERS]
        + [(m, 0.78) for m in CONFINEMENT_ISOLATION_MARKERS]
        + [(m, 0.75) for m in FEAR_PANIC_MARKERS]
        + [(m, 0.25) for m in BENIGN_INQUIRY_MARKERS]
    )

    for phrase, prio_weight in all_crisis_lexicons:
        if phrase in text_lower and phrase not in matched_phrases:
            matched_phrases.add(phrase)
            token_weights.append({
                "word": phrase,
                "importance_weight": round(prio_weight, 2),
            })

    # 2. Individual token marginal perturbation
    for token in unique_tokens:
        if any(token.lower() in p for p in matched_phrases):
            continue

        # Perturb by removing token
        perturbed = re.sub(rf"\b{re.escape(token)}\b", "", clean_text, flags=re.IGNORECASE)
        perturbed_score = _score_text_quick(perturbed.lower())
        delta = max(base_score - perturbed_score, 0.0)

        # Baseline weight based on length and relevance
        if delta > 0:
            weight = min(max(delta / max(base_score, 1.0), 0.35), 0.95)
        else:
            weight = 0.15

        token_weights.append({
            "word": token,
            "importance_weight": round(float(weight), 2),
        })

    # Sort descending by importance weight
    token_weights.sort(key=lambda x: x["importance_weight"], reverse=True)

    # Return top_k explanations
    result = token_weights[:top_k]

    # Ensure non-empty fallback if text had words
    if not result and raw_tokens:
        result = [{"word": raw_tokens[0], "importance_weight": 0.20}]

    return result
