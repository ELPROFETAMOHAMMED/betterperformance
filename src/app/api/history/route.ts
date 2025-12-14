import { createClient } from "@/shared/utils/supabase/server";
import type { TweakHistoryEntry } from "@/features/tweaks/types/tweak.types";
import { NextResponse } from "next/server";

interface TweakHistoryRow {
  id: string;
  name: string | null;
  created_at: string;
  tweaks: string | unknown;
  is_favorite: boolean | null;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("tweak_history")
      .select("id, name, created_at, tweaks, is_favorite")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const history: TweakHistoryEntry[] = (data || []).map((entry: TweakHistoryRow) => ({
      id: entry.id,
      name: entry.name,
      createdAt: entry.created_at,
      userId: user.id,
      tweaks: typeof entry.tweaks === "string" ? JSON.parse(entry.tweaks) : entry.tweaks,
      isFavorite: entry.is_favorite ?? false,
    }));

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching tweak history:", error);
    return NextResponse.json(
      { error: "Failed to fetch tweak history" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tweaks, name, isFavorite } = body;

    const { error } = await supabase.from("tweak_history").insert([
      {
        user_id: user.id,
        tweaks: JSON.stringify(tweaks),
        name,
        created_at: new Date().toISOString(),
        is_favorite: Boolean(isFavorite),
      },
    ]);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving tweak history:", error);
    return NextResponse.json(
      { error: "Failed to save tweak history" },
      { status: 500 }
    );
  }
}




