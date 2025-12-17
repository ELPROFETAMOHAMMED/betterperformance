import { useQuery } from "@tanstack/react-query";
import { fetchTweakHistory } from "../utils/tweak-history-client";
import type { TweakHistoryEntry } from "@/features/tweaks/types/tweak.types";

export function useHistoryTweaks(enabled: boolean = true) {
  return useQuery<TweakHistoryEntry[]>({
    queryKey: ["history-tweaks"],
    queryFn: fetchTweakHistory,
    enabled,
    refetchOnWindowFocus: false,
  });
}

