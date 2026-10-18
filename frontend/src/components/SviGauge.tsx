"use client";

import React from "react";
import { AlertTriangle, ShieldCheck, AlertOctagon, Flame } from "lucide-react";

interface SviGaugeProps {
  score: number;
  category: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  size?: number;
}

export default function SviGauge({ score, category, size = 220 }: SviGaugeProps) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));

  // Determine styling palette based on Risk Category
  const getCategoryMeta = () => {
    switch (category) {
      case "CRITICAL":
        return {
          color: "#ef4444",
          strokeClass: "stroke-red-500",
          textClass: "text-red-400",
          bgGlow: "rgba(239, 68, 68, 0.25)",
          badgeBg: "bg-red-950/80 border-red-600 text-red-300",
          icon: Flame,
          label: "CRITICAL RISK",
          description: "Immediate emergency intervention required",
        };
      case "HIGH":
        return {
          color: "#f97316",
          strokeClass: "stroke-orange-500",
          textClass: "text-orange-400",
          bgGlow: "rgba(249, 115, 22, 0.2)",
          badgeBg: "bg-orange-950/80 border-orange-600 text-orange-300",
          icon: AlertOctagon,
          label: "HIGH RISK",
          description: "Elevated danger / urgent officer review",
        };
      case "MODERATE":
        return {
          color: "#f59e0b",
          strokeClass: "stroke-amber-500",
          textClass: "text-amber-400",
          bgGlow: "rgba(245, 158, 11, 0.15)",
          badgeBg: "bg-amber-950/80 border-amber-600 text-amber-300",
          icon: AlertTriangle,
          label: "MODERATE RISK",
          description: "Support services & counselling recommended",
        };
      default:
        return {
          color: "#10b981",
          strokeClass: "stroke-emerald-500",
          textClass: "text-emerald-400",
          bgGlow: "rgba(16, 185, 129, 0.15)",
          badgeBg: "bg-emerald-950/80 border-emerald-600 text-emerald-300",
          icon: ShieldCheck,
          label: "LOW RISK",
          description: "Non-acute / standard counselling advisory",
        };
    }
  };

  const meta = getCategoryMeta();
  const IconComponent = meta.icon;

  // Gauge SVG Math (240-degree arc)
  const radius = (size - 36) / 2;
  const strokeWidth = 14;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (arcLength * safeScore) / 100;

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-xl backdrop-blur-sm relative overflow-hidden">
      {/* Background Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl transition-all duration-700"
        style={{
          background: `radial-gradient(circle at center, ${meta.bgGlow} 0%, transparent 70%)`,
        }}
      />

      {/* SVG Radial Gauge Arc */}
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size * 0.85}
          viewBox={`0 0 ${size} ${size * 0.85}`}
          className="overflow-visible"
        >
          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(150 ${center} ${center})`}
          />

          {/* Value Progress Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={meta.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(150 ${center} ${center})`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Digital Metric Readout */}
        <div className="absolute flex flex-col items-center justify-center text-center mt-2">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
            Stress SVI
          </span>
          <div className="flex items-baseline gap-1 my-0.5">
            <span
              className={`text-4xl font-black tracking-tight ${meta.textClass} ${
                category === "CRITICAL" ? "animate-pulse" : ""
              }`}
            >
              {safeScore.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-bold">/ 100</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            Vulnerability Index
          </span>
        </div>
      </div>

      {/* Risk Category Badge & Description */}
      <div className="mt-2 flex flex-col items-center text-center">
        <div
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black tracking-wider uppercase shadow-sm ${meta.badgeBg}`}
        >
          <IconComponent className="h-3.5 w-3.5" />
          <span>{meta.label}</span>
        </div>
        <p className="mt-1 text-xs text-slate-400 max-w-[200px]">
          {meta.description}
        </p>
      </div>
    </div>
  );
}
