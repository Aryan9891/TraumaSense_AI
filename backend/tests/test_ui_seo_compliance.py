"""TraumaSense AI - Pytest Suite for UI/UX Humanization & Technical SEO Compliance."""

from tests.verify_ui_seo import (
    test_check_1_technical_seo_artifacts,
    test_check_2_jsonld_and_semantic_html,
    test_check_3_nextjs_build_and_routes,
    test_check_4_full_backend_frontend_parity,
)

__all__ = [
    "test_check_1_technical_seo_artifacts",
    "test_check_2_jsonld_and_semantic_html",
    "test_check_3_nextjs_build_and_routes",
    "test_check_4_full_backend_frontend_parity",
]
