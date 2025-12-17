import { createClient } from "@/shared/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch reports created by the current user
    const { data, error } = await supabase
      .from("tweak_reports")
      .select("tweak_id, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching user reports:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching user reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch user reports" },
      { status: 500 }
    );
  }
}

