"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SviGauge from "@/components/SviGauge";
import ShapVisualizer from "@/components/ShapVisualizer";
import EmotionRadarChart from "@/components/Charts/EmotionRadarChart";
import RiskDistributionBar from "@/components/Charts/RiskDistributionBar";
import StateMetricsMap from "@/components/Charts/StateMetricsMap";
import {
  getDashboardAnalytics,
  getAlerts,
  acknowledgeAlert,
  getComplaints,
  DashboardAnalytics,
  AlertDetailResponse,
  ComplaintDetail,
} from "@/lib/api";
import {
  ShieldAlert,
  Siren,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  X,
  FileCheck2,
  Send,
  Loader2,
  PhoneCall,
  Activity,
  Filter,
} from "lucide-react";

export default function OfficerDashboardPage() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [alerts, setAlerts] = useState<AlertDetailResponse[]>([]);
  const [complaints, setComplaints] = useState<ComplaintDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Inspector modal state
  const [selectedCase, setSelectedCase] = useState<ComplaintDetail | null>(null);

  // Filter state for Case Audit Table
  const [auditRiskFilter, setAuditRiskFilter] = useState("ALL");
  const [auditStateFilter, setAuditStateFilter] = useState("ALL");

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsData, alertsData, complaintsData] = await Promise.all([
        getDashboardAnalytics(),
        getAlerts({ limit: 20 }),
        getComplaints({ limit: 50 }),
      ]);
      setAnalytics(analyticsData);
      setAlerts(alertsData);
      setComplaints(complaintsData);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Dispatch / Acknowledge Action
  const handleAcknowledge = async (
    alertId: string,
    targetStatus: "ACKNOWLEDGED" | "RESOLVED" = "ACKNOWLEDGED"
  ) => {
    setActionInProgress(alertId);
    try {
      const updated = await acknowledgeAlert(alertId, targetStatus);
      // Update local alerts state immediately
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, ...updated } : a))
      );

      // Refresh analytics to reflect changes
      const refreshedAnalytics = await getDashboardAnalytics();
      setAnalytics(refreshedAnalytics);
    } catch (err) {
      console.error("Alert acknowledgment failed:", err);
    } finally {
      setActionInProgress(null);
    }
  };

  // Filter audit table
  const filteredComplaints = complaints.filter((c) => {
    const matchesRisk =
      auditRiskFilter === "ALL" ||
      c.risk_score?.risk_category === auditRiskFilter;
    const matchesState =
      auditStateFilter === "ALL" || c.state_location === auditStateFilter;
    return matchesRisk && matchesState;
  });

  const uniqueStates = Array.from(
    new Set(complaints.map((c) => c.state_location))
  ).filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-teal-700 selection:text-white">
      <Navbar />

      <main id="main-content" className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Dashboard Title & Actions Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-xs font-semibold tracking-wider uppercase text-teal-400">
                Crisis Response Console
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Responder Desk — Emergency Triage &amp; Case Management
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Operations console for monitoring incoming distress reports, active emergency alerts, and forensic SVI scoring.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            aria-label="Refresh operational data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-teal-400" : ""}`} />
            <span>Refresh Operations Data</span>
          </button>
        </header>

        {/* Top 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm backdrop-blur-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total Reports Filed
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white font-mono">
                {analytics?.total_complaints || 0}
              </span>
              <span className="text-xs text-slate-500">Intakes</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm backdrop-blur-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Active Triage Cases
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-teal-300 font-mono">
                {analytics?.active_cases || 0}
              </span>
              <span className="text-xs text-slate-500">In Review</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm backdrop-blur-sm">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
              High Risk Incidents
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-amber-400 font-mono">
                {analytics?.high_risk_alerts || 0}
              </span>
              <span className="text-xs text-slate-500">Tier 3</span>
            </div>
          </div>

          <div className="rounded-2xl border border-red-900/80 bg-red-950/30 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
                Critical Crisis Alerts
              </span>
              <Siren className="h-4 w-4 text-red-500 animate-pulse" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-red-400 font-mono">
                {analytics?.open_alerts_count || 0}
              </span>
              <span className="text-xs text-red-300/80">Pending Action</span>
            </div>
          </div>
        </div>

        {/* Real-Time Critical Alert Dispatch Feed */}
        <section className="rounded-2xl border border-red-900/60 bg-slate-900/70 p-6 shadow-sm backdrop-blur-sm space-y-4" aria-labelledby="active-alerts-heading">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-5 w-5 text-red-400" />
              <h2 id="active-alerts-heading" className="font-serif text-sm font-bold text-white uppercase tracking-wider">
                Active Crisis Dispatch Queue
              </h2>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-400">
              {alerts.length} Pending Feeds
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-8 text-center text-slate-500 text-xs">
              No active emergency dispatch alerts pending response.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {alerts.map((alert) => {
                const isDispatched = alert.status === "ACKNOWLEDGED";
                const isResolved = alert.status === "RESOLVED";

                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      alert.alert_level === "CRITICAL"
                        ? "border-red-800 bg-red-950/40"
                        : "border-orange-800 bg-orange-950/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            alert.alert_level === "CRITICAL"
                              ? "bg-red-600 text-white"
                              : "bg-orange-600 text-white"
                          }`}
                        >
                          {alert.alert_level} ALERT
                        </span>

                        <span
                          className={`rounded border px-2 py-0.5 text-[10px] font-mono font-semibold ${
                            isResolved
                              ? "bg-teal-950 text-teal-300 border-teal-800"
                              : isDispatched
                              ? "bg-amber-950 text-amber-300 border-amber-800"
                              : "bg-red-950 text-red-300 border-red-700 animate-pulse"
                          }`}
                        >
                          {alert.status}
                        </span>
                      </div>

                      <h3 className="font-serif text-sm font-bold text-white truncate">
                        {alert.complaint?.title || "Incident Distress Trigger"}
                      </h3>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          <span>{alert.complaint?.state_location || "Unknown"}</span>
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3 text-slate-500" />
                          <span>{new Date(alert.created_at).toLocaleTimeString()}</span>
                        </span>
                      </div>

                      {alert.dispatched_at && (
                        <p className="mt-2 text-[11px] font-mono text-teal-300 bg-slate-950/60 p-1.5 rounded border border-slate-800">
                          Dispatched: {new Date(alert.dispatched_at).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Officer Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      {!isDispatched && !isResolved ? (
                        <button
                          type="button"
                          onClick={() => handleAcknowledge(alert.id, "ACKNOWLEDGED")}
                          disabled={actionInProgress === alert.id}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-500 active:scale-95 px-3 py-2 text-xs font-semibold text-white shadow transition cursor-pointer disabled:opacity-50"
                          aria-label={`Acknowledge and dispatch alert ${alert.id}`}
                        >
                          {actionInProgress === alert.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                          <span>Acknowledge &amp; Dispatch</span>
                        </button>
                      ) : !isResolved ? (
                        <button
                          type="button"
                          onClick={() => handleAcknowledge(alert.id, "RESOLVED")}
                          disabled={actionInProgress === alert.id}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-teal-700 hover:bg-teal-600 active:scale-95 px-3 py-2 text-xs font-semibold text-white shadow transition cursor-pointer disabled:opacity-50"
                          aria-label={`Mark alert ${alert.id} resolved`}
                        >
                          {actionInProgress === alert.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          <span>Mark Case Resolved</span>
                        </button>
                      ) : (
                        <span className="text-xs text-teal-300 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          Dispatch Resolved
                        </span>
                      )}

                      <a
                        href="tel:112"
                        className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                        title="Direct Emergency Hotline"
                        aria-label="Call 112 emergency service"
                      >
                        <PhoneCall className="h-3.5 w-3.5 text-red-400" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 3-Column Visualizations Grid */}
        <section className="grid lg:grid-cols-3 gap-6" aria-label="Clinical Metrics Overview">
          <RiskDistributionBar
            distribution={analytics?.risk_distribution}
            title="SVI Severity Distribution"
          />

          <EmotionRadarChart
            emotionScores={analytics?.emotion_distribution}
            title="Mean Population Emotional Affect"
          />

          <StateMetricsMap
            stateWiseStats={analytics?.state_wise_stats}
            title="Geographic Case Concentration"
          />
        </section>

        {/* Case Audit Table & Review Queue */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm space-y-4" aria-labelledby="case-queue-heading">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 id="case-queue-heading" className="font-serif text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-teal-400" />
                Case Audit &amp; Review Queue
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Detailed record logs containing transcript forensics, SHAP attribution, and clinical scoring.
              </p>
            </div>

            {/* Table Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={auditRiskFilter}
                onChange={(e) => setAuditRiskFilter(e.target.value)}
                aria-label="Filter case queue by risk tier"
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Risk Tiers</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MODERATE">Moderate</option>
                <option value="LOW">Low</option>
              </select>

              <select
                value={auditStateFilter}
                onChange={(e) => setAuditStateFilter(e.target.value)}
                aria-label="Filter case queue by state"
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="ALL">All States</option>
                {uniqueStates.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Title &amp; Identifier</th>
                  <th className="p-3">State</th>
                  <th className="p-3">SVI</th>
                  <th className="p-3">Risk Tier</th>
                  <th className="p-3">Trauma Indicators</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredComplaints.slice(0, 15).map((complaint) => (
                  <tr
                    key={complaint.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3 font-semibold text-slate-200 truncate max-w-xs">
                      {complaint.title}
                    </td>
                    <td className="p-3 text-slate-400">
                      {complaint.state_location}
                    </td>
                    <td className="p-3 font-mono font-bold">
                      {complaint.risk_score?.svi_score?.toFixed(1) || "-"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          complaint.risk_score?.risk_category === "CRITICAL"
                            ? "bg-red-700 text-white"
                            : complaint.risk_score?.risk_category === "HIGH"
                            ? "bg-orange-700 text-white"
                            : complaint.risk_score?.risk_category === "MODERATE"
                            ? "bg-amber-700 text-white"
                            : "bg-teal-700 text-white"
                        }`}
                      >
                        {complaint.risk_score?.risk_category || "LOW"}
                      </span>
                    </td>
                    <td className="p-3">
                      {complaint.trauma_analysis?.violence_indicators ? (
                        <span className="text-[11px] font-semibold text-red-400">
                          WEAPON / THREAT
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">None detected</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="text-[11px] font-medium text-slate-300">
                        {complaint.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedCase(complaint)}
                        className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-200 transition cursor-pointer"
                        aria-label={`Audit case ${complaint.title}`}
                      >
                        Audit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Clinical Audit Modal View */}
        {selectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="audit-modal-title">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6">
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close audit modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div>
                <span className="text-xs font-mono text-teal-400 uppercase">
                  Clinical Audit &bull; {selectedCase.id}
                </span>
                <h2 id="audit-modal-title" className="font-serif text-xl font-bold text-white mt-1">
                  {selectedCase.title}
                </h2>
              </div>

              {selectedCase.risk_score && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <SviGauge
                    score={selectedCase.risk_score.svi_score}
                    category={selectedCase.risk_score.risk_category}
                    size={180}
                  />

                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                    <h3 className="font-serif text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Clinical Trauma Profile
                    </h3>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Violence Threat:</span>
                      <span className="font-semibold text-white">
                        {selectedCase.trauma_analysis?.violence_indicators ? "CONFIRMED" : "NEGATIVE"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Suicidal Risk:</span>
                      <span className="font-semibold text-amber-400 font-mono">
                        {((selectedCase.trauma_analysis?.suicidal_ideation || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Acoustic Distress:</span>
                      <span className="font-semibold text-teal-300 font-mono">
                        {selectedCase.acoustic_features?.pitch_f0
                          ? `${selectedCase.acoustic_features.pitch_f0} Hz`
                          : "N/A (Text)"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {selectedCase.risk_score?.shap_explanations && (
                <ShapVisualizer tokens={selectedCase.risk_score.shap_explanations} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
