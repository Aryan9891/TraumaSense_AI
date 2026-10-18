"use client";

import React from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import { EmotionAnalysis } from "@/lib/api";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface EmotionRadarChartProps {
  emotionScores?: EmotionAnalysis | Record<string, number> | null;
  title?: string;
  sizeClass?: string;
}

export default function EmotionRadarChart({
  emotionScores,
  title = "6-Axis Emotional Affect Profile",
  sizeClass = "h-72",
}: EmotionRadarChartProps) {
  const fear = Number(emotionScores?.fear || 0);
  const anxiety = Number(emotionScores?.anxiety || 0);
  const panic = Number(emotionScores?.panic || 0);
  const anger = Number(emotionScores?.anger || 0);
  const sadness = Number(emotionScores?.sadness || 0);
  const neutral = Number(emotionScores?.neutral || 0);

  const data = {
    labels: ["Fear", "Anxiety", "Panic", "Anger", "Sadness", "Neutral"],
    datasets: [
      {
        label: "Intensity (0 - 1.0)",
        data: [fear, anxiety, panic, anger, sadness, neutral],
        backgroundColor: "rgba(239, 68, 68, 0.25)",
        borderColor: "rgba(239, 68, 68, 0.9)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(239, 68, 68, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(239, 68, 68, 1)",
        pointRadius: 4,
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
          label: (context: { raw: unknown }) => `Intensity: ${(Number(context.raw) * 100).toFixed(1)}%`,
        },
      },
    },
    scales: {
      r: {
        angleLines: {
          color: "rgba(51, 65, 85, 0.5)",
        },
        grid: {
          color: "rgba(51, 65, 85, 0.4)",
        },
        pointLabels: {
          color: "#cbd5e1",
          font: {
            size: 11,
            weight: 600,
          },
        },
        ticks: {
          display: false,
          stepSize: 0.2,
        },
        min: 0,
        max: 1.0,
      },
    },
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          {title}
        </h4>
        <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
          NLP Multidimensional
        </span>
      </div>

      <div className={`relative w-full ${sizeClass}`}>
        <Radar data={data} options={options} />
      </div>

      {/* Numerical Indicators */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
        <div>
          <span className="text-[10px] text-slate-500 uppercase">Panic / Fear</span>
          <p className="text-xs font-mono font-bold text-red-400">
            {((fear + panic) / 2 * 100).toFixed(0)}%
          </p>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase">Anxiety</span>
          <p className="text-xs font-mono font-bold text-amber-400">
            {(anxiety * 100).toFixed(0)}%
          </p>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase">Anger / Sadness</span>
          <p className="text-xs font-mono font-bold text-indigo-400">
            {((anger + sadness) / 2 * 100).toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  );
}
