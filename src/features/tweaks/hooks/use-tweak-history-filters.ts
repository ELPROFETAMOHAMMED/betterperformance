 "use client";

import { useMemo, useCallback } from "react";
import { useHistoryTweaks } from "@/features/history-tweaks/hooks/use-history-tweaks";
import type { TweakHistoryEntry } from "@/features/tweaks/types/tweak.types";
import { toast } from "sonner";

interface UseTweakHistoryFiltersResult {
  historyEntries: TweakHistoryEntry[] | undefined;
  historyTweakIds: Set<string>;
  favoriteTweakIds: Set<string>;
  userFavoriteSelections: TweakHistoryEntry[];
  userHistorySelections: TweakHistoryEntry[];
  isLoading: boolean;
  handleRefresh: (hasUser: boolean) => Promise<void>;
}

export function useTweakHistoryFilters(
  enabled: boolean
): UseTweakHistoryFiltersResult {
  const {
    data: historyEntries,
    isLoading: isHistoryLoading,
    isRefetching: isHistoryRefetching,
    refetch: refetchHistory,
  } = useHistoryTweaks(enabled);

  const {
    historyTweakIds,
    favoriteTweakIds,
    userFavoriteSelections,
    userHistorySelections,
  } = useMemo(() => {
    const historyIds = new Set<string>();
    const favoriteIds = new Set<string>();
    const favSelections: TweakHistoryEntry[] = [];
    const histSelections: TweakHistoryEntry[] = [];

    if (historyEntries) {
      for (const entry of historyEntries) {
        if (entry.isFavorite) {
          favSelections.push(entry);
          if (Array.isArray(entry.tweaks)) {
            (entry.tweaks as { id: string }[]).forEach((t) =>
              favoriteIds.add(t.id)
            );
          }
        } else {
          histSelections.push(entry);
          if (Array.isArray(entry.tweaks)) {
            (entry.tweaks as { id: string }[]).forEach((t) =>
              historyIds.add(t.id)
            );
          }
        }
      }
    }

    return {
      historyTweakIds: historyIds,
      favoriteTweakIds: favoriteIds,
      userFavoriteSelections: favSelections,
      userHistorySelections: histSelections,
    };
  }, [historyEntries]);

  const handleRefresh = useCallback(
    async (hasUser: boolean) => {
      if (!hasUser) return;
      try {
        await refetchHistory();
        toast.success("History refreshed");
      } catch (error) {
        console.error(error);
        toast.error("Failed to refresh");
      }
    },
    [refetchHistory]
  );

  return {
    historyEntries,
    historyTweakIds,
    favoriteTweakIds,
    userFavoriteSelections,
    userHistorySelections,
    isLoading: (isHistoryLoading || isHistoryRefetching) && enabled,
    handleRefresh,
  };
}


