import { useMemo } from "react";
import { StarIcon, ClockIcon } from "@heroicons/react/24/outline";
import type { TweakHistoryEntry } from "@/features/tweaks/types/tweak.types";
import React from "react";
import type { SelectedItem } from "@/shared/types/selection.types";

export interface GroupSelectionItem {
  id: string;
  title: string;
  items: SelectedItem[];
  icon: React.ReactNode;
  isUserSelection: boolean;
  isHistoryItem: boolean;
}

export function useGroupSelections(
  isFavoritesTree: boolean,
  isHistoryTree: boolean,
  userFavoriteSelections: TweakHistoryEntry[] | undefined,
  userHistorySelections: TweakHistoryEntry[] | undefined,
  searchQuery: string
): GroupSelectionItem[] {
  return useMemo<GroupSelectionItem[]>(() => {
    if (isFavoritesTree && userFavoriteSelections) {
      return userFavoriteSelections
        .map((entry) => {
          const matchedTweaks = searchQuery
            ? (Array.isArray(entry.tweaks) ? entry.tweaks : []).filter((item) => {
                const title = item.item.title.toLowerCase();
                return title.includes(searchQuery.toLowerCase());
              })
            : (Array.isArray(entry.tweaks) ? entry.tweaks : []);

          return {
            id: entry.id,
            title: entry.name || `Selection ${new Date(entry.createdAt).toLocaleDateString()}`,
            items: matchedTweaks,
            icon: React.createElement(StarIcon, { className: "h-4 w-4 text-primary/70" }),
            isUserSelection: true,
            isHistoryItem: false,
          } as GroupSelectionItem;
        })
        .filter((g) => g.items.length > 0);
    }

    if (isHistoryTree && userHistorySelections) {
      return userHistorySelections
        .map((entry) => {
          const matchedTweaks = searchQuery
            ? (Array.isArray(entry.tweaks) ? entry.tweaks : []).filter((item) => {
                const title = item.item.title.toLowerCase();
                return title.includes(searchQuery.toLowerCase());
              })
            : (Array.isArray(entry.tweaks) ? entry.tweaks : []);

          return {
            id: entry.id,
            title: entry.name || `History - ${new Date(entry.createdAt).toLocaleString()}`,
            items: matchedTweaks,
            icon: React.createElement(ClockIcon, { className: "h-4 w-4 text-muted-foreground" }),
            isUserSelection: true,
            isHistoryItem: true,
          } as GroupSelectionItem;
        })
        .filter((g) => g.items.length > 0);
    }

    return [];
  }, [isFavoritesTree, isHistoryTree, userFavoriteSelections, userHistorySelections, searchQuery]);
}
