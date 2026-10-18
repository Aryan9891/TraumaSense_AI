"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  ShieldAlert,
  Mic,
  BrainCircuit,
  FileCheck2,
  ArrowRight,
  Radio,
  Sparkles,
  Server,
  Lock,
  Globe2,
  PhoneCall,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { apiClient } from "@/lib/api";

export default function LandingPage() {
  const [backendStatus, setBackendStatus] = useState<{
    healthy: boolean;
    dbMode?: string;
    loading: boolean;
  }>({
    healthy: true,
    dbMode: "local_sqlite",
    loading: true,
  });

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await apiClient.get("/health");
        setBackendStatus({
          healthy: res.data?.status === "ok",
          dbMode: res.data?.db_mode || "local_sqlite",
          loading: false,
        });
      } catch {
        setBackendStatus({
          healthy: false,
          dbMode: "offline",
          loading: false,
        });
      }
    }
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-red-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-900">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-red-600/15 via-rose-600/10 to-indigo-600/15 blur-[120px] pointer-events-none rounded-full" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 text-center">
            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-1.5 text-xs shadow-lg backdrop-blur-md mb-8">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-medium">
                Clinical AI Engine:
              </span>
              <span className="text-emerald-400 font-bold uppercase tracking-wider">
                {backendStatus.loading
                  ? "Connecting..."
                  : backendStatus.healthy
                  ? "Operational (100% Online)"
                  : "Standby Mode"}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 font-mono text-[11px]">
                DB: {backendStatus.dbMode}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1] max-w-4xl mx-auto">
              Real-Time Trauma AI &amp;
              <span className="block bg-gradient-to-r from-red-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">
                Multimodal SVI Crisis Triage
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Empowering victims and first responders across India with real-time acoustic signal biomarkers, 7-language crisis NLP, explainable SHAP weights, and automated high-risk emergency dispatch.
            </p>

            {/* Dual Pathway Action Buttons */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/portal"
                className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-red-950/60 hover:brightness-110 active:scale-95 transition-all"
              >
                <ShieldAlert className="h-5 w-5" />
                <span>Report Distress Incident</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/90 px-6 py-4 text-sm font-bold text-slate-200 hover:bg-slate-800 hover:text-white active:scale-95 transition-all shadow-md"
              >
                <Activity className="h-5 w-5 text-indigo-400" />
                <span>Officer Triage Command</span>
              </Link>

              <Link
                href="/portal/history"
                className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-4 text-sm font-medium text-slate-400 hover:text-slate-200 hover:border-slate-700 transition"
              >
                <FileCheck2 className="h-4 w-4" />
                <span>Track Case</span>
              </Link>
            </div>

            {/* Capability Feature Badges */}
            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-xs">
              <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-800/80 bg-slate-900/40 p-2.5 text-slate-300">
                <Mic className="h-4 w-4 text-red-400" />
                <span>Librosa Speech DSP</span>
              </div>
              <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-800/80 bg-slate-900/40 p-2.5 text-slate-300">
                <Globe2 className="h-4 w-4 text-cyan-400" />
                <span>7 Indian Languages</span>
              </div>
              <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-800/80 bg-slate-900/40 p-2.5 text-slate-300">
                <BrainCircuit className="h-4 w-4 text-indigo-400" />
                <span>SHAP Token Audit</span>
              </div>
              <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-800/80 bg-slate-900/40 p-2.5 text-slate-300">
                <Lock className="h-4 w-4 text-emerald-400" />
                <span>Clerk + Resilient DB</span>
              </div>
            </div>
          </div>
        </section>

        {/* Core Architecture Highlights Section */}
        <section className="py-16 bg-slate-950/60 border-b border-slate-900">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-red-400 bg-red-950/50 px-3 py-1 rounded-full border border-red-800">
                Multimodal AI Pipeline
              </span>
              <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
                Engineered for High-Stakes Crisis Response
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Four decoupled inference microservices synchronize signal processing, clinical psychology, and prescriptive legal triage in sub-second response times.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-red-950/80 border border-red-800 flex items-center justify-center text-red-400 mb-4">
                    <Mic className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    Acoustic Biomarkers
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Tracks fundamental pitch (YIN $F_0$), RMS energy, spectral centroid, and hesitation silence pauses to quantify vocal panic independent of words.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-red-400">
                  Librosa + Whisper ASR
                </div>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-4">
                    <Globe2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    Multilingual NLP
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Evaluates crisis narratives across English, Hindi, Bengali, Marathi, Tamil, Telugu, and Odia with C-SSRS suicidal ideation and weapon detection.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-cyan-400">
                  Indic-BERT + Crisis Lexicon
                </div>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400 mb-4">
                    <BrainCircuit className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    SHAP Explainability
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Extracts exact influential keywords and token perturbation weights so officers inspect why the platform flagged a specific threat tier.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-indigo-400">
                  Token Marginal Attribution
                </div>
              </div>

              {/* Feature 4 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400 mb-4">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    SVI Triage Engine
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Calculates Stress Vulnerability Index (0–100) with clinical override guards and triggers auto-dispatched emergency alerts.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-amber-400">
                  Prescriptive Action Routing
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Helplines Callout Section */}
        <section className="py-12 bg-slate-900/30">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <h3 className="text-lg font-bold text-slate-200 mb-2">
              Immediate Safety &amp; Emergency Helpline Directory
            </h3>
            <p className="text-xs text-slate-400 mb-6 max-w-lg mx-auto">
              If you or someone around you is in immediate danger, do not wait for online processing. Contact these toll-free national services immediately:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <a
                href="tel:112"
                className="flex flex-col items-center p-4 rounded-xl border border-red-800/60 bg-red-950/40 hover:bg-red-900/50 transition cursor-pointer"
              >
                <PhoneCall className="h-5 w-5 text-red-400 mb-1" />
                <span className="text-xs font-semibold text-slate-300">National Emergency</span>
                <span className="text-xl font-black text-red-400">112</span>
              </a>

              <a
                href="tel:181"
                className="flex flex-col items-center p-4 rounded-xl border border-pink-800/60 bg-pink-950/40 hover:bg-pink-900/50 transition cursor-pointer"
              >
                <PhoneCall className="h-5 w-5 text-pink-400 mb-1" />
                <span className="text-xs font-semibold text-slate-300">Women in Distress</span>
                <span className="text-xl font-black text-pink-400">181</span>
              </a>

              <a
                href="tel:1098"
                className="flex flex-col items-center p-4 rounded-xl border border-amber-800/60 bg-amber-950/40 hover:bg-amber-900/50 transition cursor-pointer"
              >
                <PhoneCall className="h-5 w-5 text-amber-400 mb-1" />
                <span className="text-xs font-semibold text-slate-300">Childline Service</span>
                <span className="text-xl font-black text-amber-400">1098</span>
              </a>

              <a
                href="tel:14416"
                className="flex flex-col items-center p-4 rounded-xl border border-cyan-800/60 bg-cyan-950/40 hover:bg-cyan-900/50 transition cursor-pointer"
              >
                <PhoneCall className="h-5 w-5 text-cyan-400 mb-1" />
                <span className="text-xs font-semibold text-slate-300">Tele-MANAS Support</span>
                <span className="text-xl font-black text-cyan-400">14416</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-red-500" />
            <span className="font-bold text-slate-300">TraumaSense AI</span>
            <span>&copy; 2026 National Clinical AI Initiative</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/portal" className="hover:text-slate-300 transition">
              Victim Portal
            </Link>
            <Link href="/portal/history" className="hover:text-slate-300 transition">
              Case Tracker
            </Link>
            <Link href="/admin" className="hover:text-slate-300 transition">
              Officer Triage
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
