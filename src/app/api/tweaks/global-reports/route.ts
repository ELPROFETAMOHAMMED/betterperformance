import { createClient } from "@/shared/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all reports from all users (RLS policy allows this for authenticated users)
    const { data, error } = await supabase
      .from("tweak_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching global reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch global reports" },
      { status: 500 }
    );
  }
}

