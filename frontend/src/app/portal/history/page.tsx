"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SviGauge from "@/components/SviGauge";
import ShapVisualizer from "@/components/ShapVisualizer";
import { getComplaints, ComplaintDetail } from "@/lib/api";
import {
  FileText,
  Search,
  Filter,
  MapPin,
  Clock,
  CheckCircle,
  AlertOctagon,
  Mic,
  Languages,
  Eye,
  X,
  RefreshCw,
  Loader2,
  HeartHandshake,
} from "lucide-react";

export default function CaseHistoryPage() {
  const [complaints, setComplaints] = useState<ComplaintDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [selectedCase, setSelectedCase] = useState<ComplaintDetail | null>(null);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const data = await getComplaints({ limit: 50 });
      setComplaints(data);
    } catch (err) {
      console.error("Error loading complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.state_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || c.status === statusFilter;

    const matchesRisk =
      riskFilter === "ALL" ||
      c.risk_score?.risk_category === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return "bg-teal-950/80 text-teal-300 border-teal-800";
      case "ESCALATED":
        return "bg-red-950/80 text-red-400 border-red-800 animate-pulse";
      case "IN_REVIEW":
        return "bg-amber-950/80 text-amber-300 border-amber-800";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  const getRiskBadge = (category?: string) => {
    switch (category) {
      case "CRITICAL":
        return "bg-red-700 text-white";
      case "HIGH":
        return "bg-orange-700 text-white";
      case "MODERATE":
        return "bg-amber-700 text-white";
      case "LOW":
        return "bg-teal-700 text-white";
      default:
        return "bg-slate-700 text-slate-300";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-teal-700 selection:text-white">
      <Navbar />

      <main id="main-content" className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-8">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FileText className="h-4 w-4 text-teal-400" />
              <span className="text-xs font-semibold tracking-wider uppercase text-teal-400">
                Confidential Case Registry
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Track Your Case Status &amp; Safety Recommendations
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Review filed incident statements, SVI clinical triage scores, and prescribed safety recommendations.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchCases}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            aria-label="Refresh case records"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-teal-400" : ""}`} />
            <span>Refresh Records</span>
          </button>
        </header>

        {/* Filter Controls Bar */}
        <div className="grid sm:grid-cols-3 gap-3 mb-6 p-4 rounded-2xl bg-slate-900/50 border border-slate-800" role="search" aria-label="Filter case history">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, state, or ID..."
              aria-label="Search cases"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by case status"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-teal-500 focus:outline-none"
            >
              <option value="ALL">Status: All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="ESCALATED">Escalated</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          {/* Risk Tier Filter */}
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-slate-500 shrink-0" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              aria-label="Filter by risk tier"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-teal-500 focus:outline-none"
            >
              <option value="ALL">Risk Tier: All Tiers</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MODERATE">Moderate</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Complaints Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500 mb-2" />
            <span className="text-xs font-semibold">Retrieving case records from database...</span>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500">
            <FileText className="h-10 w-10 mx-auto mb-2 text-slate-600" />
            <h2 className="font-serif text-sm font-bold text-slate-400">No cases match the query criteria.</h2>
            <p className="text-xs mt-1">Try adjusting the search query or status filters.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Case &amp; Title</th>
                    <th className="p-4">Jurisdiction</th>
                    <th className="p-4">Intake Modality</th>
                    <th className="p-4">SVI Score</th>
                    <th className="p-4">Risk Tier</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredComplaints.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-4 max-w-xs">
                        <div className="font-semibold text-slate-100 truncate">
                          {c.title}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Ref: {c.id.slice(0, 12)}...
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          <span>{c.state_location}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 uppercase font-mono mt-0.5">
                          <Languages className="h-3 w-3" />
                          <span>{c.language}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        {c.audio_file ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-300 bg-teal-950/60 border border-teal-800/60 px-2 py-0.5 rounded-full">
                            <Mic className="h-3 w-3" />
                            Voice Statement
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-slate-800/60 border border-slate-700/60 px-2 py-0.5 rounded-full">
                            <FileText className="h-3 w-3" />
                            Written Text
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-mono font-bold text-sm">
                        {c.risk_score?.svi_score?.toFixed(1) || "N/A"}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getRiskBadge(
                            c.risk_score?.risk_category
                          )}`}
                        >
                          {c.risk_score?.risk_category || "UNKNOWN"}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium ${getStatusBadge(
                            c.status
                          )}`}
                        >
                          {c.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedCase(c)}
                          className="inline-flex items-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition cursor-pointer"
                          aria-label={`Inspect case ${c.title}`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Clinical Case Review Modal */}
        {selectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="modal-case-title">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close case review modal"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Header */}
              <div>
                <span className="text-xs font-mono text-teal-400 uppercase">
                  Case Review &bull; {selectedCase.id}
                </span>
                <h2 id="modal-case-title" className="font-serif text-xl font-bold text-white mt-1">
                  {selectedCase.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {selectedCase.state_location}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(selectedCase.created_at).toLocaleString()}
                  </span>
                  <span>&bull;</span>
                  <span className="uppercase font-mono">Lang: {selectedCase.language}</span>
                </div>
              </div>

              {/* SVI Gauge & Key Metrics */}
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
                      <span className="text-slate-400">Violence Indicators:</span>
                      <span className="font-semibold text-white">
                        {selectedCase.trauma_analysis?.violence_indicators ? "YES" : "NO"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Suicidal Ideation:</span>
                      <span className="font-semibold text-amber-400 font-mono">
                        {((selectedCase.trauma_analysis?.suicidal_ideation || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Intimidation Score:</span>
                      <span className="font-semibold text-slate-200 font-mono">
                        {((selectedCase.trauma_analysis?.intimidation || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fear Intensity:</span>
                      <span className="font-semibold text-red-400 font-mono">
                        {((selectedCase.emotion_analysis?.fear || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Statement Transcript */}
              {selectedCase.raw_text && (
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Recorded Statement Narrative:
                  </span>
                  <p className="text-sm text-slate-200 leading-relaxed italic">
                    &quot;{selectedCase.raw_text}&quot;
                  </p>
                </div>
              )}

              {/* SHAP Visualizer */}
              {selectedCase.risk_score?.shap_explanations && (
                <ShapVisualizer tokens={selectedCase.risk_score.shap_explanations} />
              )}

              {/* Dispatched Recommendations */}
              <div>
                <h3 className="font-serif text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Prescribed Safety Actions ({selectedCase.recommendations.length})
                </h3>
                <div className="space-y-2">
                  {selectedCase.recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5 text-xs"
                    >
                      <CheckCircle className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-teal-300 uppercase mr-1">
                          [{rec.action_type}]:
                        </span>
                        <span className="text-slate-300">{rec.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
