"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { MapPin, TrendingUp } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface StateMetricsMapProps {
  stateWiseStats?: Record<string, number>;
  title?: string;
}

export default function StateMetricsMap({
  stateWiseStats = {},
  title = "Geographic Distress Volume by State (India)",
}: StateMetricsMapProps) {
  // Sort states by count descending
  const sortedEntries = Object.entries(stateWiseStats).sort(
    ([, a], [, b]) => b - a
  );

  const labels = sortedEntries.map(([state]) => state);
  const counts = sortedEntries.map(([, count]) => count);
  const totalCases = counts.reduce((acc, curr) => acc + curr, 0);

  const data = {
    labels,
    datasets: [
      {
        label: "Reported Complaints",
        data: counts,
        backgroundColor: "rgba(99, 102, 241, 0.75)",
        borderColor: "rgba(129, 140, 248, 1)",
        borderWidth: 1.5,
        borderRadius: 6,
        hoverBackgroundColor: "rgba(239, 68, 68, 0.85)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#0f172a",
        borderColor: "#334155",
        borderWidth: 1,
        titleColor: "#f8fafc",
        bodyColor: "#94a3b8",
        padding: 10,
        callbacks: {
          label: (context: { raw: unknown }) => `Volume: ${context.raw} cases`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#94a3b8",
          font: { size: 10, weight: 600 },
        },
      },
      y: {
        grid: {
          color: "rgba(51, 65, 85, 0.3)",
        },
        ticks: {
          color: "#94a3b8",
          font: { size: 10 },
          stepSize: 1,
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-indigo-400" />
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {title}
          </h4>
        </div>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
          <TrendingUp className="h-3 w-3 text-emerald-400" />
          {labels.length} Active Regions
        </span>
      </div>

      {/* Bar Chart View */}
      <div className="relative h-56 w-full mb-4">
        <Bar data={data} options={options} />
      </div>

      {/* Ranked State Breakdown Table */}
      <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex justify-between px-2">
          <span>Rank &amp; Jurisdiction</span>
          <span>Proportion</span>
          <span>Cases</span>
        </div>

        <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {sortedEntries.map(([state, count], idx) => {
            const percentage = totalCases > 0 ? ((count / totalCases) * 100).toFixed(0) : 0;
            return (
              <div
                key={state}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-400">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-200">{state}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 hidden sm:block">
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px] w-8 text-right">
                    {percentage}%
                  </span>
                  <span className="font-mono font-bold text-indigo-300 w-6 text-right">
                    {count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
