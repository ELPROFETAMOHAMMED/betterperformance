 "use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Tweak, TweakCategory } from "@/features/tweaks/types/tweak.types";

interface UseSelectedTweaksParams {
  categories: TweakCategory[];
}

export function useSelectedTweaks({ categories }: UseSelectedTweaksParams) {
  const [selectedTweaks, setSelectedTweaks] = useState<Map<string, Tweak>>(
    () => new Map()
  );
  const [activeTweakId, setActiveTweakId] = useState<string | null>(null);

  // Pre-select tweaks coming from history/favorites (localStorage logic)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(
      "bp:preselectedTweaksFromHistory"
    );
    if (!raw) return;

    try {
      const ids = JSON.parse(raw) as string[];
      if (!Array.isArray(ids) || ids.length === 0) return;

      const idSet = new Set(ids);
      const map = new Map<string, Tweak>();

      for (const category of categories) {
        for (const tweak of category.tweaks || []) {
          if (idSet.has(tweak.id)) {
            map.set(tweak.id, tweak);
          }
        }
      }

      if (map.size > 0) {
        setSelectedTweaks(map);
        const lastId = Array.from(map.keys())[map.size - 1] ?? null;
        setActiveTweakId(lastId);
      }
    } catch (error) {
      console.error("Failed to restore tweaks from history", error);
    } finally {
      window.localStorage.removeItem("bp:preselectedTweaksFromHistory");
    }
  }, [categories]);

  const handleTweakToggle = useCallback((tweak: Tweak) => {
    setSelectedTweaks((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(tweak.id)) {
        newMap.delete(tweak.id);
      } else {
        newMap.set(tweak.id, tweak);
      }
      const stillSelected = newMap.has(tweak.id);
      setActiveTweakId(
        stillSelected
          ? tweak.id
          : Array.from(newMap.keys())[newMap.size - 1] ?? null
      );
      return newMap;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedTweaks(new Map());
    setActiveTweakId(null);
  }, []);

  const handleSelectAllTweaks = useCallback(() => {
    const newMap = new Map<string, Tweak>();
    categories.forEach((cat) => {
      cat.tweaks?.forEach((t) => newMap.set(t.id, t));
    });
    setSelectedTweaks(newMap);
    if (newMap.size > 0) {
      const last = Array.from(newMap.values()).pop();
      if (last) setActiveTweakId(last.id);
    }
  }, [categories]);

  const selectedTweaksArray = useMemo(
    () => Array.from(selectedTweaks.values()),
    [selectedTweaks]
  );

  const selectedTweaksSet = useMemo(
    () => new Set(selectedTweaks.keys()),
    [selectedTweaks]
  );

  const infoTweak = useMemo(() => {
    if (activeTweakId && selectedTweaks.has(activeTweakId)) {
      return selectedTweaks.get(activeTweakId) || null;
    }
    return selectedTweaksArray[0] || null;
  }, [activeTweakId, selectedTweaks, selectedTweaksArray]);

  return {
    selectedTweaks,
    selectedTweaksArray,
    selectedTweaksSet,
    activeTweakId,
    setActiveTweakId,
    infoTweak,
    handleTweakToggle,
    handleClearAll,
    handleSelectAllTweaks,
  };
}


