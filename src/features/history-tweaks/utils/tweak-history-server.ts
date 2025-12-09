import { createClient } from "@/shared/utils/supabase/server";
import type { TweakHistoryEntry } from "@/features/tweaks/types/tweak.types";

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

  return (data || []).map((entry: any) => ({
    id: entry.id,
    name: entry.name,
    createdAt: entry.created_at,
    userId,
    tweaks: JSON.parse(entry.tweaks),
    isFavorite: entry.is_favorite ?? false,
  }));
}

