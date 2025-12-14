import { createClient } from "@/shared/utils/supabase/server";
import type { TweakHistoryEntry } from "@/features/tweaks/types/tweak.types";

interface TweakHistoryRow {
  id: string;
  name: string | null;
  created_at: string;
  tweaks: string | unknown;
  is_favorite: boolean | null;
}

export async function fetchUserTweakHistory(
  userId: string
): Promise<TweakHistoryEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tweak_history")
    .select("id, name, created_at, tweaks, is_favorite")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map((entry: TweakHistoryRow) => ({
    id: entry.id,
    name: entry.name ?? undefined,
    createdAt: entry.created_at,
    userId,
    tweaks: typeof entry.tweaks === "string" ? JSON.parse(entry.tweaks) : entry.tweaks,
    isFavorite: entry.is_favorite ?? false,
  }));
}

