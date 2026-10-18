/**
 * TraumaSense AI - Frontend API Client & TypeScript Schema Contracts
 *
 * Provides typed Axios client and interfaces mirroring backend Pydantic models.
 */

import axios, { AxiosInstance } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// ==============================================================================
// TypeScript Interfaces (Parity with FastAPI Pydantic v2 Models)
// ==============================================================================

export interface UserResponse {
  id: string;
  clerk_id: string;
  email: string;
  role: "VICTIM" | "OFFICER" | "ADMIN";
  created_at: string;
}

export interface EmotionAnalysis {
  id?: string;
  fear: number;
  anger: number;
  sadness: number;
  panic: number;
  anxiety: number;
  neutral: number;
  created_at?: string;
}

export interface TraumaAnalysis {
  id?: string;
  violence_indicators: boolean;
  intimidation: number;
  social_isolation: number;
  suicidal_ideation: number;
  confidence_score: number;
  created_at?: string;
}

export interface AcousticFeatures {
  id?: string;
  pitch_f0: number;
  rms_energy: number;
  zcr: number;
  pause_ratio: number;
  spectral_centroid: number;
  created_at?: string;
}

export interface ShapToken {
  word: string;
  importance_weight: number;
}

export interface RiskScore {
  id?: string;
  svi_score: number;
  risk_category: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  shap_explanations: ShapToken[];
  created_at?: string;
}

export interface Recommendation {
  id?: string;
  action_type:
    | "COUNSELLING"
    | "LEGAL_AID"
    | "MEDICAL_ASSISTANCE"
    | "POLICE_INTERVENTION"
    | "WITNESS_PROTECTION"
    | "EMERGENCY_RESPONSE";
  description: string;
  is_dispatched: boolean;
  created_at?: string;
}

export interface AlertItem {
  id: string;
  complaint_id?: string;
  alert_level: "MODERATE" | "HIGH" | "CRITICAL";
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  dispatched_at?: string | null;
  created_at: string;
}

export interface AlertDetailResponse extends AlertItem {
  complaint?: {
    id: string;
    title: string;
    state_location: string;
    status: "PENDING" | "IN_REVIEW" | "ESCALATED" | "RESOLVED";
    language: string;
    created_at: string;
  } | null;
}

export interface AudioFile {
  id: string;
  storage_path: string;
  duration_sec: number;
  sample_rate: number;
  created_at: string;
}

export interface ComplaintDetail {
  id: string;
  user_id?: string | null;
  title: string;
  raw_text?: string | null;
  audio_file_url?: string | null;
  language: string;
  status: "PENDING" | "IN_REVIEW" | "ESCALATED" | "RESOLVED";
  state_location: string;
  created_at: string;
  user?: UserResponse | null;
  audio_file?: AudioFile | null;
  emotion_analysis?: EmotionAnalysis | null;
  trauma_analysis?: TraumaAnalysis | null;
  acoustic_features?: AcousticFeatures | null;
  risk_score?: RiskScore | null;
  recommendations: Recommendation[];
  alerts: AlertItem[];
}

export interface DashboardAnalytics {
  total_complaints: number;
  active_cases: number;
  high_risk_alerts: number;
  critical_risk_alerts: number;
  open_alerts_count: number;
  average_svi_score: number;
  state_wise_stats: Record<string, number>;
  state_distribution?: Record<string, number>;
  risk_distribution: Record<string, number>;
  emotion_distribution: Record<string, number>;
  status_distribution?: Record<string, number>;
  complaint_trends?: Array<{
    date: string;
    count: number;
    [key: string]: unknown;
  }>;
}

// ==============================================================================
// Typed API Client Methods
// ==============================================================================

export interface ComplaintCreateTextPayload {
  title: string;
  raw_text: string;
  language?: string;
  state_location: string;
  user_id?: string | null;
}

export async function submitTextComplaint(
  payload: ComplaintCreateTextPayload
): Promise<ComplaintDetail> {
  const response = await apiClient.post<ComplaintDetail>(
    "/complaints/submit-text",
    payload
  );
  return response.data;
}

export async function submitAudioComplaint(
  formData: FormData
): Promise<ComplaintDetail> {
  const response = await apiClient.post<ComplaintDetail>(
    "/complaints/submit-audio",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

export async function getComplaints(params?: {
  status?: string;
  risk_category?: string;
  state_location?: string;
  limit?: number;
}): Promise<ComplaintDetail[]> {
  const response = await apiClient.get<ComplaintDetail[]>("/complaints", {
    params,
  });
  return response.data;
}

export async function getComplaintById(id: string): Promise<ComplaintDetail> {
  const response = await apiClient.get<ComplaintDetail>(`/complaints/${id}`);
  return response.data;
}

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const response = await apiClient.get<DashboardAnalytics>(
    "/analytics/dashboard"
  );
  return response.data;
}

export async function getAlerts(params?: {
  status?: string;
  alert_level?: string;
  limit?: number;
}): Promise<AlertDetailResponse[]> {
  const response = await apiClient.get<AlertDetailResponse[]>("/alerts", {
    params,
  });
  return response.data;
}

export async function acknowledgeAlert(
  alertId: string,
  status: "ACKNOWLEDGED" | "RESOLVED" = "ACKNOWLEDGED"
): Promise<AlertDetailResponse> {
  const response = await apiClient.patch<AlertDetailResponse>(
    `/alerts/${alertId}/acknowledge`,
    { status }
  );
  return response.data;
}
