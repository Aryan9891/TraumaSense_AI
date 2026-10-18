# Contributing to TraumaSense AI

Thank you for your interest in contributing to **TraumaSense AI**! We welcome contributions to our multimodal clinical triage algorithms, acoustic signal processing pipelines, explainable AI attribution models, and responsive web portal.

---

## 🧭 Repository Quick Links

| Document | Purpose |
| :--- | :--- |
| 📖 [**README.md**](README.md) | Platform overview, interactive Mermaid architecture & clinical pipeline diagrams |
| 🧪 [**TESTING.md**](TESTING.md) | **Complete 22/22 Pytest test matrix, E2E lifecycle sequence, and verification reports** |
| 🚀 [**INSTALLATION.md**](INSTALLATION.md) | Local native setup, Docker production cluster launch, and cloud deployment runbook |
| ⚖️ [**LICENSE**](LICENSE) | MIT Open-Source License |

---

## 🧪 Testing & Quality Assurance Guidelines

All code changes submitted via Pull Request must adhere to our strict verification standards and pass 100% of the regression test suite.

### 1. Running the Automated Test Suite

Before opening a pull request, run the master Pytest suite locally:

```bash
# Set local environment variables
export USE_LOCAL_SQLITE=True
export PYTHONPATH=./backend

# Run all 22 unit & integration tests
python -m pytest backend/tests -v
```

### 2. Validating Frontend Production Compilation

Verify that Next.js 15 compiles with zero TypeScript or ESLint errors:

```bash
cd frontend
npm install --legacy-peer-deps
npm run build
```

### 3. Detailed Test Matrix

Refer to [TESTING.md](TESTING.md) for the comprehensive breakdown of all 22 test functions spanning:
- **FastAPI Core & Resilience**: Database WAL mode, failover, and Clerk JWKS token security.
- **Acoustic DSP & Multilingual NLP**: Librosa pitch/RMS extraction, 6-axis emotion scoring, and SVI triage algorithms.
- **Explainable AI**: SHAP token attribution badges and clinical recommendation rules.
- **Frontend Parity**: Next.js App Router static generation and REST contract consistency.
- **CI/CD Pipeline**: GitHub Actions workflow and Docker multi-service container orchestration.

---

## 🛠️ Development Workflow

1. **Fork & Branch**: Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Commit Standards**: Use conventional commits (`feat:`, `fix:`, `docs:`, `test:`, `ci:`).
3. **Submit PR**: Open a Pull Request targeting `main`. GitHub Actions CI will automatically execute the backend test suite and frontend build.
