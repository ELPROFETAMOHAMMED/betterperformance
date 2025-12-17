import { createClient } from "@/shared/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all reports, grouped by tweak_id, with the most recent report description for each tweak
    const { data: allReports, error } = await supabase
      .from("tweak_reports")
      .select("tweak_id, description, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching all reports:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      throw error;
    }

    // Group by tweak_id and get the most recent report description for each tweak
    const tweakReportMap = new Map<string, { description: string; created_at: string }>();
    
    if (allReports) {
      for (const report of allReports) {
        if (!tweakReportMap.has(report.tweak_id)) {
          tweakReportMap.set(report.tweak_id, {
            description: report.description,
            created_at: report.created_at,
          });
        }
      }
    }

    // Convert to array format
    const result = Array.from(tweakReportMap.entries()).map(([tweak_id, report]) => ({
      tweak_id,
      description: report.description,
      created_at: report.created_at,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching all reports with descriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch all reports with descriptions" },
      { status: 500 }
    );
  }
}

