import { createClient } from "@/utils/supabase/client";
import type { TweakHistoryEntry } from "@/types/tweak.types";

export async function fetchUserTweakHistory(
  userId: string
): Promise<TweakHistoryEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tweak_history")
    .select("id, name, created_at, tweaks")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((entry: any) => ({
    id: entry.id,
    name: entry.name,
    createdAt: entry.created_at,
    userId,
    tweaks: JSON.parse(entry.tweaks),
  }));
}
