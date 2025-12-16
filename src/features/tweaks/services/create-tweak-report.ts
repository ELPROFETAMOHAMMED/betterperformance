import { createClient } from "@/shared/utils/supabase/server";
import type { CreateTweakReportParams, TweakReport } from "../types/tweak-report.types";

export async function createTweakReport({
  tweakId,
  title,
  description,
  riskLevel,
}: CreateTweakReportParams): Promise<TweakReport> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("tweak_reports")
    .insert({
      tweak_id: tweakId,
      user_id: user.id,
      title,
      description,
      risk_level: riskLevel,
    })
    .select()
    .single();

  if (error) {
    // Check for unique constraint violation (code 23505 in Postgres)
    if (error.code === "23505") {
      throw new Error("You have already reported this tweak");
    }
    console.error("Error creating tweak report:", error);
    throw new Error("Failed to create tweak report");
  }

  return data as TweakReport;
}
