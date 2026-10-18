# 🛡️ TraumaSense AI Platform

> **Intelligent Multimodal Trauma Assessment, Clinical Decision-Support & Emergency Triage System**  
> *Combining Real-Time Librosa DSP Acoustic Biomarkers, Multilingual Transformer NLP, Explainable SHAP Token Attribution, and Resilient Dual-Engine Data Architecture.*

---

<div align="center">

| 📖 **[Overview (README)](README.md)** | 🧪 **[Testing Suite (22/22 Tests)](TESTING.md)** | 🚀 **[Installation Runbook](INSTALLATION.md)** | 🤝 **[Contributing](CONTRIBUTING.md)** | ⚖️ **[MIT License](LICENSE)** |
| :---: | :---: | :---: | :---: | :---: |

</div>

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](#)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#)
[![Python](https://img.shields.io/badge/Python_3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](#)
[![SQLite](https://img.shields.io/badge/SQLite_WAL-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](#)
[![Clerk](https://img.shields.io/badge/Clerk_Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](#)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](#)
[![Tests Passing](https://img.shields.io/badge/Pytest-22%2F22_PASSING-brightgreen?style=for-the-badge&logo=pytest&logoColor=white)](TESTING.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

**Emergency Helplines Integrated**:
`🚨 112 National Emergency` • `👩 181 Women Helpline` • `🧒 1098 Childline` • `🧠 14416 Tele-MANAS`

</div>

---

## 📌 Executive Summary

**TraumaSense AI** is a clinical-grade crisis response and forensic intake platform designed to triage high-stakes distress reports across India. Victims can submit either written narratives or recorded voice statements in **7 languages** (`English`, `Hindi`, `Bengali`, `Marathi`, `Tamil`, `Telugu`, `Odia`). 

The platform simultaneously extracts acoustic signal biomarkers (`pitch_f0`, `rms_energy`, `zcr`, `pause_ratio`) and linguistic trauma markers (`violence_indicators`, `intimidation`, `suicidal_ideation`), computing an explainable **Severity & Vulnerability Index (SVI: 0–100)** with word-level **SHAP token attribution heatmaps** to assist crisis response officers in dispatching immediate medical, police, or counseling interventions.

---

## 🏗️ Interactive Architecture & Data Flow

```mermaid
flowchart TB
    subgraph Clients["1. Frontend & Client Tier (Next.js 15 App Router)"]
        direction LR
        P1["Landing Page\n(/)"]
        P2["Victim Reporting Portal\n(/portal)\n- Canvas Waveform\n- WAV Synthesizer\n- SVI Radial Gauge"]
        P3["Case History Tracker\n(/portal/history)\n- Status Filter\n- Forensic Modal"]
        P4["Officer Command Desk\n(/admin)\n- Real-Time Alert Feed\n- Chart.js Analytics"]
    end

    subgraph AuthTier["2. Identity & Security Layer"]
        Clerk["Clerk Authentication\n- RS256 Asymmetric JWT\n- PyJWKClient Cached Verifier\n- Role RBAC (VICTIM / OFFICER / ADMIN)"]
    end

    subgraph BackendAPI["3. FastAPI Backend Services (Port 8000)"]
        direction TB
        R1["/api/complaints/submit-text\n/api/complaints/submit-audio"]
        R2["/api/alerts & /acknowledge\n/api/analytics/dashboard"]
        
        subgraph ML["AI/ML Clinical Inference Pipeline"]
            DSP["Librosa DSP Engine\n- Pitch F0 (YIN)\n- RMS Energy\n- Zero Crossing Rate\n- Spectral Centroid"]
            NLP["Multilingual NLP Engine\n- 6-Axis Emotion Profile\n- C-SSRS Trauma Scoring\n- 7 Indian Languages"]
            SHAP["Explainable AI\n- SHAP Token Attributions\n- Keyword Importance Weights"]
            SVI["SVI Triage Engine\n- Score: 0.0 to 100.0\n- LOW | MODERATE | HIGH | CRITICAL\n- Automated Action Prescription"]
        end
    end

    subgraph DataTier["4. Resilient Dual-Engine Storage Tier"]
        direction LR
        LocalDB[("Primary: SQLite Engine\n- WAL Journaling\n- Zero-Latency Boot\n- 9 Relational Models")]
        RemoteDB[("Remote: Supabase Postgres\n- Pooling (aws-0-ap-south-1)\n- Automatic Failover\n- Audio Object Storage")]
    end

    Clients -->|Bearer JWT RS256| Clerk
    Clients -->|REST / Multipart Form| R1
    Clients -->|Polling / Dispatch Actions| R2
    Clerk -.->|JWKS Public Key Verification| BackendAPI
    R1 --> DSP & NLP
    DSP & NLP --> SVI --> SHAP
    BackendAPI <-->|SQLAlchemy 2.0 ORM| LocalDB
    LocalDB -.->|Resilient Fallback / Sync| RemoteDB
```

---

## 🔬 SVI (Severity & Vulnerability Index) Clinical Pipeline

```mermaid
flowchart LR
    subgraph Inputs["Multimodal Distress Intake"]
        A1["Voice Recording\n(Web Audio API / WAV)"]
        A2["Written Narrative\n(7 Indian Languages)"]
    end

    subgraph Processing["Biomarker & Affect Extraction"]
        B1["Acoustic Signal DSP\n- Tremor / Pitch F0\n- Vocal Energy (RMS)\n- Hesitation (Pause Ratio)"]
        B2["Linguistic NLP Affect\n- Fear, Panic, Anxiety\n- Intimidation & Battery\n- Suicidal Ideation (C-SSRS)"]
    end

    subgraph Synthesis["Clinical SVI Algorithm"]
        C["Weighted Triage Formula\nSVI = 0.35(Acoustic) + 0.45(Trauma) + 0.20(Emotion)"]
        D["SHAP Token Attribution\nHighlights critical trigger words"]
    end

    subgraph SeverityTiers["Calibrated Severity Tiers"]
        T1["🟢 LOW (0–25)\nRoutine Guidance"]
        T2["🟡 MODERATE (26–50)\nCounselling Referral"]
        T3["🟠 HIGH (51–75)\nLegal & Social Worker"]
        T4["🔴 CRITICAL (76–100)\nAuto-Escalation & PCR 112"]
    end

    A1 --> B1
    A2 --> B2
    B1 --> C
    B2 --> C
    C --> D
    C --> T1 & T2 & T3 & T4
```

---

## 🗄️ Relational Entity-Relationship Model (9 Models)

The data layer is defined via **SQLAlchemy 2.0** with cross-database generic `JSON` attributes and UUIDv4 keys, functioning identically across SQLite and PostgreSQL:

```mermaid
erDiagram
    User ||--o{ Complaint : "files"
    User {
        string id PK "UUIDv4"
        string clerk_id UK "Clerk Identity ID"
        string email UK
        enum role "ADMIN | OFFICER | VICTIM"
        datetime created_at
    }

    Complaint ||--o| AudioFile : "has"
    Complaint ||--o| EmotionAnalysis : "evaluates"
    Complaint ||--o| TraumaAnalysis : "evaluates"
    Complaint ||--o| AcousticFeatures : "extracts"
    Complaint ||--o| RiskScore : "computes"
    Complaint ||--o{ Recommendation : "prescribes"
    Complaint ||--o{ Alert : "triggers"

    Complaint {
        string id PK "UUIDv4"
        string user_id FK "users.id (nullable)"
        string title
        text raw_text "Narrative text"
        string audio_file_url "Audio URI"
        string language "en, hi, bn, mr, ta, te, or"
        enum status "PENDING | IN_REVIEW | ESCALATED | RESOLVED"
        string state_location "Indian State / UT"
        datetime created_at
    }

    AudioFile {
        string id PK "UUIDv4"
        string complaint_id FK "complaints.id"
        string storage_path
        float duration_sec
        int sample_rate "16000 Hz target"
    }

    EmotionAnalysis {
        string id PK "UUIDv4"
        string complaint_id FK "complaints.id"
        float fear "0.0 - 1.0"
        float anger "0.0 - 1.0"
        float sadness "0.0 - 1.0"
        float panic "0.0 - 1.0"
        float anxiety "0.0 - 1.0"
        float neutral "0.0 - 1.0"
    }

    TraumaAnalysis {
        string id PK "UUIDv4"
        string complaint_id FK "complaints.id"
        boolean violence_indicators
        float intimidation "0.0 - 1.0"
        float social_isolation "0.0 - 1.0"
        float suicidal_ideation "0.0 - 1.0"
        float confidence_score "0.0 - 1.0"
    }

    AcousticFeatures {
        string id PK "UUIDv4"
        string complaint_id FK "complaints.id"
        float pitch_f0 "Mean fundamental Hz"
        float pitch_variance "Pitch jitter"
        float rms_energy "Signal energy"
        float zero_crossing_rate "ZCR"
        float pause_ratio "Hesitation fraction"
        float spectral_centroid "Timbre brightness"
    }

    RiskScore {
        string id PK "UUIDv4"
        string complaint_id FK "complaints.id"
        float svi_score "0.0 - 100.0"
        enum risk_category "LOW | MODERATE | HIGH | CRITICAL"
        json shap_explanations "Array of {word, importance_weight}"
    }

    Recommendation {
        string id PK "UUIDv4"
        string complaint_id FK "complaints.id"
        enum action_type "EMERGENCY_RESPONSE | POLICE_INTERVENTION | COUNSELLING | LEGAL_AID | MEDICAL_SUPPORT | SOCIAL_WORKER"
        string description
        boolean is_dispatched
    }

    Alert {
        string id PK "UUIDv4"
        string complaint_id FK "complaints.id"
        enum alert_level "LOW | MODERATE | HIGH | CRITICAL"
        enum status "OPEN | ACKNOWLEDGED | RESOLVED"
        datetime dispatched_at
    }
```

---

## ⚡ Incident Escalation & Response State Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING : Complaint Submitted (Text or Voice)
    
    state PENDING {
        [*] --> Ingesting
        Ingesting --> SVI_Triaged : Run DSP & NLP
    }
    
    PENDING --> IN_REVIEW : Officer Opens Case Dossier
    PENDING --> ESCALATED : SVI >= 76.0 (Automated Critical Alert)
    
    state AlertLifecycle {
        [*] --> OPEN : Alert Generated
        OPEN --> ACKNOWLEDGED : Officer Clicks "Acknowledge & Dispatch"
        ACKNOWLEDGED --> RESOLVED : PCR / Medical Units Dispatched
    }

    IN_REVIEW --> ESCALATED : Officer Manually Dispatches Critical Alert
    IN_REVIEW --> RESOLVED : Support Rendered & Logged
    ESCALATED --> RESOLVED : Alert Status Set to RESOLVED
    RESOLVED --> [*]
```

---

## 🖥️ Frontend Component & User Interface Architecture

```mermaid
flowchart TD
    subgraph Shell["Global Shell & Layout"]
        Nav["Navbar.tsx (Glassmorphic)"]
        Nav --> Helplines["Emergency Badges (112, 181, 1098, 14416)"]
        Nav --> ClerkAuth["Clerk Controls (SignInButton, UserButton)"]
    end

    subgraph Pages["App Router Pages"]
        Home["page.tsx\nLanding Page & Command Overview"]
        Portal["portal/page.tsx\nMultimodal Reporting Portal"]
        History["portal/history/page.tsx\nCase Tracker & Incident Registry"]
        Admin["admin/page.tsx\nOfficer Triage & Command Dashboard"]
    end

    subgraph PortalComponents["Portal Components"]
        AudioRec["AudioRecorder.tsx\n- Live Canvas Waveform\n- Pure JS 16kHz WAV Synthesizer"]
        SviArc["SviGauge.tsx\n- 240° Radial Arc\n- Color-Coded Pulsing Crimson"]
        ShapComp["ShapVisualizer.tsx\n- Crisis Word Badges\n- Relative Importance Bars"]
        AlertBanner["AlertBanner.tsx\n- Critical SVI Emergency Intervention"]
    end

    subgraph AdminComponents["Admin Triage Components"]
        KPIs["4 Top KPI Metric Cards"]
        AlertFeed["Real-Time Critical Alert Feed\n- 1-Click Acknowledge & Dispatch"]
        Charts["Chart.js Suite:\n- EmotionRadarChart (6-Axis Radar)\n- RiskDistributionBar (Doughnut)\n- StateMetricsMap (State Breakdown)"]
        AuditTable["Filterable Incident Audit Queue\n- Forensic Modal Inspector"]
    end

    Portal --> AudioRec & SviArc & ShapComp & AlertBanner
    Admin --> KPIs & AlertFeed & Charts & AuditTable
```

---

## 🚀 Quick-Start Guide

### Option A: One-Command Docker Compose (Production)
```bash
# Clone the repository
git clone https://github.com/Aryan9891/TraumaSense_AI.git
cd TraumaSense_AI

# Build and start all services in background
docker compose -f docker-compose.prod.yml up --build -d

# Verify container health
docker compose -f docker-compose.prod.yml ps
```
- **Web Portal**: [http://localhost:3000](http://localhost:3000)
- **FastAPI OpenAPI Swagger**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Probe**: [http://localhost:8000/health](http://localhost:8000/health)

### Option B: Local Native Development
```bash
# 1. Start FastAPI Backend (Terminal 1)
cd backend
python -m venv .venv
# Activate: source .venv/bin/activate (Linux/macOS) or .venv\Scripts\Activate.ps1 (Windows)
pip install -r requirements.txt
python -m app.init_db && python -m app.seed
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 2. Start Next.js Frontend (Terminal 2)
cd frontend
npm install --legacy-peer-deps
npm run dev
```

### Environment Variables Setup
Copy the template to your environment configuration:
```bash
cp .env.example .env
```

Key environment configuration parameters:
```env
# Database (Primary SQLite WAL for local, Supabase Postgres for cloud)
USE_LOCAL_SQLITE=True
SQLITE_URL=sqlite:///./traumasense_local.db
DATABASE_URL=postgresql://postgres.ref:password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require

# Clerk Authentication (RS256 JWT)
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_JWKS_URL=https://your-domain.clerk.accounts.dev/.well-known/jwks.json

# Audio / NLP Settings
WHISPER_MODEL_SIZE=base
DEVICE=cpu
```

For complete cloud deployment (Vercel, GCP Cloud Run, Supabase), read the full [INSTALLATION.md](INSTALLATION.md) runbook.

---

## 📡 REST API Specification

| Method | Endpoint | Description | Response Schema |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/auth/sync` | Provision or synchronize user identity from Clerk | `UserResponse` |
| `POST` | `/api/complaints/submit-text` | Submit written narrative, run multilingual NLP + SHAP + SVI | `ComplaintDetailResponse` (201) |
| `POST` | `/api/complaints/submit-audio` | Multipart audio upload, extract Librosa DSP biomarkers + ASR | `ComplaintDetailResponse` (201) |
| `GET` | `/api/complaints` | Filterable list of complaints by state, risk, or status | `List[ComplaintResponse]` |
| `GET` | `/api/complaints/{id}` | Deep nested assessment tree (Acoustic + Emotion + Trauma + SVI) | `ComplaintDetailResponse` |
| `GET` | `/api/analytics/dashboard` | Live platform analytics, emotion radar averages & state stats | `DashboardAnalyticsResponse` |
| `GET` | `/api/alerts` | List active emergency alerts joined with complaint summaries | `List[AlertDetailResponse]` |
| `PATCH`| `/api/alerts/{id}/acknowledge`| Acknowledge alert, record dispatch time, escalate complaint | `AlertDetailResponse` |
| `GET` | `/health` | Live diagnostic probe: DB resilience, WAL latency, Clerk JWKS | `SystemHealthResponse` |

---

## 🧪 Unified Verification & Testing Suite

All 5 development phases are backed by continuous testing with **100% pass rates**. View the complete [TESTING.md](TESTING.md) specification for full assertion details.

```bash
# Run complete test suite (22 of 22 tests passing)
python -m pytest backend/tests -v

# Run production Next.js compilation check
cd frontend && npm run build
```

---

## 🗺️ Project Directory Structure

```text
TraumaSense_AI/
├── .github/workflows/
│   └── ci-cd.yml                # Automated CI/CD pipeline (Pytest + Next.js build)
├── backend/
│   ├── app/
│   │   ├── core/                # Configuration (Pydantic Settings) & Clerk security
│   │   ├── db/                  # Dual-engine session manager (SQLite WAL + Supabase)
│   │   ├── models/              # 9 SQLAlchemy 2.0 ORM models
│   │   ├── routers/             # FastAPI REST endpoints (auth, complaints, analytics, alerts)
│   │   ├── schemas/             # Pydantic v2 data validation schemas
│   │   ├── services/            # Librosa DSP, multilingual NLP, SHAP, SVI triage
│   │   ├── init_db.py           # Relational DDL & local storage initializer
│   │   ├── main.py              # FastAPI application entrypoint
│   │   └── seed.py              # Multi-tier crisis scenario database seeder
│   ├── tests/                   # 22 Pytest unit & integration test suites
│   ├── Dockerfile               # Production Python 3.11-slim container
│   └── requirements.txt         # Pinned backend dependencies
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js 15 App Router pages (/, /portal, /history, /admin)
│   │   ├── components/          # AudioRecorder, SviGauge, ShapVisualizer, Charts/
│   │   └── lib/                 # Typed API client contracts & Supabase browser client
│   ├── Dockerfile               # 3-Stage multi-stage production Dockerfile
│   └── package.json             # Next.js 16 + React 19 dependencies
├── docker-compose.yml           # Multi-container local development orchestration
├── docker-compose.prod.yml      # Hardened multi-container production orchestration
├── INSTALLATION.md              # Complete deployment and configuration runbook
├── TESTING.md                   # Unified test matrix, sequences, and coverage report
└── README.md                    # Platform documentation & interactive diagrams
```

---

## 📄 License & Attribution

Distributed under the MIT License. See [LICENSE](LICENSE) for details. Developed for high-reliability trauma assessment, clinical triage, and public safety intervention.
