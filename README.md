# TraumaSense AI Platform

> **Intelligent Trauma Assessment & Clinical AI Platform**  
> *Monorepo Architecture, Resilient Dual-Engine Database (Supabase + Local SQLite Fallback), Clerk Authentication, Relational Schema (9 Models), and Explainable Multi-Tier SVI Scoring.*

[![Step 1: Core Blueprint](https://img.shields.io/badge/Step%201-Verified%20%E2%9C%85-emerald)](#)
[![Step 2: Database & Schemas](https://img.shields.io/badge/Step%202-Verified%20%E2%9C%85-emerald)](#)
[![Step 3: AI/ML Services & REST API](https://img.shields.io/badge/Step%203-Verified%20%E2%9C%85-emerald)](#)
[![Python 3.12](https://img.shields.io/badge/Python-3.12%2B-blue)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688)](#)
[![Librosa DSP](https://img.shields.io/badge/Audio-Librosa%200.10%2B-orange)](#)
[![Next.js 16](https://img.shields.io/badge/Next.js-16%20App%20Router-black)](#)
[![SQLAlchemy 2.0](https://img.shields.io/badge/SQLAlchemy-2.0%2B-red)](#)
[![Pydantic v2](https://img.shields.io/badge/Pydantic-v2.6%2B-e92063)](#)
[![Clerk Auth](https://img.shields.io/badge/Auth-Clerk%20JWKS%20RS256-purple)](#)

---

## 🏗️ Architecture Blueprint

TraumaSense AI is built as a clinical-grade, resilient monorepo designed for high-concurrency trauma intake, multimodal analysis, and emergency intervention dispatch.

```
                               ┌─────────────────────────────────────────┐
                               │           Client Application            │
                               │         Next.js 16 (App Router)         │
                               │          Port: 3000 • Clerk Auth        │
                               └────────────────────┬────────────────────┘
                                                    │
                                                    │ Clerk Session JWT (RS256)
                                                    ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ FastAPI Backend (Port: 8000)                                                          │
│                                                                                       │
│   ┌──────────────────────────────┐              ┌─────────────────────────────────┐   │
│   │     Clerk Auth Verifier      │              │   Resilient Database Manager    │   │
│   │  • RS256 JWT Verification    │              │  • Primary: Local SQLite (WAL)  │   │
│   │  • Cached PyJWKClient        │              │  • Remote: Supabase PostgreSQL  │   │
│   │  • Route Guards & Claims     │              │  • Automatic Zero-Crash Failover│   │
│   └──────────────┬───────────────┘              └────────────────┬────────────────┘   │
│                  │                                               │                    │
│                  ▼                                               ▼                    │
│   ┌──────────────────────────────┐              ┌─────────────────────────────────┐   │
│   │   Pydantic v2 Schemas Layer  │              │   SQLAlchemy 2.0 ORM Models     │   │
│   │  • from_attributes = True    │              │  • 9 Tables (UUIDv4 String(36)) │   │
│   │  • ComplaintDetailResponse   │◄────────────►│  • Cross-DB Generic JSON        │   │
│   │  • Strict Data Validation    │              │  • all, delete-orphan Cascades  │   │
│   └──────────────────────────────┘              └─────────────────────────────────┘   │
└──────────────────┬───────────────────────────────────────────────┬────────────────────┘
                   │                                               │
                   ▼                                               ▼
         ┌───────────────────┐                  ┌──────────────────────────────────────┐
         │     Clerk Auth    │                  │          Database Engines            │
         │  JWKS public keys │                  │  • Local SQLite: traumasense_local.db│
         │   (Clerk Cloud)   │                  │  • Supabase: AWS ap-south-1 Pooler   │
         └───────────────────┘                  └──────────────────────────────────────┘
```

---

## 📁 Monorepo Workspace Structure

```
TraumaSense_AI/
├── .env                                  # Root environment configuration
├── .env.example                          # Environment credentials template
├── .gitignore                            # Airtight exclusion (keys, DBs, audio)
├── docker-compose.yml                    # Multi-container orchestration (8000 & 3000)
├── README.md                             # Platform documentation & blueprint
├── step1_verification_report.md          # Step 1 100% verification audit report
├── step2_verification_report.md          # Step 2 100% verification audit report
├── step3_verification_report.md          # Step 3 100% verification audit report
├── backend/
│   ├── .env                              # Backend environment
│   ├── .env.example                      # Backend environment template
│   ├── Dockerfile                        # Production-ready Python 3.12 container
│   ├── requirements.txt                  # Python dependencies (FastAPI, Librosa, SoundFile)
│   ├── run.py                            # Development server launcher
│   ├── app/
│   │   ├── __init__.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py                 # Pydantic Settings environment validation
│   │   │   └── security.py               # Clerk JWKS verifier & route guards
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   └── session.py                # Resilient DB Manager (SQLite + Supabase)
│   │   ├── models/
│   │   │   ├── __init__.py               # Model & Enum exports
│   │   │   └── core.py                   # 9 SQLAlchemy ORM models with cascades
│   │   ├── schemas/
│   │   │   ├── __init__.py               # Schema exports
│   │   │   └── core.py                   # Pydantic v2 validation & response models
│   │   ├── services/
│   │   │   ├── __init__.py               # ML inference service exports
│   │   │   ├── speech_service.py         # Librosa acoustic DSP biomarker extraction & Whisper ASR
│   │   │   ├── nlp_service.py            # Multilingual trauma NLP (7 languages & crisis lexicons)
│   │   │   ├── explainability.py         # Token-perturbation SHAP word attribution weighting
│   │   │   └── svi_engine.py             # Multimodal SVI scoring (0-100), triage & alerts
│   │   ├── routers/
│   │   │   ├── __init__.py               # Router exports
│   │   │   ├── auth.py                   # Clerk user sync & profile routes (/api/auth)
│   │   │   ├── complaints.py             # Multimodal complaint intake & detail (/api/complaints)
│   │   │   ├── analytics.py              # Operational & clinical dashboard analytics (/api/analytics)
│   │   │   └── alerts.py                 # Emergency dispatch & alert management (/api/alerts)
│   │   ├── init_db.py                    # DDL provisioning & storage initialization
│   │   ├── seed.py                       # Idempotent multi-tier database seeder
│   │   ├── config.py                     # Root config adapter
│   │   ├── database.py                   # Root database adapter
│   │   ├── auth.py                       # Root auth adapter
│   │   └── main.py                       # FastAPI entry point & router mounting
│   ├── tests/
│   │   ├── test_db_resilience.py         # Resilient SQLite/Postgres failover tests
│   │   ├── test_clerk_auth.py            # Clerk JWKS key inspection tests
│   │   ├── test_api_health.py            # System health & diagnostic API tests
│   │   ├── test_step3_services_and_api.py # Pytest integration suite for Step 3 ML & API
│   │   ├── verify_step1.py               # Automated Step 1 verification suite
│   │   ├── verify_step2.py               # Automated Step 2 verification suite
│   │   └── verify_step3.py               # Automated Step 3 verification suite
│   └── uploads/
│       └── audio/                        # Local fallback audio storage (.gitkeep)
└── frontend/
    ├── .env.example                      # Frontend environment template
    ├── .env.local                        # Frontend local environment
    ├── Dockerfile                        # Multi-stage Next.js production build
    ├── package.json                      # Next.js 16, React 19, @clerk/nextjs
    └── src/
        ├── middleware.ts                 # Clerk authentication proxy middleware
        └── app/
            ├── layout.tsx                # Root layout wrapped in <ClerkProvider>
            └── page.tsx                  # Architecture blueprint dashboard
```

---

## 🗄️ Database Models & Entity Relationships (Step 2)

All models are engineered for **100% Cross-Database Compatibility** between local SQLite (`traumasense_local.db`) and remote Supabase PostgreSQL:
- **UUID Primary & Foreign Keys**: Standardized on `String(36)` with deterministic `uuid.uuid4()` defaults.
- **Generic Dialect Types**: Uses SQLAlchemy's generic `JSON` type for transparent cross-engine serialization.
- **String Enums**: Configured with `Enum(..., native_enum=False, create_constraint=True)` for seamless SQLite and Postgres constraint checking.
- **Cascade Deletion**: Configured with `cascade="all, delete-orphan"` on all complaint child entities.

```
       ┌──────────────┐
       │     User     │
       └──────┬───────┘
              │ 1:N (user_id)
              ▼
       ┌──────────────┐
       │  Complaint   │◄────────────────────────────────────────────────────────────────────────┐
       └──┬───┬───┬───┘                                                                         │
          │   │   │                                                                             │
     1:1  │   │   │ 1:1                                                                     1:N │ 1:N
 ┌────────┘   │   └────────┐                                                                ┌───┴───┬───────────────┐
 │            │ 1:1        │                                                                │       │               │
 ▼            ▼            ▼                                                                ▼       ▼               ▼
┌───────────┐┌───────────┐┌──────────────────┐┌───────────────────┐┌───────────┐┌────────────────┐┌───────────┐
│ AudioFile ││ Emotion   ││  TraumaAnalysis  ││ AcousticFeatures  ││ RiskScore ││ Recommendation ││   Alert   │
│           ││ Analysis  ││                  ││                   ││ (SVI/SHAP)││                ││(CRITICAL) │
└───────────┘└───────────┘└──────────────────┘└───────────────────┘└───────────┘└────────────────┘└───────────┘
```

### Table Definitions

| Table | Primary Key | Key Foreign Keys | Key Attributes & Enums | Cascade Rule |
| :--- | :--- | :--- | :--- | :--- |
| `users` | `id` (UUID) | None | `clerk_id` (Indexed), `email`, `role` (`ADMIN`, `OFFICER`, `VICTIM`) | `all, delete-orphan` |
| `complaints` | `id` (UUID) | `user_id` -> `users.id` | `title`, `raw_text`, `language`, `status` (`PENDING`, `IN_REVIEW`, `RESOLVED`, `ESCALATED`), `state_location` | `all, delete-orphan` |
| `audio_files` | `id` (UUID) | `complaint_id` (Unique) | `storage_path`, `duration_sec`, `sample_rate` | Parent child |
| `emotion_analysis` | `id` (UUID) | `complaint_id` (Unique) | `fear`, `anger`, `sadness`, `panic`, `anxiety`, `neutral` (0.0 to 1.0) | Parent child |
| `trauma_analysis` | `id` (UUID) | `complaint_id` (Unique) | `violence_indicators` (bool), `intimidation`, `social_isolation`, `suicidal_ideation` | Parent child |
| `acoustic_features`| `id` (UUID) | `complaint_id` (Unique) | `pitch_f0`, `rms_energy`, `zcr`, `pause_ratio`, `spectral_centroid` | Parent child |
| `risk_scores` | `id` (UUID) | `complaint_id` (Unique) | `svi_score` (0-100), `risk_category` (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`), `shap_explanations` (JSON) | Parent child |
| `recommendations` | `id` (UUID) | `complaint_id` | `action_type` (`COUNSELLING`, `LEGAL_AID`, `MEDICAL_ASSISTANCE`, `POLICE_INTERVENTION`, `WITNESS_PROTECTION`, `EMERGENCY_RESPONSE`), `is_dispatched` | Parent child |
| `alerts` | `id` (UUID) | `complaint_id` | `alert_level` (`CRITICAL`, `HIGH`), `status` (`OPEN`, `ACKNOWLEDGED`, `RESOLVED`), `dispatched_at` | Parent child |

---

## 🇮🇳 Multi-Tier Geographic Seed Distribution

The idempotent seeder ([`backend/app/seed.py`](file:///c:/Users/AryanSachin/Desktop/project/TraumaSense_AI/backend/app/seed.py)) seeds 3 users and 8 multimodal complaints spanning all 4 clinical risk tiers across 8 Indian states and 7 regional languages:

| # | State | Language | Tier | SVI Score | Violence Indicator | Primary Generated Recommendation | Alert |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Jharkhand | Hindi (`hi`) | `CRITICAL` | 94.5 | `True` | Armed Emergency Response Dispatch (Ranchi) | `CRITICAL` (OPEN) |
| **2** | Uttar Pradesh | English (`en`) | `CRITICAL` | 88.0 | `True` | Forensic Rescue & Emergency Medical Aid | `CRITICAL` (OPEN) |
| **3** | West Bengal | Bengali (`bn`) | `HIGH` | 68.5 | `True` | Domestic Violence Legal Aid & Crisis Shelter | `HIGH` (OPEN) |
| **4** | Odisha | Odia (`or`) | `HIGH` | 59.0 | `False` | POSH Committee & Cyber Cell Legal Support | `HIGH` (ACKNOWLEDGED) |
| **5** | Maharashtra | Marathi (`mr`) | `MODERATE` | 42.0 | `False` | Beat Officer Community Dispute Mediation | None |
| **6** | Tamil Nadu | Tamil (`ta`) | `MODERATE` | 35.5 | `False` | Cybercrime Portal Number Trace | None |
| **7** | Delhi | English (`en`) | `LOW` | 18.0 | `False` | Municipal Hearing Docket Number | None |
| **8** | Karnataka | Telugu (`te`) | `LOW` | 12.5 | `False` | Decibel Noise Ordinance Advisory Notice | None |

---

## 🚀 Quickstart & Operational Commands

### 1. Database Provisioning & Storage Initialization
```bash
cd backend
python -m app.init_db
```
- Provisions all 9 tables in `traumasense_local.db` via `Base.metadata.create_all`.
- Ensures local fallback folder `backend/uploads/audio/` exists.
- Attempts non-blocking verification of private Supabase bucket `traumasense-audio`.

### 2. Multi-Tier Idempotent Seeding
```bash
cd backend
python -m app.seed
```
- Seeds 3 default users (`clerk_admin_001`, `clerk_officer_001`, `clerk_victim_001`).
- Seeds 8 clinical complaints with full child trees (Audio, Emotion, Trauma, DSP Acoustic, SVI Risk with SHAP tokens, Recommendations, and Alerts).
- Safe to run repeatedly with zero duplicate key crashes.

### 3. Launch Development Servers

**Backend (FastAPI on Port 8000)**:
```bash
cd backend
python run.py
```
- Interactive Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health & Resilience Probe: [http://localhost:8000/health](http://localhost:8000/health)
- Clerk Auth Diagnostics: [http://localhost:8000/auth/status](http://localhost:8000/auth/status)

**Frontend (Next.js 16 on Port 3000)**:
```bash
cd frontend
npm run dev
```
- Platform Dashboard: [http://localhost:3000](http://localhost:3000)

### 4. Docker Compose Orchestration
```bash
docker-compose up --build
```
- `traumasense-backend`: [http://localhost:8000](http://localhost:8000)
- `traumasense-frontend`: [http://localhost:3000](http://localhost:3000)

---

## 🧠 Step 3: AI/ML Inference Services & REST API Layer

### 1. Acoustic Biomarker Extraction (`speech_service.py`)
- **Pitch ($F_0$) Extraction**: Real-time signal tracking via `librosa.yin` across 65 Hz to 2093 Hz.
- **Biomarkers Computed**: Root Mean Square (`rms_energy`), Zero Crossing Rate (`zcr`), Spectral Centroid (`spectral_centroid`), and Silence Ratio (`pause_ratio` via top-db speech splitting).
- **Acoustic Distress Index**: Calibrated composite formula normalized from `0.0` to `1.0`.
- **Whisper ASR Integration**: Lazy-loaded `openai-whisper` (`base`) with zero-latency resilient fallback.

### 2. Multilingual Trauma NLP & Clinical Crisis Evaluator (`nlp_service.py`)
- **Languages Supported**: English (`en`), Hindi (`hi`), Bengali (`bn`), Marathi (`mr`), Tamil (`ta`), Telugu (`te`), and Odia (`or`).
- **Clinical Danger Markers**: Columbia-Suicide Severity Rating Scale (C-SSRS) suicidal ideation cues, acute violence threats, weapon indicators, intimidation, and social isolation.
- **Emotion Spectrum**: 6-dimensional affect analysis (`fear`, `anger`, `sadness`, `panic`, `anxiety`, `neutral`).

### 3. Token-Perturbation SHAP Explainability (`explainability.py`)
- Evaluates token-level predictive impact on trauma severity by perturbing input tokens and computing localized marginal attribution weights.
- Returns top-k sorted tokens: `[{"word": str, "importance_weight": float}]` for transparent auditability.

### 4. Stress Vulnerability Index (SVI) Engine (`svi_engine.py`)
- **Multimodal SVI**:
  $$\text{SVI} = 100 \times (0.30 \times \text{trauma} + 0.25 \times \text{threat} + 0.25 \times \text{suicidal} + 0.10 \times \text{peak\_distress} + 0.10 \times \text{acoustic\_distress})$$
- **Text-Only SVI**:
  $$\text{SVI} = 100 \times (0.35 \times \text{trauma} + 0.30 \times \text{threat} + 0.25 \times \text{suicidal} + 0.10 \times \text{peak\_distress})$$
- **Clinical Safety Overrides**: If `suicidal_ideation >= 0.70` or (`violence_indicators` is True and `threat_severity >= 0.75`), SVI is guarded at $\ge 78.0$ (`CRITICAL`).
- **Triage Action Mapping**: Automatically generates structured recommendations (`EMERGENCY_RESPONSE`, `POLICE_INTERVENTION`, `MEDICAL_ASSISTANCE`, `WITNESS_PROTECTION`, `LEGAL_AID`, `COUNSELLING`) and flags emergency alerts for `HIGH` and `CRITICAL` cases.

### 5. FastAPI REST Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/sync` | Syncs or provisions user identity from Clerk credentials |
| `GET` | `/api/auth/me` | Retrieves profile of currently authenticated user with dev fallback |
| `POST` | `/api/complaints/submit-text` | Submits written narrative, runs NLP, SHAP & SVI, returns `ComplaintDetailResponse` |
| `POST` | `/api/complaints/submit-audio` | Multipart upload, runs Librosa DSP, ASR, NLP, SHAP & SVI, returns full assessment |
| `GET` | `/api/complaints` | Lists complaints with optional filtering by status, risk category, and state |
| `GET` | `/api/complaints/{complaint_id}` | Retrieves full nested assessment tree by complaint ID |
| `GET` | `/api/complaints/user/{user_id}` | Retrieves all complaints filed by a specific user |
| `GET` | `/api/analytics/dashboard` | Live database aggregations, risk/emotion distribution & state-wise metrics |
| `GET` | `/api/alerts` | Lists emergency dispatch alerts with parent complaint summaries |
| `PATCH` | `/api/alerts/{alert_id}/acknowledge` | Acknowledges/resolves alert, sets `dispatched_at`, and escalates complaint |

---

## 🧪 Automated Verification Suites

```bash
# Execute Step 1 verification (Workspace, Resilient DB, Clerk Auth)
python -m tests.verify_step1

# Execute Step 2 verification (Tables, Seeder Idempotency, Graph Integrity, Pydantic v2)
python -m tests.verify_step2

# Execute Step 3 verification (Librosa Acoustics, Multilingual NLP, SHAP, SVI & REST API)
python backend/tests/verify_step3.py

# Run complete pytest test suite (14/14 tests)
python -m pytest backend/tests -v
```

All suites execute with **100% PASS** rates.

---

## 📋 Build Plan Progress

- [x] **Step 1: Project Blueprint, Monorepo Workspace, Resilient DB & Clerk Auth** (Verified `✅`)
- [x] **Step 2: Database Schema, ORM Models, Pydantic v2 Schemas & Seeding** (Verified `✅`)
- [x] **Step 3: AI/ML Inference Services, Acoustic Biomarkers, Multilingual NLP, SHAP & REST Routers** (Verified `✅`)
- [ ] **Step 4: Real-Time WebSockets & Emergency Alerts Dispatch Integration**
- [ ] **Step 5: Frontend Clinical Intake, Real-Time Audio Recorder & Triage Dashboard**
