"use server";

import { fetchTweakCategories } from "@/features/tweaks/utils/tweaks-server";
import type { TweakCategory } from "@/features/tweaks/types/tweak.types";

export async function getSearchSuggestions(): Promise<TweakCategory[]> {
  try {
    return await fetchTweakCategories();
  } catch (error) {
    console.error("Failed to fetch search suggestions", error);
    return [];
  }
}
