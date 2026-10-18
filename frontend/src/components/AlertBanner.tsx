"use client";

import React from "react";
import { AlertCircle, PhoneCall, ShieldAlert, Siren } from "lucide-react";

interface AlertBannerProps {
  sviScore: number;
  riskCategory: string;
  incidentTitle?: string;
}

export default function AlertBanner({
  sviScore,
  riskCategory,
  incidentTitle,
}: AlertBannerProps) {
  // Only render for high/critical distress cases
  const isCritical = riskCategory === "CRITICAL" || sviScore >= 76.0;
  const isHigh = riskCategory === "HIGH" || sviScore >= 51.0;

  if (!isCritical && !isHigh) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl border p-5 shadow-2xl relative overflow-hidden transition-all duration-500 mb-6 ${
        isCritical
          ? "border-red-600 bg-gradient-to-r from-red-950/95 via-rose-950/90 to-slate-950 text-red-100 shadow-red-950/50"
          : "border-orange-600 bg-gradient-to-r from-orange-950/95 via-amber-950/90 to-slate-950 text-orange-100 shadow-orange-950/40"
      }`}
    >
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Severity Badge & Alert Headline */}
        <div className="flex items-start gap-3.5">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg ${
              isCritical
                ? "bg-red-600 text-white animate-bounce shadow-red-900"
                : "bg-orange-600 text-white shadow-orange-900"
            }`}
          >
            {isCritical ? <Siren className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider ${
                  isCritical ? "bg-red-500 text-white" : "bg-orange-500 text-white"
                }`}
              >
                {isCritical ? "CRITICAL EMERGENCY INTERVENTION" : "HIGH-RISK ALERT ESCALATED"}
              </span>
              <span className="text-xs font-mono font-bold text-slate-300">
                SVI: {sviScore.toFixed(1)}/100
              </span>
            </div>

            <h4 className="mt-1 text-base font-bold text-white tracking-tight">
              {isCritical
                ? "Emergency Response Protocols Activated"
                : "Priority Officer Review Initiated"}
            </h4>

            <p className="mt-0.5 text-xs text-slate-300 max-w-2xl leading-relaxed">
              {incidentTitle && <span className="font-semibold text-white">&quot;{incidentTitle}&quot;: </span>}
              Acute trauma and threat markers detected. This case has been dispatched to the emergency triage queue. If you or someone nearby is in immediate physical danger, contact emergency services directly.
            </p>
          </div>
        </div>

        {/* Right: Quick Action Call Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
          <a
            href="tel:112"
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-red-950 transition-all cursor-pointer"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Call 112 (Police)</span>
          </a>

          <a
            href="tel:181"
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 rounded-xl border border-pink-700 bg-pink-950/70 hover:bg-pink-900/70 px-3.5 py-2.5 text-xs font-bold text-pink-200 transition-all cursor-pointer"
          >
            <PhoneCall className="h-4 w-4 text-pink-400" />
            <span>181 Women</span>
          </a>

          <a
            href="tel:14416"
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 rounded-xl border border-cyan-700 bg-cyan-950/70 hover:bg-cyan-900/70 px-3.5 py-2.5 text-xs font-bold text-cyan-200 transition-all cursor-pointer"
          >
            <AlertCircle className="h-4 w-4 text-cyan-400" />
            <span>14416 Tele-MANAS</span>
          </a>
        </div>
      </div>
    </div>
  );
}
