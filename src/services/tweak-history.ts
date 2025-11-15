import { createClient } from "@/utils/supabase/client";
import type { Tweak } from "@/types/tweak.types";

export async function saveTweakHistory({
  userId,
  tweaks,
  name,
}: {
  userId: string;
  tweaks: Tweak[];
  name?: string;
}) {
  const supabase = createClient();
  const { error } = await supabase.from("tweak_history").insert([
    {
      user_id: userId,
      tweaks: JSON.stringify(tweaks),
      name,
      created_at: new Date().toISOString(),
    },
  ]);
  if (error) throw error;
}

export async function incrementTweakDownloads(tweakIds: string[]) {
  const supabase = createClient();
  for (const id of tweakIds) {
    await supabase.rpc("increment_download_count", { tweak_id: id });
  }
}
