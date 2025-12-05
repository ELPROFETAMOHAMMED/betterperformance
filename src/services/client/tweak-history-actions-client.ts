import { createClient } from "@/utils/supabase/client";
import type { Tweak } from "@/types/tweak.types";

export async function renameTweakHistoryEntry(id: string, name: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("tweak_history")
    .update({ name })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteTweakHistoryEntry(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("tweak_history").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function updateTweakHistoryTweaks(id: string, tweaks: Tweak[]) {
  const supabase = createClient();
  const { error } = await supabase
    .from("tweak_history")
    .update({ tweaks: JSON.stringify(tweaks) })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function setTweakHistoryFavorite(
  id: string,
  isFavorite: boolean
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("tweak_history")
    .update({ is_favorite: isFavorite })
    .eq("id", id);

  if (error) {
    throw error;
  }
}


