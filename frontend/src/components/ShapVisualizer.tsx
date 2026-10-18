"use client";

import React from "react";
import { BrainCircuit, Info } from "lucide-react";
import { ShapToken } from "@/lib/api";

interface ShapVisualizerProps {
  tokens: ShapToken[];
  title?: string;
}

export default function ShapVisualizer({
  tokens = [],
  title = "Explainable AI (SHAP) Token Attribution",
}: ShapVisualizerProps) {
  if (!tokens || tokens.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-center text-xs text-slate-500">
        No token attributions available for this narrative.
      </div>
    );
  }

  // Find max weight for proportional bar widths
  const maxWeight = Math.max(...tokens.map((t) => Math.abs(t.importance_weight)), 0.01);

  // Heatmap badge color helper
  const getTokenColor = (weight: number) => {
    const ratio = Math.min(1.0, Math.max(0.0, weight / maxWeight));
    if (ratio > 0.75) {
      return "bg-red-950/80 border-red-600 text-red-200 shadow-sm shadow-red-900/50";
    } else if (ratio > 0.45) {
      return "bg-orange-950/70 border-orange-600 text-orange-200";
    } else if (ratio > 0.2) {
      return "bg-amber-950/60 border-amber-600 text-amber-200";
    }
    return "bg-slate-800 border-slate-700 text-slate-300";
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            {title}
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
          Top {tokens.length} Influential Cues
        </span>
      </div>

      {/* Narrative Heatmap Badges */}
      <div className="mb-5 flex flex-wrap gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
        {tokens.map((token, idx) => (
          <span
            key={`${token.word}-${idx}`}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-mono font-medium transition-transform hover:scale-105 ${getTokenColor(
              token.importance_weight
            )}`}
          >
            <span>&quot;{token.word}&quot;</span>
            <span className="text-[10px] opacity-75 font-sans font-bold">
              +{token.importance_weight.toFixed(2)}
            </span>
          </span>
        ))}
      </div>

      {/* Horizontal Relative Importance Impact Bars */}
      <div className="space-y-2.5">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
          <span>Key Crisis Term</span>
          <span>Attribution Weight</span>
        </div>

        {tokens.slice(0, 6).map((token, idx) => {
          const percentage = Math.min(
            100,
            Math.max(8, (Math.abs(token.importance_weight) / maxWeight) * 100)
          );

          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-300 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span>
                  {token.word}
                </span>
                <span className="font-mono text-slate-400 font-semibold">
                  {token.importance_weight > 0 ? "+" : ""}
                  {token.importance_weight.toFixed(3)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 transition-all duration-700"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanatory Caption */}
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-indigo-950/30 p-2.5 border border-indigo-900/40 text-[11px] text-indigo-300">
        <Info className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
        <span>
          SHAP weights reflect marginalized token perturbations. Tokens with higher positive weights drove the automated SVI triage engine into higher severity escalation tiers.
        </span>
      </div>
    </div>
  );
}
