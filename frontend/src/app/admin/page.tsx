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
  LayoutDashboard,
  ShieldAlert,
  AlertTriangle,
  Siren,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  Eye,
  X,
  FileCheck2,
  Radio,
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Dashboard Title & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-xs font-bold tracking-widest uppercase text-red-400 font-mono">
                Real-Time Crisis Command
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Officer Triage &amp; Emergency Dispatch Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              National operations console for crisis intake monitoring, automated alert escalation, and forensic SVI auditing.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-red-400" : ""}`} />
            <span>Sync Live Telemetry</span>
          </button>
        </div>

        {/* Top 4 KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total Incidents
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">
                {analytics?.total_complaints || 0}
              </span>
              <span className="text-xs text-slate-500">Recorded</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Active Cases
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-indigo-400 font-mono">
                {analytics?.active_cases || 0}
              </span>
              <span className="text-xs text-slate-500">In Pipeline</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
            <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider block">
              High Risk Alerts
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-orange-400 font-mono">
                {analytics?.high_risk_alerts || 0}
              </span>
              <span className="text-xs text-slate-500">Tier 3</span>
            </div>
          </div>

          <div className="rounded-2xl border border-red-900/80 bg-red-950/30 p-5 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
                Critical Alerts (Open)
              </span>
              <Siren className="h-4 w-4 text-red-500 animate-pulse" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-red-400 font-mono">
                {analytics?.open_alerts_count || 0}
              </span>
              <span className="text-xs text-red-300/80">Pending Action</span>
            </div>
          </div>
        </div>

        {/* Real-Time Critical Alert Dispatch Feed */}
        <div className="rounded-2xl border border-red-900/60 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-400" />
                Live Emergency Dispatch Feed
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">
              {alerts.length} Active Feeds
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-8 text-center text-slate-500 text-xs">
              No active emergency dispatch alerts pending response.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
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
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                            alert.alert_level === "CRITICAL"
                              ? "bg-red-600 text-white"
                              : "bg-orange-600 text-white"
                          }`}
                        >
                          {alert.alert_level} ALERT
                        </span>

                        <span
                          className={`rounded border px-2 py-0.5 text-[10px] font-mono font-bold ${
                            isResolved
                              ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                              : isDispatched
                              ? "bg-amber-950 text-amber-300 border-amber-800"
                              : "bg-red-950 text-red-300 border-red-700 animate-pulse"
                          }`}
                        >
                          {alert.status}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white truncate">
                        {alert.complaint?.title || "Incident Distress Trigger"}
                      </h4>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          {alert.complaint?.state_location || "Unknown"}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          {new Date(alert.created_at).toLocaleTimeString()}
                        </span>
                      </div>

                      {alert.dispatched_at && (
                        <p className="mt-2 text-[11px] font-mono text-emerald-400 bg-slate-950/60 p-1.5 rounded border border-slate-800">
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
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-500 active:scale-95 px-3 py-2 text-xs font-bold text-white shadow-md transition cursor-pointer disabled:opacity-50"
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
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 px-3 py-2 text-xs font-bold text-white shadow-md transition cursor-pointer disabled:opacity-50"
                        >
                          {actionInProgress === alert.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          <span>Mark Case Resolved</span>
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          Dispatch Resolved
                        </span>
                      )}

                      <a
                        href="tel:112"
                        className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                        title="Direct Emergency Hotline"
                      >
                        <PhoneCall className="h-3.5 w-3.5 text-red-400" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3-Column Analytics Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
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
        </div>

        {/* Case Audit Table & Forensic Inspector */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-indigo-400" />
                Case Audit &amp; Forensic Review Queue
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Detailed record logs containing transcript forensics, SHAP attribution, and clinical scoring.
              </p>
            </div>

            {/* Table Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={auditRiskFilter}
                onChange={(e) => setAuditRiskFilter(e.target.value)}
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
              <thead className="bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
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
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          complaint.risk_score?.risk_category === "CRITICAL"
                            ? "bg-red-600 text-white"
                            : complaint.risk_score?.risk_category === "HIGH"
                            ? "bg-orange-600 text-white"
                            : complaint.risk_score?.risk_category === "MODERATE"
                            ? "bg-amber-600 text-white"
                            : "bg-emerald-600 text-white"
                        }`}
                      >
                        {complaint.risk_score?.risk_category || "LOW"}
                      </span>
                    </td>
                    <td className="p-3">
                      {complaint.trauma_analysis?.violence_indicators ? (
                        <span className="text-[11px] font-bold text-red-400">
                          WEAPON / THREAT
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">None detected</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="text-[11px] font-semibold text-slate-300">
                        {complaint.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedCase(complaint)}
                        className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-200 transition cursor-pointer"
                      >
                        Audit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Forensic Modal View */}
        {selectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6">
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div>
                <span className="text-xs font-mono text-red-400 uppercase">
                  Forensic Audit &bull; {selectedCase.id}
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  {selectedCase.title}
                </h3>
              </div>

              {selectedCase.risk_score && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <SviGauge
                    score={selectedCase.risk_score.svi_score}
                    category={selectedCase.risk_score.risk_category}
                    size={180}
                  />

                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                    <h5 className="font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Clinical Trauma Profile
                    </h5>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Violence Threat:</span>
                      <span className="font-bold text-white">
                        {selectedCase.trauma_analysis?.violence_indicators ? "CONFIRMED" : "NEGATIVE"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Suicidal Risk:</span>
                      <span className="font-bold text-amber-400 font-mono">
                        {((selectedCase.trauma_analysis?.suicidal_ideation || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Acoustic Distress:</span>
                      <span className="font-bold text-red-400 font-mono">
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
