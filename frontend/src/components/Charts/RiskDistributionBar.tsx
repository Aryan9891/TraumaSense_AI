"use client";

import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface RiskDistributionBarProps {
  distribution?: Record<string, number>;
  title?: string;
}

export default function RiskDistributionBar({
  distribution = {},
  title = "SVI Risk Severity Breakdown",
}: RiskDistributionBarProps) {
  const low = distribution["LOW"] || 0;
  const moderate = distribution["MODERATE"] || 0;
  const high = distribution["HIGH"] || 0;
  const critical = distribution["CRITICAL"] || 0;
  const total = low + moderate + high + critical;

  const data = {
    labels: ["Low Risk", "Moderate Risk", "High Risk", "Critical Risk"],
    datasets: [
      {
        data: [low, moderate, high, critical],
        backgroundColor: [
          "#10b981", // Low (Emerald)
          "#f59e0b", // Moderate (Amber)
          "#f97316", // High (Orange)
          "#ef4444", // Critical (Red)
        ],
        borderColor: "#090d16",
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#cbd5e1",
          font: { size: 11, weight: 600 },
          padding: 16,
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        borderColor: "#334155",
        borderWidth: 1,
        titleColor: "#f8fafc",
        bodyColor: "#94a3b8",
        padding: 10,
        callbacks: {
          label: (context: { label: string; raw: unknown }) => {
            const val = Number(context.raw) || 0;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : "0";
            return ` ${context.label}: ${val} cases (${pct}%)`;
          },
        },
      },
    },
    cutout: "65%",
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          {title}
        </h4>
        <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
          Total: {total}
        </span>
      </div>

      <div className="relative h-60 w-full flex items-center justify-center">
        <Doughnut data={data} options={options} />

        {/* Center Total Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
          <span className="text-2xl font-black text-white">{total}</span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Cases</span>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-4 gap-2 mt-2 pt-3 border-t border-slate-800/80 text-center">
        <div className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-900/50">
          <span className="text-[10px] font-bold text-emerald-400 block">LOW</span>
          <span className="text-sm font-mono font-bold text-slate-200">{low}</span>
        </div>
        <div className="p-1.5 rounded-lg bg-amber-950/40 border border-amber-900/50">
          <span className="text-[10px] font-bold text-amber-400 block">MOD</span>
          <span className="text-sm font-mono font-bold text-slate-200">{moderate}</span>
        </div>
        <div className="p-1.5 rounded-lg bg-orange-950/40 border border-orange-900/50">
          <span className="text-[10px] font-bold text-orange-400 block">HIGH</span>
          <span className="text-sm font-mono font-bold text-slate-200">{high}</span>
        </div>
        <div className="p-1.5 rounded-lg bg-red-950/40 border border-red-900/50">
          <span className="text-[10px] font-bold text-red-400 block">CRIT</span>
          <span className="text-sm font-mono font-bold text-slate-200">{critical}</span>
        </div>
      </div>
    </div>
  );
}
