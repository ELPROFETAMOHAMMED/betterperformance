"use server";

import { createClient } from "@/shared/utils/supabase/server";

export async function deleteTweakReport(reportId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    // Fetch report to verify ownership
    const { data: report, error: fetchError } = await supabase
      .from("tweak_reports")
      .select("user_id")
      .eq("id", reportId)
      .single();

    if (fetchError || !report) throw new Error("Report not found");
    
    // Allow deletion if owner or admin
    const isAdmin = user.user_metadata?.role === "admin";
    if (report.user_id !== user.id && !isAdmin) {
      throw new Error("You are not authorized to delete this report");
    }

    // Delete the report
    const { error: deleteError } = await supabase
      .from("tweak_reports")
      .delete()
      .eq("id", reportId);

    if (deleteError) throw deleteError;

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete report:", error);
    return { success: false, error: error.message };
  }
}
