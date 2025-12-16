export interface TweakReport {
  id: string;
  tweak_id: string;
  user_id: string;
  title: string;
  description: string;
  risk_level: "low" | "medium" | "high";
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  created_at: string;
  updated_at: string;
}

export interface CreateTweakReportParams {
  tweakId: string;
  title: string;
  description: string;
  riskLevel: "low" | "medium" | "high";
}

