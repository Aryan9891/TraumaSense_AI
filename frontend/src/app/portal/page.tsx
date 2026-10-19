"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import AudioRecorder from "@/components/AudioRecorder";
import SviGauge from "@/components/SviGauge";
import ShapVisualizer from "@/components/ShapVisualizer";
import AlertBanner from "@/components/AlertBanner";
import EmotionRadarChart from "@/components/Charts/EmotionRadarChart";
import {
  submitTextComplaint,
  submitAudioComplaint,
  ComplaintDetail,
} from "@/lib/api";
import {
  ShieldAlert,
  FileText,
  Mic,
  Send,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Scale,
  Shield,
  HeartHandshake,
  Stethoscope,
  Info,
  MapPin,
  Languages,
  FlaskConical,
} from "lucide-react";

const INDIAN_STATES = [
  "Maharashtra",
  "Delhi",
  "Karnataka",
  "West Bengal",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Odisha",
  "Kerala",
  "Gujarat",
  "Rajasthan",
  "Madhya Pradesh",
  "Punjab",
  "Haryana",
  "Bihar",
  "Assam",
  "Andhra Pradesh",
  "Jharkhand",
  "Chhattisgarh",
  "Uttarakhand",
  "Himachal Pradesh",
  "Goa",
  "Jammu & Kashmir",
];

const TARGET_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi (हिंदी)" },
  { code: "bn", label: "Bengali (বাংলা)" },
  { code: "mr", label: "Marathi (मराठी)" },
  { code: "ta", label: "Tamil (தமிழ்)" },
  { code: "te", label: "Telugu (తెలుగు)" },
  { code: "or", label: "Odia (ଓଡ଼ିଆ)" },
];

const SAMPLE_CRISIS_INPUTS = [
  {
    label: "Critical Weapon Endangerment (EN)",
    title: "Urgent Weapon Threat & Immediate Danger",
    text: "He threatened to kill me tonight with a weapon, I am terrified and feel like ending my life",
    lang: "en",
    state: "Maharashtra",
    badge: "CRITICAL",
    badgeColor: "bg-red-950/80 border-red-800 text-red-300",
  },
  {
    label: "High Distress Threat (Hindi)",
    title: "जान से मारने की धमकी (Police Assistance)",
    text: "मुझे जान से मारने की धमकी मिल रही है, मुझे बहुत डर और घबराहट हो रही है, कृपया पुलिस भेजें",
    lang: "hi",
    state: "Delhi",
    badge: "HIGH",
    badgeColor: "bg-amber-950/80 border-amber-800 text-amber-300",
  },
  {
    label: "General Legal Advisory (EN)",
    title: "District Legal Aid Timings Request",
    text: "I would like information about general legal aid timings in my district",
    lang: "en",
    state: "Karnataka",
    badge: "LOW",
    badgeColor: "bg-teal-950/80 border-teal-800 text-teal-300",
  },
];

export default function VictimPortalPage() {
  const [activeTab, setActiveTab] = useState<"text" | "audio">("text");
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [language, setLanguage] = useState("en");
  const [stateLocation, setStateLocation] = useState("Maharashtra");

  // Audio state
  const [recordedAudioFile, setRecordedAudioFile] = useState<File | null>(null);

  // Submission & Result state
  const [submitting, setSubmitting] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<ComplaintDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick fill sample crisis helper for evaluators
  const handleQuickFill = (sample: typeof SAMPLE_CRISIS_INPUTS[0]) => {
    setTitle(sample.title);
    setRawText(sample.text);
    setLanguage(sample.lang);
    setStateLocation(sample.state);
  };

  // Submit Complaint Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Please enter a brief incident title.");
      return;
    }

    if (activeTab === "text" && !rawText.trim()) {
      setErrorMessage("Please enter your written statement.");
      return;
    }

    if (activeTab === "audio" && !recordedAudioFile) {
      setErrorMessage("Please record a voice note or use 'Load Clinical Demo Recording (.wav)' before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      let result: ComplaintDetail;

      if (activeTab === "audio" && recordedAudioFile) {
        const formData = new FormData();
        formData.append("file", recordedAudioFile);
        formData.append("title", title.trim());
        formData.append("state_location", stateLocation);
        formData.append("language", language);
        if (rawText.trim()) {
          formData.append("raw_text", rawText.trim());
        }

        result = await submitAudioComplaint(formData);
      } else {
        result = await submitTextComplaint({
          title: title.trim(),
          raw_text: rawText.trim(),
          language,
          state_location: stateLocation,
        });
      }

      setAssessmentResult(result);
    } catch (err: unknown) {
      console.error("Submission error:", err);
      const msg = err instanceof Error ? err.message : "Unable to reach the clinical triage backend server.";
      setErrorMessage(`Assessment intake error: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form to file another report
  const handleReset = () => {
    setAssessmentResult(null);
    setTitle("");
    setRawText("");
    setRecordedAudioFile(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-teal-700 selection:text-white">
      <Navbar />

      <main id="main-content" className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-8">
        {/* Header with Reassuring Guidance */}
        <header className="mb-8 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="h-4 w-4 text-teal-400" />
            <span className="text-xs font-semibold tracking-wider uppercase text-teal-400">
              Confidential Distress Reporting
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight">
            File a Confidential Distress Report
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Share at your own pace. You can write in your preferred language or record a voice note. Our clinical triage system reviews vocal distress markers and verbal urgency indicators immediately to generate a safe, supportive action plan.
          </p>
        </header>

        {/* If Assessment Result exists, show Clinical Triage & Safety Plan */}
        {assessmentResult ? (
          <div className="space-y-6">
            {/* Completion Banner & Reset Action */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-teal-950/50 border border-teal-800 text-teal-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0" />
                <div>
                  <h2 className="font-serif text-base font-bold text-white">
                    Clinical Triage &amp; Safety Plan Completed (Case Ref: <span className="font-mono text-teal-300">{assessmentResult.id.slice(0, 8)}...</span>)
                  </h2>
                  <p className="text-xs text-teal-300/80">
                    Your report has been securely registered in the triage system and prioritized for response personnel.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Submit Another Statement</span>
              </button>
            </div>

            {/* High-Risk Intervention Banner (Only shows for SVI >= 76 / CRITICAL) */}
            {assessmentResult.risk_score && (
              <AlertBanner
                sviScore={assessmentResult.risk_score.svi_score}
                riskCategory={assessmentResult.risk_score.risk_category}
                incidentTitle={assessmentResult.title}
              />
            )}

            {/* Main Result Grid: SVI Gauge + Emotion Radar + Clinical Trauma Indicators */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Column 1: SVI Radial Gauge */}
              {assessmentResult.risk_score && (
                <SviGauge
                  score={assessmentResult.risk_score.svi_score}
                  category={assessmentResult.risk_score.risk_category}
                />
              )}

              {/* Column 2: 6-Axis Emotion Radar */}
              <EmotionRadarChart
                emotionScores={assessmentResult.emotion_analysis}
                title="Emotional Distress Spectrum"
              />

              {/* Column 3: Clinical Trauma Indicators */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm backdrop-blur-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-sm font-bold text-slate-200 mb-3">
                    Clinical Risk Markers (C-SSRS)
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400">Violence / Weapon Threat:</span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                          assessmentResult.trauma_analysis?.violence_indicators
                            ? "bg-red-950 text-red-300 border border-red-700 font-mono"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {assessmentResult.trauma_analysis?.violence_indicators
                          ? "DETECTED"
                          : "NONE NOTED"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400">Suicidal Ideation Risk:</span>
                      <span
                        className={`font-mono font-bold ${
                          (assessmentResult.trauma_analysis?.suicidal_ideation || 0) >= 0.5
                            ? "text-red-400"
                            : "text-slate-300"
                        }`}
                      >
                        {((assessmentResult.trauma_analysis?.suicidal_ideation || 0) * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400">Intimidation Level:</span>
                      <span className="font-mono font-bold text-amber-400">
                        {((assessmentResult.trauma_analysis?.intimidation || 0) * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400">Social Isolation / Coercion:</span>
                      <span className="font-mono font-bold text-teal-400">
                        {((assessmentResult.trauma_analysis?.social_isolation || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Jurisdiction: {assessmentResult.state_location}</span>
                  <span className="font-mono font-semibold uppercase">{assessmentResult.language}</span>
                </div>
              </div>
            </div>

            {/* Acoustic Biomarkers Panel (Shown when Audio is present) */}
            {assessmentResult.acoustic_features && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Mic className="h-4 w-4 text-teal-400" />
                  <h3 className="font-serif text-sm font-bold text-slate-200">
                    Acoustic Speech Biomarkers
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Pitch ($F_0$)</span>
                    <span className="text-base font-mono font-bold text-teal-300">
                      {assessmentResult.acoustic_features.pitch_f0} Hz
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">RMS Intensity</span>
                    <span className="text-base font-mono font-bold text-amber-300">
                      {assessmentResult.acoustic_features.rms_energy}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Pause Ratio</span>
                    <span className="text-base font-mono font-bold text-teal-300">
                      {(assessmentResult.acoustic_features.pause_ratio * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Zero Crossing</span>
                    <span className="text-base font-mono font-bold text-slate-300">
                      {assessmentResult.acoustic_features.zcr}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Spectral Centroid</span>
                    <span className="text-base font-mono font-bold text-teal-300">
                      {assessmentResult.acoustic_features.spectral_centroid} Hz
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Explainable AI (SHAP) Visualizer */}
            {assessmentResult.risk_score?.shap_explanations && (
              <ShapVisualizer tokens={assessmentResult.risk_score.shap_explanations} />
            )}

            {/* Prescriptive Triage Recommendations */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm backdrop-blur-sm">
              <h3 className="font-serif text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-teal-400" />
                Prescribed Safety &amp; Legal Interventions ({assessmentResult.recommendations.length})
              </h3>

              <div className="grid sm:grid-cols-2 gap-3">
                {assessmentResult.recommendations.map((rec, idx) => (
                  <div
                    key={rec.id || idx}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3"
                  >
                    <div className="h-8 w-8 rounded-lg bg-teal-950/80 border border-teal-800 flex items-center justify-center text-teal-300 shrink-0 mt-0.5">
                      {rec.action_type.includes("POLICE") || rec.action_type.includes("EMERGENCY") ? (
                        <Shield className="h-4 w-4 text-red-400" />
                      ) : rec.action_type.includes("MEDICAL") ? (
                        <Stethoscope className="h-4 w-4 text-teal-400" />
                      ) : (
                        <Scale className="h-4 w-4 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-300 block mb-0.5">
                        {rec.action_type.replace(/_/g, " ")}
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Intake Form View */
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Incident Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Clinical Evaluator Scenario Presets */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <FlaskConical className="h-4 w-4 text-teal-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Clinical Demo Presets (Evaluator Tools):
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_CRISIS_INPUTS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickFill(sample)}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition hover:brightness-125 cursor-pointer ${sample.badgeColor}`}
                      aria-label={`Fill ${sample.label}`}
                    >
                      <span>{sample.label}</span>
                      <span className="text-[10px] opacity-80 font-mono font-bold">
                        [{sample.badge}]
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Card */}
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-sm space-y-5"
              >
                {/* Title */}
                <div>
                  <label htmlFor="incident-title" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Incident Summary / Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="incident-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief description (e.g., Harassment & Weapon Threat Incident)"
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none transition"
                  />
                </div>

                {/* State & Language Selectors */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="state-select" className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>State / Jurisdiction <span className="text-red-400">*</span></span>
                    </label>
                    <select
                      id="state-select"
                      value={stateLocation}
                      onChange={(e) => setStateLocation(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 focus:border-teal-500 focus:outline-none"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="language-select" className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Languages className="h-3.5 w-3.5 text-slate-400" />
                      <span>Preferred Narrative Language</span>
                    </label>
                    <select
                      id="language-select"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 focus:border-teal-500 focus:outline-none"
                    >
                      {TARGET_LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Intake Mode Switcher */}
                <div>
                  <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-4" role="tablist">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "text"}
                      onClick={() => setActiveTab("text")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        activeTab === "text"
                          ? "bg-teal-700 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                      <span>Written Statement</span>
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "audio"}
                      onClick={() => setActiveTab("audio")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        activeTab === "audio"
                          ? "bg-teal-700 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Mic className="h-4 w-4" />
                      <span>Voice Note &amp; Acoustic Intake</span>
                    </button>
                  </div>

                  {activeTab === "text" ? (
                    <div>
                      <label htmlFor="statement-text" className="sr-only">
                        Written statement
                      </label>
                      <textarea
                        id="statement-text"
                        rows={5}
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder="Describe what occurred at your own pace. You can include details about threats made, weapons involved, immediate fears, or emotional distress..."
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none transition"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AudioRecorder
                        onAudioReady={(file) => setRecordedAudioFile(file)}
                        onAudioCleared={() => setRecordedAudioFile(null)}
                        disabled={submitting}
                      />

                      <div>
                        <label htmlFor="accompanying-notes" className="block text-xs font-medium text-slate-400 mb-1">
                          Optional Written Notes (Accompanying Audio):
                        </label>
                        <input
                          id="accompanying-notes"
                          type="text"
                          value={rawText}
                          onChange={(e) => setRawText(e.target.value)}
                          placeholder="Brief description or context for the recording..."
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-600 active:scale-95 py-3.5 text-sm font-semibold text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Performing Multilingual Clinical Triage...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Statement for Clinical Triage</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Confidentiality & Safety Protocol Info */}
            <aside className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-teal-400" />
                  <h3 className="font-serif text-sm font-bold text-slate-200">
                    Confidentiality &amp; Dignity
                  </h3>
                </div>
                <ul className="text-xs text-slate-300 space-y-2.5">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0 mt-0.5" />
                    <span>Your submission is encrypted in transit and at rest with role-restricted access.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0 mt-0.5" />
                    <span>Voice recordings are analyzed for physiological distress cues without retaining identifiable voiceprints.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0 mt-0.5" />
                    <span>High-severity incidents are immediately flagged for duty officers and local emergency services.</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-teal-400" />
                  <h3 className="font-serif text-sm font-bold text-slate-200">
                    Understanding the SVI Score
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The Stress Vulnerability Index (SVI 0–100) mathematically combines verbal crisis indicators, weapon threats, suicidal cues, emotional affect, and acoustic biomarkers into calibrated urgency tiers for prompt response.
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
