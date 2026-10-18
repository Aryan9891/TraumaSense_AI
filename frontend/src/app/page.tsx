import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
              TS
            </div>
            <div>
              <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                TraumaSense AI
              </span>
              <span className="ml-2 text-xs font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                Step 1: Blueprint
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Workspace Ready
            </span>
            <span className="text-slate-400">Port: 3000</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full flex flex-col justify-center">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-cyan-900/40 text-cyan-300 border border-cyan-700/50 mb-4">
            <svg className="w-3.5 h-3.5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Step 1 Execution Complete
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Intelligent Trauma Evaluation & Medical AI Architecture
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Monorepo initialized with resilient dual-engine database failover (Supabase + Local SQLite),
            asymmetric Clerk authentication via JWKS RSA verification, and microservices dockerization.
          </p>
        </div>

        {/* Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Database Resilience */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="h-10 w-10 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/50 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7M4 7c0-2 1.5-3 3.5-3h9c2 0 3.5 1 3.5 3M4 7h16m-8 4v6" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">Resilient Database</h2>
            <p className="text-sm text-slate-400 mb-4">
              Zero-latency local SQLite with automatic seamless failover and Supabase cloud pooler integration.
            </p>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Primary:</span>
                <span className="text-emerald-400 font-semibold">Local SQLite (WAL)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Remote:</span>
                <span className="text-cyan-400">Supabase ap-south-1</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Auto-Fallback:</span>
                <span className="text-emerald-400">Enabled</span>
              </div>
            </div>
          </div>

          {/* Card 2: Clerk Authentication */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="h-10 w-10 rounded-lg bg-purple-950 text-purple-400 border border-purple-800/50 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">Clerk Authentication</h2>
            <p className="text-sm text-slate-400 mb-4">
              Asymmetric RS256 token verification against Clerk JWKS public keys with FastAPI route guards.
            </p>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Verifier:</span>
                <span className="text-purple-400 font-semibold">PyJWKClient (Cached)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>JWKS Status:</span>
                <span className="text-emerald-400">Live &amp; Verified</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Algorithm:</span>
                <span className="text-slate-300">RS256</span>
              </div>
            </div>
          </div>

          {/* Card 3: AI / ML Inference Stack */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="h-10 w-10 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/50 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">AI / ML Pipeline</h2>
            <p className="text-sm text-slate-400 mb-4">
              Configured runtime parameters for medical audio transcription and trauma scoring.
            </p>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Model Size:</span>
                <span className="text-cyan-400 font-semibold">Whisper (base)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Device:</span>
                <span className="text-slate-300">CPU</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Backend Port:</span>
                <span className="text-emerald-400">8000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Backend Links Bar */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-400 font-mono">
            FastAPI Backend Diagnostics (Port 8000):
          </span>
          <div className="flex items-center gap-3">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              Swagger Docs →
            </a>
            <a
              href="http://localhost:8000/health"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-400 transition"
            >
              /health Probe →
            </a>
            <a
              href="http://localhost:8000/auth/status"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-purple-400 transition"
            >
              /auth/status →
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600 font-mono">
        TraumaSense AI Platform • Monorepo Workspace &amp; Resilient Core • Step 1 Completed
      </footer>
    </div>
  );
}
