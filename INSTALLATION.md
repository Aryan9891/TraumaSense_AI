# TraumaSense AI - Production Installation & Deployment Runbook

Comprehensive deployment and operations guide for the **TraumaSense AI** platform: an intelligent trauma assessment, clinical decision-support, and emergency triage platform.

---

## Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                                 TRAUMASENSE AI                                   |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|   +--------------------------+                 +------------------------------+   |
|   |   Next.js 15 Frontend    |  REST / Audio   |     FastAPI Backend API      |   |
|   |  - Victim Portal         | --------------> |  - SVI Triage Engine         |   |
|   |  - Web Audio Recorder    |                 |  - Librosa DSP Signal Parser |   |
|   |  - SVI Radial Gauge      | <-------------- |  - Multilingual Trauma NLP   |   |
|   |  - SHAP Token Heatmap    |   JSON / Alerts |  - SHAP Attribution Gen      |   |
|   |  - Officer Triage Desk   |                 |  - Clerk JWKS Guard          |   |
|   +--------------------------+                 +------------------------------+   |
|                |                                              |                   |
|                | Client-Side                                  | Dual-Engine       |
|                | Auth Session                                 | Resilient Storage |
|                v                                              v                   |
|   +--------------------------+                 +------------------------------+   |
|   |        Clerk Auth        |                 |   Database Engine Choice:    |   |
|   |  - JWT Bearer Tokens     |                 |  1. Local SQLite (Default)   |   |
|   |  - Asymmetric JWKS Keys  |                 |  2. Remote Supabase Postgres |   |
|   +--------------------------+                 +------------------------------+   |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 1. System Requirements & Prerequisites

### Native Host Requirements:
- **Operating System**: Linux (Ubuntu 22.04+), macOS (13+), or Windows 10/11 (PowerShell or WSL2)
- **Python**: Version `3.11` or `3.12`
- **Node.js**: Version `20.x` or `22.x` (LTS) & `npm` 10+
- **Audio DSP Libraries** (for native speech analysis):
  - Ubuntu/Debian: `sudo apt-get install libsndfile1 ffmpeg`
  - macOS: `brew install libsndfile ffmpeg`
  - Windows: Installed automatically with `soundfile` and standard Windows audio drivers

### Containerized Host Requirements:
- **Docker Engine**: Version `24.0.0+`
- **Docker Compose**: Version `v2.20.0+`
- **Memory**: Minimum 4 GB RAM recommended

---

## 2. Environment Variables Configuration

Copy the root template to create your `.env` file:

```bash
cp .env.example .env
```

Ensure the following keys are configured in `.env`:

```env
# Database Configuration (Resilient Dual Engine)
USE_LOCAL_SQLITE=True
SQLITE_URL=sqlite:///./traumasense_local.db

# Remote Supabase Credentials (optional fallback / production)
SUPABASE_URL=https://dummy-supabase-project.supabase.co
SUPABASE_ANON_KEY=dummy-supabase-anon-key-placeholder
SUPABASE_SERVICE_ROLE_KEY=dummy-supabase-service-role-key-placeholder
SUPABASE_DB_URL=postgresql://postgres:dummy-password@db.dummy-supabase-project.supabase.co:5432/postgres

# Clerk Authentication (Production Validated Test Instance)
CLERK_PUBLISHABLE_KEY=pk_test_cmVsYXRpdmUtbGlvbmVzcy00ODYwLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_placeholder_key_for_dev_mode_sync
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cmVsYXRpdmUtbGlvbmVzcy00ODYwLmNsZXJrLmFjY291bnRzLmRldiQ

# Service Host & Port Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
FRONTEND_PORT=3000
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000","https://traumasense.ai"]

# AI/ML Acoustic & NLP Runtime Settings
WHISPER_MODEL_SIZE=tiny
DEVICE=cpu
DEFAULT_LANGUAGE=en
CONFIDENCE_THRESHOLD=0.75
```

---

## 3. Run Option A: One-Command Docker Compose Production Launch

The fastest way to spin up the entire multi-service platform in an isolated production environment:

```bash
# 1. Build and run production containers in background
docker compose -f docker-compose.prod.yml up --build -d

# 2. View live service logs
docker compose -f docker-compose.prod.yml logs -f

# 3. Check container health status
docker compose -f docker-compose.prod.yml ps
```

Once running:
- **FastAPI API & Interactive OpenAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Probe**: [http://localhost:8000/health](http://localhost:8000/health)
- **Next.js 15 Web Application**: [http://localhost:3000](http://localhost:3000)
- **Officer Triage Command Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Multi-Modal Victim Portal**: [http://localhost:3000/portal](http://localhost:3000/portal)

To gracefully stop the production cluster:
```bash
docker compose -f docker-compose.prod.yml down
```

---

## 4. Run Option B: Local Native Setup & Development

### Step 4.1: Backend Setup (FastAPI & DSP ML Services)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate a Python virtual environment
# On Linux/macOS:
python3 -m venv .venv
source .venv/bin/activate

# On Windows PowerShell:
python -m venv .venv
.venv\Scripts\Activate.ps1

# 3. Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. Initialize Database Tables and Seed Multimodal Scenarios
python -m app.init_db
python -m app.seed

# 5. Start the FastAPI development server with hot-reload
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Step 4.2: Frontend Setup (Next.js 15 App Router)

Open a new terminal window:

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install Node dependencies
npm install --legacy-peer-deps

# 3. Run development server with Turbopack
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the landing page.

---

## 5. Clerk Authentication & Security Setup

1. **Clerk Application Setup**:
   - Create an account at [Clerk.com](https://clerk.com) and create a new application named `TraumaSense AI`.
   - Copy your **Publishable Key** (`pk_test_...`) and **Secret Key** (`sk_test_...`).
   - Add them to `.env` and `frontend/.env.local`.

2. **JWKS Token Verification**:
   - The FastAPI backend reads Clerk public keys directly from Clerk's JWKS endpoint (`https://<your-subdomain>.clerk.accounts.dev/.well-known/jwks.json`).
   - Run the health probe to verify JWKS reachability:
     ```bash
     curl http://localhost:8000/auth/status
     ```
   - Expect:
     ```json
     {
       "configured": true,
       "reachable": true,
       "keys_count": 1,
       "app_id": "relative-lioness-4860"
     }
     ```

---

## 6. Cloud Deployment Guide & Runbook

### Option 1: Frontend on Vercel
1. Push repository to GitHub.
2. Link repository in [Vercel Dashboard](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. Configure Build Command: `npm run build` with Install Command: `npm install --legacy-peer-deps`.
5. Add Environment Variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: `pk_test_...`
   - `CLERK_SECRET_KEY`: `sk_test_...`
   - `NEXT_PUBLIC_API_URL`: `https://api.yourdomain.com/api`
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://your-project.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJ...`

### Option 2: Backend on GCP Cloud Run / Render / Railway
1. **Container Deployment**:
   - Deploy `backend/Dockerfile` directly.
   - Set container port to `8000`.
2. **Environment Variables**:
   - `USE_LOCAL_SQLITE=False` (to point to production Postgres)
   - `SUPABASE_DB_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`
   - `CLERK_PUBLISHABLE_KEY=pk_test_...`
   - `CORS_ORIGINS=["https://traumasense.vercel.app","https://traumasense.ai"]`
3. **Health Check Path**: `/health` (Interval: 15s, Timeout: 5s).

---

## 7. Verification & Troubleshooting

Run the comprehensive master verification suite at any time:

```bash
# Verify entire 5-step implementation:
python backend/tests/verify_step5.py

# Run full pytest regression suite:
python -m pytest backend/tests -v
```

### Common Troubleshooting Tips:
- **`libsndfile1` missing error on Linux**:
  Install with `sudo apt-get install -y libsndfile1 ffmpeg`.
- **Next.js Hydration or Date Pre-render Warnings**:
  Static timestamp references are pinned for SSR deterministic rendering.
- **Port Conflict (8000 or 3000 already bound)**:
  Check running processes with `netstat -ano | findstr :8000` (Windows) or `lsof -i :8000` (Linux/macOS) and terminate stale instances.
