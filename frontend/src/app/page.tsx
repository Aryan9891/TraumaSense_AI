"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SeoJsonLd, { FAQ_ITEMS } from "@/components/SeoJsonLd";
import {
  ShieldAlert,
  Mic,
  FileCheck2,
  ArrowRight,
  Globe2,
  PhoneCall,
  Activity,
  HeartHandshake,
  Lock,
  ChevronDown,
  Stethoscope,
  Scale,
  Shield,
  Clock,
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-teal-700 selection:text-white">
      <SeoJsonLd />
      <Navbar />

      <main id="main-content" className="flex-1">
        {/* Human-Centered Editorial Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-900 bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950">
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 px-4 py-1.5 text-xs text-slate-300 shadow-sm backdrop-blur-md mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span className="font-medium text-slate-300">
                Clinical Triage Network:
              </span>
              <span className="font-semibold text-teal-300">
                {backendStatus.loading
                  ? "Verifying Services..."
                  : backendStatus.healthy
                  ? "Operational & Connected"
                  : "Standby Mode"}
              </span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-[11px] text-slate-400">
                DB: {backendStatus.dbMode}
              </span>
            </div>

            {/* Editorial Primary Heading */}
            <div className="max-w-4xl">
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
                When someone speaks in distress, every second and every unspoken pause matters.
              </h1>

              {/* Compassionate Subheadline */}
              <p className="mt-6 text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-3xl">
                TraumaSense helps survivors across India report acute trauma, gender-based violence, and mental health crises safely in 7 regional languages—Hindi, Bengali, Marathi, Tamil, Telugu, Odia, and English. By analyzing acoustic vocal tremor and linguistic distress markers simultaneously, our platform assists crisis responders in identifying life-threatening emergencies within seconds.
              </p>
            </div>

            {/* Action Pathways */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/portal"
                className="group inline-flex items-center gap-3 rounded-2xl bg-teal-700 hover:bg-teal-600 active:scale-95 px-6 py-4 text-sm font-semibold text-white shadow-lg transition-all"
                aria-label="File a confidential distress report"
              >
                <ShieldAlert className="h-5 w-5 text-teal-200" />
                <span>File a Confidential Report</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/admin"
                className="inline-flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 hover:text-white active:scale-95 px-6 py-4 text-sm font-semibold text-slate-200 shadow-sm transition-all"
                aria-label="Open officer responder command desk"
              >
                <Activity className="h-5 w-5 text-teal-400" />
                <span>Responder Command Desk</span>
              </Link>

              <Link
                href="/portal/history"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:text-slate-200 px-5 py-4 text-sm font-medium text-slate-400 transition"
                aria-label="Track existing case status"
              >
                <FileCheck2 className="h-4 w-4 text-slate-400" />
                <span>My Case Status</span>
              </Link>
            </div>

            {/* Key Clinical Tenets */}
            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-slate-300">
                <Mic className="h-4 w-4 text-teal-400 shrink-0" />
                <span>Acoustic Signal DSP</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-slate-300">
                <Globe2 className="h-4 w-4 text-teal-400 shrink-0" />
                <span>7 Indian Languages</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-slate-300">
                <Scale className="h-4 w-4 text-teal-400 shrink-0" />
                <span>Transparent Audit</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-slate-300">
                <Lock className="h-4 w-4 text-teal-400 shrink-0" />
                <span>Resilient Privacy</span>
              </div>
            </div>
          </div>
        </section>

        {/* How Clinical Triage Works Walkthrough */}
        <section className="py-16 bg-slate-950/80 border-b border-slate-900">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-semibold uppercase tracking-widest text-teal-400 bg-teal-950/60 px-3 py-1 rounded-full border border-teal-800/80">
                Clinical Workflow
              </span>
              <h2 className="font-serif mt-3 text-2xl sm:text-3xl font-bold text-white">
                How Clinical Triage Works
              </h2>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                When crisis reports arrive, multidisciplinary intelligence bridges acoustic physiology, trauma psychology, and immediate emergency dispatch.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-teal-950/80 border border-teal-800 flex items-center justify-center text-teal-300 mb-4 font-mono font-bold text-sm">
                    01
                  </div>
                  <h3 className="font-serif text-lg font-bold text-white mb-2">
                    Multilingual Voice &amp; Narrative Intake
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Survivors can speak or type in their preferred language. The system captures spontaneous verbal descriptions without requiring rigid structured questionnaires.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-teal-400">
                  Indic-NLP Core
                </div>
              </article>

              {/* Step 2 */}
              <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-teal-950/80 border border-teal-800 flex items-center justify-center text-teal-300 mb-4 font-mono font-bold text-sm">
                    02
                  </div>
                  <h3 className="font-serif text-lg font-bold text-white mb-2">
                    Acoustic Biomarkers &amp; Pause Analysis
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Speech audio is analyzed for fundamental pitch tremor ($F_0$), RMS intensity, spectral centroid, and hesitation silence pauses that indicate physiological terror.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-teal-400">
                  Digital Signal Processing
                </div>
              </article>

              {/* Step 3 */}
              <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-teal-950/80 border border-teal-800 flex items-center justify-center text-teal-300 mb-4 font-mono font-bold text-sm">
                    03
                  </div>
                  <h3 className="font-serif text-lg font-bold text-white mb-2">
                    C-SSRS &amp; Acute Threat Screening
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Validated Columbia Suicide Severity cues, weapon indicators, and coercion patterns are detected with transparent token attribution so officers understand why flags occurred.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-teal-400">
                  Transparent Attribution
                </div>
              </article>

              {/* Step 4 */}
              <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="h-10 w-10 rounded-xl bg-teal-950/80 border border-teal-800 flex items-center justify-center text-teal-300 mb-4 font-mono font-bold text-sm">
                    04
                  </div>
                  <h3 className="font-serif text-lg font-bold text-white mb-2">
                    Safety Planning &amp; Rapid Routing
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Generates a Stress Vulnerability Index (SVI 0–100) and actionable safety steps: immediate 112 emergency routing, medical support, shelter information, or legal protection.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-teal-400">
                  Prescriptive Interventions
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Privacy, Dignity & Consent Section */}
        <section className="py-16 bg-slate-900/30 border-b border-slate-900">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 sm:p-10 backdrop-blur-sm">
              <div className="max-w-3xl">
                <span className="text-xs font-semibold uppercase tracking-widest text-teal-400 bg-teal-950/80 px-3 py-1 rounded-full border border-teal-800">
                  Our Ethical Foundation
                </span>
                <h2 className="font-serif mt-3 text-2xl sm:text-3xl font-bold text-white">
                  Privacy, Dignity &amp; Consent by Design
                </h2>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  Trauma-informed care demands that technology serves the human being in crisis, not data brokers or surveillance apparatuses. TraumaSense adheres strictly to non-punitive, survivor-centered ethics:
                </p>

                <div className="mt-6 grid sm:grid-cols-2 gap-4 text-xs text-slate-300">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <Shield className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block mb-0.5">Zero Commercial Tracking</span>
                      <span>No advertising pixels, third-party analytics trackers, or commercial profiling. Statements are processed strictly for clinical and safety triage.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <Lock className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block mb-0.5">Role-Based Safeguards</span>
                      <span>Case details are accessible only by authenticated response personnel and designated medical officers under statutory confidentiality norms.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <HeartHandshake className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block mb-0.5">Trauma-Informed Pacing</span>
                      <span>Survivors can provide as much or as little detail as they feel safe to share, choosing either written text or gentle audio recording.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <Clock className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block mb-0.5">Resilient Local Persistence</span>
                      <span>Operates continuously with local database fallback even when upstream connectivity experiences latency or outages.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Semantic Frequently Asked Questions Section */}
        <section className="py-16 bg-slate-950/60 border-b border-slate-900" aria-labelledby="faq-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-semibold uppercase tracking-widest text-teal-400 bg-teal-950/60 px-3 py-1 rounded-full border border-teal-800/80">
                Frequently Asked Questions
              </span>
              <h2 id="faq-heading" className="font-serif mt-3 text-2xl sm:text-3xl font-bold text-white">
                Answers for Survivors &amp; Responding Officers
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Clear explanations regarding privacy, regional language handling, and emergency escalation.
              </p>
            </div>

            <div className="space-y-4">
              {FAQ_ITEMS.map((item, idx) => (
                <details
                  key={idx}
                  className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-slate-700"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-serif text-base font-semibold text-white focus:outline-none">
                    <span>{item.question}</span>
                    <span className="rounded-full bg-slate-800 p-1.5 text-slate-400 group-open:rotate-180 transition-transform">
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </summary>
                  <div className="mt-3 text-xs text-slate-300 leading-relaxed font-sans border-t border-slate-800/80 pt-3">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 24x7 Emergency Helplines Callout Section */}
        <section className="py-14 bg-slate-900/30">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2">
              National Emergency &amp; Crisis Helpline Directory
            </h2>
            <p className="text-xs text-slate-400 mb-8 max-w-xl mx-auto">
              If you or someone around you is in immediate danger or facing acute violence, do not wait for online case triage. Please call these toll-free national services immediately:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <a
                href="tel:112"
                className="flex flex-col items-center p-5 rounded-2xl border border-red-900/60 bg-red-950/30 hover:bg-red-900/40 transition cursor-pointer"
                aria-label="Call 112 National Emergency Response Service"
              >
                <PhoneCall className="h-5 w-5 text-red-400 mb-2" />
                <span className="text-xs font-semibold text-slate-200">National Emergency</span>
                <span className="font-mono text-2xl font-bold text-red-400 mt-1">112</span>
                <span className="text-[10px] text-slate-400 mt-1">Police, Fire &amp; Ambulance</span>
              </a>

              <a
                href="tel:181"
                className="flex flex-col items-center p-5 rounded-2xl border border-rose-900/60 bg-rose-950/30 hover:bg-rose-900/40 transition cursor-pointer"
                aria-label="Call 181 Women in Distress Helpline"
              >
                <PhoneCall className="h-5 w-5 text-rose-400 mb-2" />
                <span className="text-xs font-semibold text-slate-200">Women Helpline</span>
                <span className="font-mono text-2xl font-bold text-rose-400 mt-1">181</span>
                <span className="text-[10px] text-slate-400 mt-1">Domestic &amp; Gender Violence</span>
              </a>

              <a
                href="tel:1098"
                className="flex flex-col items-center p-5 rounded-2xl border border-amber-900/60 bg-amber-950/30 hover:bg-amber-900/40 transition cursor-pointer"
                aria-label="Call 1098 Childline Emergency Service"
              >
                <PhoneCall className="h-5 w-5 text-amber-400 mb-2" />
                <span className="text-xs font-semibold text-slate-200">Childline Service</span>
                <span className="font-mono text-2xl font-bold text-amber-400 mt-1">1098</span>
                <span className="text-[10px] text-slate-400 mt-1">Emergency Child Protection</span>
              </a>

              <a
                href="tel:14416"
                className="flex flex-col items-center p-5 rounded-2xl border border-teal-900/60 bg-teal-950/30 hover:bg-teal-900/40 transition cursor-pointer"
                aria-label="Call 14416 Tele-MANAS Mental Health Support"
              >
                <PhoneCall className="h-5 w-5 text-teal-400 mb-2" />
                <span className="text-xs font-semibold text-slate-200">Tele-MANAS</span>
                <span className="font-mono text-2xl font-bold text-teal-400 mt-1">14416</span>
                <span className="text-[10px] text-slate-400 mt-1">24x7 Mental Health Helpline</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Semantic Humanized Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-8 text-xs text-slate-400">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-teal-900/60 border border-teal-700/60 flex items-center justify-center text-teal-300">
                <HeartHandshake className="h-4 w-4" />
              </div>
              <span className="font-serif text-base font-bold text-white">TraumaSense India</span>
              <span className="text-slate-500">·</span>
              <span className="text-[11px] text-slate-400">Clinical Triage &amp; Crisis Response Initiative</span>
            </div>

            <nav className="flex items-center gap-5 text-xs" aria-label="Footer navigation">
              <Link href="/portal" className="hover:text-teal-300 transition">
                File a Report
              </Link>
              <Link href="/portal/history" className="hover:text-teal-300 transition">
                My Case Status
              </Link>
              <Link href="/admin" className="hover:text-teal-300 transition">
                Responder Desk
              </Link>
            </nav>
          </div>

          <div className="border-t border-slate-900 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              Supported Languages: English · Hindi (हिंदी) · Bengali (বাংলা) · Marathi (मराठी) · Tamil (தமிழ்) · Telugu (తెలుగు) · Odia (ଓଡ଼ିଆ)
            </div>
            <div>
              National Emergency Helplines: 112 (Emergency) · 181 (Women) · 1098 (Child) · 14416 (Tele-MANAS)
            </div>
          </div>

          <div className="border-t border-slate-900 pt-4 text-[11px] text-slate-500 leading-relaxed text-center sm:text-left">
            <p>
              <strong className="text-slate-400">Clinical Disclaimer:</strong> TraumaSense is an assistive clinical decision-support and risk triage platform designed to help crisis officers prioritize emergency statements. It does not replace professional medical diagnosis or statutory law enforcement response. In active emergencies, dial 112 or seek immediate medical attention.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
