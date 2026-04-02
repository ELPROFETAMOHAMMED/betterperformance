import { useMemo } from "react";
import { StarIcon, ClockIcon } from "@heroicons/react/24/outline";
import type { Tweak, TweakHistoryEntry } from "@/features/tweaks/types/tweak.types";
import React from "react";

export interface GroupSelectionItem {
  id: string;
  title: string;
  tweaks: Tweak[];
  icon: React.ReactNode;
  isUserSelection: boolean;
  isHistoryItem: boolean;
}

export function useGroupSelections(
  isFavoritesTree: boolean,
  isHistoryTree: boolean,
  userFavoriteSelections: TweakHistoryEntry[] | undefined,
  userHistorySelections: TweakHistoryEntry[] | undefined,
  allTweaksMap: Map<string, Tweak>,
  searchQuery: string
): GroupSelectionItem[] {
  return useMemo<GroupSelectionItem[]>(() => {
    if (isFavoritesTree && userFavoriteSelections) {
      return userFavoriteSelections
        .map((entry) => {
          const tweaks = (Array.isArray(entry.tweaks) ? (entry.tweaks as { id: string }[]) : [])
            .map((t) => allTweaksMap.get(t.id))
            .filter((t): t is Tweak => !!t);

          const matchedTweaks = searchQuery
            ? tweaks.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
            : tweaks;

          return {
            id: entry.id,
            title: entry.name || `Selection ${new Date(entry.createdAt).toLocaleDateString()}`,
            tweaks: matchedTweaks,
            icon: React.createElement(StarIcon, { className: "h-4 w-4 text-primary/70" }),
            isUserSelection: true,
            isHistoryItem: false,
          } as GroupSelectionItem;
        })
        .filter((g) => g.tweaks.length > 0);
    }

    if (isHistoryTree && userHistorySelections) {
      return userHistorySelections
        .map((entry) => {
          const tweaks = (Array.isArray(entry.tweaks) ? (entry.tweaks as { id: string }[]) : [])
            .map((t) => allTweaksMap.get(t.id))
            .filter((t): t is Tweak => !!t);

          const matchedTweaks = searchQuery
            ? tweaks.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
            : tweaks;

          return {
            id: entry.id,
            title: entry.name || `History - ${new Date(entry.createdAt).toLocaleString()}`,
            tweaks: matchedTweaks,
            icon: React.createElement(ClockIcon, { className: "h-4 w-4 text-muted-foreground" }),
            isUserSelection: true,
            isHistoryItem: true,
          } as GroupSelectionItem;
        })
        .filter((g) => g.tweaks.length > 0);
    }

    return [];
  }, [isFavoritesTree, isHistoryTree, userFavoriteSelections, userHistorySelections, allTweaksMap, searchQuery]);
}
