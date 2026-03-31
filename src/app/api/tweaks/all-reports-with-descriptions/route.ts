import { createClient } from "@/shared/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all reports with all metadata
    const { data: allReports, error } = await supabase
      .from("tweak_reports")
      .select("id, tweak_id, user_id, title, status, risk_level, description, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching all reports:", error);
      throw error;
    }

    return NextResponse.json(allReports || []);
  } catch (error) {
    console.error("Error fetching all reports with descriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch all reports" },
      { status: 500 }
    );
  }
}
