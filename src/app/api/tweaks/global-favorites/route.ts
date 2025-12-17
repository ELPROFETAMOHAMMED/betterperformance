import { createClient } from "@/shared/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all favorites from all users (RLS policy allows this for authenticated users)
    const { data, error } = await supabase
      .from("tweak_history")
      .select("id, name, created_at, tweaks, is_favorite, user_id")
      .eq("is_favorite", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching global favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch global favorites" },
      { status: 500 }
    );
  }
}

