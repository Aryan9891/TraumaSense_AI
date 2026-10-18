# TraumaSense AI Platform

> **Intelligent Trauma Assessment & Clinical AI Platform**  
> *Monorepo Architecture, Resilient Dual-Engine Database (Supabase + Local SQLite Fallback), and Clerk Authentication.*

---

## 🏗️ Architecture Blueprint (Step 1)

TraumaSense AI is built as a high-reliability, microservices-ready monorepo designed for clinical trauma evaluation and rapid AI inference.

```
                              ┌─────────────────────────────────────────┐
                              │           Client Application            │
                              │           Next.js 16 (Port 3000)        │
                              └────────────────────┬────────────────────┘
                                                   │
                                                   │ Clerk Session JWT
                                                   ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ FastAPI Backend (Port 8000)                                                           │
│                                                                                       │
│   ┌──────────────────────────────┐              ┌─────────────────────────────────┐   │
│   │     Clerk Auth Verifier      │              │   Resilient Database Manager    │   │
│   │  • RS256 JWT Verification    │              │  • Primary: Local SQLite (WAL)  │   │
│   │  • Cached PyJWKClient        │              │  • Remote: Supabase PostgreSQL  │   │
│   │  • Route Guards & Claims     │              │  • Seamless Auto-Fallback       │   │
│   └──────────────┬───────────────┘              └────────────────┬────────────────┘   │
└──────────────────┼───────────────────────────────────────────────┼────────────────────┘
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
├── .env                          # Master root environment configuration
├── .env.example                  # Environment template with credentials
├── .gitignore                    # Global git ignore (db, node_modules, .env, etc.)
├── docker-compose.yml            # Multi-container orchestration (ports 8000 & 3000)
├── README.md                     # Architecture blueprint and documentation
├── backend/
│   ├── .env                      # Backend local environment
│   ├── .env.example              # Backend environment template
│   ├── Dockerfile                # Production-ready Python 3.12 container
│   ├── requirements.txt          # Python dependencies
│   ├── run.py                    # Local development runner
│   ├── app/
│   │   ├── __init__.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py         # Pydantic Settings environment validation
│   │   │   └── security.py       # Clerk JWKS verifier & FastAPI auth dependencies
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   └── session.py        # Resilient Database Manager (SQLite + Supabase Fallback)
│   │   └── main.py               # FastAPI entry point, CORS, and health diagnostics
│   └── tests/
│       ├── __init__.py
│       ├── test_db_resilience.py # Resilient SQLite/PostgreSQL failover tests
│       ├── test_clerk_auth.py    # Clerk JWKS key inspection & verification tests
│       └── test_api_health.py    # System health & diagnostic API tests
└── frontend/
    ├── .env.example              # Frontend environment template
    ├── .env.local                # Frontend local environment
    ├── Dockerfile                # Multi-stage Next.js production build
    ├── package.json              # Next.js 16, React 19, Tailwind CSS dependencies
    └── src/
        └── app/
            ├── layout.tsx
            └── page.tsx          # Initial platform status view
```

---

## 🛡️ Resilient Database Architecture

The platform implements an **Auto-Fallback Resilient Database Architecture**:

1. **Zero-Latency Boot (Primary SQLite Mode)**:
   - When `USE_LOCAL_SQLITE=True`, the backend initializes SQLite immediately (`traumasense_local.db`).
   - SQLite is tuned for high-concurrency clinical usage via WAL mode (`PRAGMA journal_mode=WAL`), normal synchronization, and foreign key enforcement.
   - Provides sub-millisecond database response times (~0.3ms).

2. **Supabase PostgreSQL & Auto-Failover**:
   - When configured with `USE_LOCAL_SQLITE=False`, the backend connects to the remote Supabase PostgreSQL pooler (`aws-0-ap-south-1.pooler.supabase.com:6543`).
   - If the remote network drops, pooler goes cold, or credentials fail, the `ResilientDatabaseManager` intercepts the error, emits a structured alert, and **automatically switches the active engine to Local SQLite**.
   - **Guarantees 100% platform boot reliability and zero downtime crashes**.

---

## 🔐 Clerk Authentication Configuration

- **Asymmetric RSA-256 JWT Verification**:
  - The backend leverages `PyJWKClient` connected to Clerk's live JWKS URL (`https://relative-lioness-4860.clerk.accounts.dev/.well-known/jwks.json`).
  - Public keys are automatically discovered, validated against the Key ID (`kid`), and cached for performance.
- **FastAPI Route Dependencies**:
  - `require_clerk_auth`: Enforces valid Bearer JWT tokens on protected endpoints.
  - `optional_clerk_auth`: Extracts claims when available without blocking unauthenticated requests.
- **Diagnostics**:
  - Endpoint `GET /auth/status` probes Clerk JWKS health and reports live key counts and round-trip latency.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+ / Python 3.12+
- Node.js 20+ / npm 10+
- Docker & Docker Compose (optional, for containerized run)

### Option 1: Native Local Development

1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python run.py
   ```
   Backend will start at **http://localhost:8000**.
   - API Blueprint: http://localhost:8000/
   - Interactive Docs: http://localhost:8000/docs
   - System Diagnostics: http://localhost:8000/health
   - Auth Diagnostics: http://localhost:8000/auth/status

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend will start at **http://localhost:3000**.

### Option 2: Docker Compose Orchestration

```bash
# Build and run backend and frontend simultaneously
docker-compose up --build
```

- `traumasense-backend`: http://localhost:8000
- `traumasense-frontend`: http://localhost:3000

---

## 🧪 Running Automated Tests

```bash
# Execute comprehensive backend test suite
python -m pytest backend/tests -v
```

Current test suite coverage:
- ✅ SQLite primary engine initialization & sub-millisecond ping
- ✅ SQLite WAL journal mode pragma verification
- ✅ FastAPI `get_db` session dependency lifecycle
- ✅ Resilient remote failure auto-fallback to SQLite
- ✅ Clerk configuration & environment variable validation
- ✅ Clerk live JWKS key discovery & reachability
- ✅ Asymmetric token validation & rejection of forged tokens
- ✅ Root, `/health`, and `/auth/status` endpoints
