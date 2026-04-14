"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { Tweak, TweakCategory } from "@/features/tweaks/types/tweak.types";
import type { Wallpaper } from "@/features/wallpapers/types/wallpaper.types";
import type { SelectedItem, SelectedWallpaperItem } from "@/shared/types/selection.types";

interface SelectionContextType {
  selectedItems: Map<string, SelectedItem>;
  selectedItemsArray: SelectedItem[];
  selectedTweaks: Map<string, Tweak>;
  selectedTweaksArray: Tweak[];
  selectedTweaksSet: Set<string>;
  selectedWallpapersArray: Wallpaper[];
  selectedWallpapersSet: Set<string>;
  lastSelectedWallpaperId: string | null;
  activeTweakId: string | null;
  setActiveTweakId: (id: string | null) => void;
  toggleTweak: (tweak: Tweak) => void;
  toggleWallpaper: (wallpaper: Wallpaper) => void;
  clearSelection: () => void;
  selectAll: (categories: TweakCategory[], isAdmin?: boolean) => void;
  updateTweakCounters: (tweakIds: string[], type: "download" | "favorite") => void;
  isInitialized: boolean;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

const SELECTED_ITEMS_STORAGE_KEY = "bp:selected_items";
const LEGACY_SELECTED_TWEAKS_STORAGE_KEY = "bp:selected_tweaks";

function getSelectionKey(type: SelectedItem["type"], id: string) {
  return `${type}:${id}`;
}

function getLastSelectedWallpaperId(selectedItems: SelectedItem[]) {
  const lastSelectedWallpaper = [...selectedItems].reverse().find(
    (selectedItem) => selectedItem.type === "wallpaper"
  );

  return lastSelectedWallpaper?.id ?? null;
}

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItem>>(new Map());
  const [activeTweakId, setActiveTweakId] = useState<string | null>(null);
  const [lastSelectedWallpaperId, setLastSelectedWallpaperId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedItems = localStorage.getItem(SELECTED_ITEMS_STORAGE_KEY);

    if (savedItems) {
      try {
        const parsed = JSON.parse(savedItems) as SelectedItem[];
        const map = new Map<string, SelectedItem>(
          parsed.map((selectedItem) => [getSelectionKey(selectedItem.type, selectedItem.id), selectedItem])
        );
        const firstSelectedTweak = parsed.find((selectedItem) => selectedItem.type === "tweak");

        setSelectedItems(map);
        setActiveTweakId(firstSelectedTweak?.id ?? null);
        setLastSelectedWallpaperId(getLastSelectedWallpaperId(parsed));
      } catch (error) {
        console.error("Failed to load selection from localStorage", error);
      }
    } else {
      const legacyTweaks = localStorage.getItem(LEGACY_SELECTED_TWEAKS_STORAGE_KEY);

      if (legacyTweaks) {
        try {
          const parsed = JSON.parse(legacyTweaks) as Tweak[];
          const map = new Map<string, SelectedItem>(
            parsed.map((tweak) => [
              getSelectionKey("tweak", tweak.id),
              { id: tweak.id, type: "tweak", item: tweak },
            ])
          );

          setSelectedItems(map);
          setActiveTweakId(parsed[0]?.id ?? null);
        } catch (error) {
          console.error("Failed to load legacy selection from localStorage", error);
        }
      }
    }

    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const timeoutId = setTimeout(() => {
      localStorage.setItem(
        SELECTED_ITEMS_STORAGE_KEY,
        JSON.stringify(Array.from(selectedItems.values()))
      );
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [selectedItems, isInitialized]);

  const toggleTweak = useCallback((tweak: Tweak) => {
    setSelectedItems((previousValue) => {
      const nextValue = new Map(previousValue);
      const key = getSelectionKey("tweak", tweak.id);

      if (nextValue.has(key)) {
        nextValue.delete(key);
      } else {
        nextValue.set(key, { id: tweak.id, type: "tweak", item: tweak });
      }

      return nextValue;
    });
  }, []);

  const toggleWallpaper = useCallback((wallpaper: Wallpaper) => {
    setSelectedItems((previousValue) => {
      const nextValue = new Map(previousValue);
      const key = getSelectionKey("wallpaper", wallpaper.id);

      if (nextValue.has(key)) {
        nextValue.delete(key);
        setLastSelectedWallpaperId((currentValue) => {
          if (currentValue !== wallpaper.id) {
            return currentValue;
          }

          const remainingWallpapers = Array.from(nextValue.values()).filter(
            (selectedItem): selectedItem is SelectedWallpaperItem => selectedItem.type === "wallpaper"
          );

          return remainingWallpapers[remainingWallpapers.length - 1]?.id ?? null;
        });
      } else {
        nextValue.set(key, { id: wallpaper.id, type: "wallpaper", item: wallpaper });
        setLastSelectedWallpaperId(wallpaper.id);
      }

      return nextValue;
    });
  }, []);

  useEffect(() => {
    const selectedTweaks = Array.from(selectedItems.values()).filter(
      (selectedItem) => selectedItem.type === "tweak"
    );
    const selectedTweakIds = new Set(selectedTweaks.map((selectedItem) => selectedItem.id));

    if (activeTweakId !== null && !selectedTweakIds.has(activeTweakId)) {
      setActiveTweakId(selectedTweaks[0]?.id ?? null);
    } else if (activeTweakId === null && selectedTweaks.length > 0) {
      setActiveTweakId(selectedTweaks[0]?.id ?? null);
    }

    setLastSelectedWallpaperId((currentValue) => {
      if (
        currentValue &&
        Array.from(selectedItems.values()).some(
          (selectedItem) => selectedItem.type === "wallpaper" && selectedItem.id === currentValue
        )
      ) {
        return currentValue;
      }

      return getLastSelectedWallpaperId(Array.from(selectedItems.values()));
    });
  }, [selectedItems, activeTweakId]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Map());
    setActiveTweakId(null);
    setLastSelectedWallpaperId(null);
  }, []);

  const selectAll = useCallback((categories: TweakCategory[], isAdmin: boolean = false) => {
    const nextTweaks = new Map<string, SelectedItem>();

    categories.forEach((category) => {
      category.tweaks?.forEach((tweak) => {
        if (isAdmin || tweak.is_visible) {
          nextTweaks.set(getSelectionKey("tweak", tweak.id), {
            id: tweak.id,
            type: "tweak",
            item: tweak,
          });
        }
      });
    });

    setSelectedItems((previousValue) => {
      const wallpapers = Array.from(previousValue.entries()).filter(([, selectedItem]) => {
        return selectedItem.type === "wallpaper";
      });

      return new Map([...wallpapers, ...nextTweaks.entries()]);
    });

    setActiveTweakId(Array.from(nextTweaks.values())[0]?.id ?? null);
  }, []);

  const updateTweakCounters = useCallback((tweakIds: string[], type: "download" | "favorite") => {
    setSelectedItems((previousValue) => {
      const nextValue = new Map(previousValue);

      tweakIds.forEach((id) => {
        const key = getSelectionKey("tweak", id);
        const selectedItem = nextValue.get(key);

        if (selectedItem?.type === "tweak") {
          nextValue.set(key, {
            ...selectedItem,
            item: {
              ...selectedItem.item,
              download_count:
                type === "download"
                  ? (selectedItem.item.download_count ?? 0) + 1
                  : selectedItem.item.download_count,
              favorite_count:
                type === "favorite"
                  ? (selectedItem.item.favorite_count ?? 0) + 1
                  : selectedItem.item.favorite_count,
            },
          });
        }
      });

      return nextValue;
    });
  }, []);

  const selectedItemsArray = useMemo(() => Array.from(selectedItems.values()), [selectedItems]);
  const selectedTweaks = useMemo(() => {
    return new Map(
      selectedItemsArray
        .filter((selectedItem): selectedItem is Extract<SelectedItem, { type: "tweak" }> => {
          return selectedItem.type === "tweak";
        })
        .map((selectedItem) => [selectedItem.id, selectedItem.item])
    );
  }, [selectedItemsArray]);
  const selectedTweaksArray = useMemo(() => Array.from(selectedTweaks.values()), [selectedTweaks]);
  const selectedTweaksSet = useMemo(() => new Set(selectedTweaks.keys()), [selectedTweaks]);
  const selectedWallpapersArray = useMemo(() => {
    return selectedItemsArray
      .filter((selectedItem): selectedItem is Extract<SelectedItem, { type: "wallpaper" }> => {
        return selectedItem.type === "wallpaper";
      })
      .map((selectedItem) => selectedItem.item);
  }, [selectedItemsArray]);
  const selectedWallpapersSet = useMemo(() => {
    return new Set(selectedWallpapersArray.map((wallpaper) => wallpaper.id));
  }, [selectedWallpapersArray]);

  const value = useMemo(
    () => ({
      selectedItems,
      selectedItemsArray,
      selectedTweaks,
      selectedTweaksArray,
      selectedTweaksSet,
      selectedWallpapersArray,
      selectedWallpapersSet,
      lastSelectedWallpaperId,
      activeTweakId,
      setActiveTweakId,
      toggleTweak,
      toggleWallpaper,
      clearSelection,
      selectAll,
      updateTweakCounters,
      isInitialized,
    }),
    [
      selectedItems,
      selectedItemsArray,
      selectedTweaks,
      selectedTweaksArray,
      selectedTweaksSet,
      selectedWallpapersArray,
      selectedWallpapersSet,
      lastSelectedWallpaperId,
      activeTweakId,
      toggleTweak,
      toggleWallpaper,
      clearSelection,
      selectAll,
      updateTweakCounters,
      isInitialized,
    ]
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
  const context = useContext(SelectionContext);

  if (context === undefined) {
    throw new Error("useSelection must be used within a SelectionProvider");
  }

  return context;
}
