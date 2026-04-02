"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { Tweak, TweakCategory } from "@/features/tweaks/types/tweak.types";

interface SelectionContextType {
  selectedTweaks: Map<string, Tweak>;
  selectedTweaksArray: Tweak[];
  selectedTweaksSet: Set<string>;
  activeTweakId: string | null;
  setActiveTweakId: (id: string | null) => void;
  toggleTweak: (tweak: Tweak) => void;
  clearSelection: () => void;
  selectAll: (categories: TweakCategory[], isAdmin?: boolean) => void;
  updateTweakCounters: (tweakIds: string[], type: "download" | "favorite") => void;
  isInitialized: boolean;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedTweaks, setSelectedTweaks] = useState<Map<string, Tweak>>(new Map());
  const [activeTweakId, setActiveTweakId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("bp:selected_tweaks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Tweak[];
        const map = new Map<string, Tweak>(parsed.map(t => [t.id, t]));
        setSelectedTweaks(map);
        if (parsed.length > 0) setActiveTweakId(parsed[0].id);
      } catch (e) {
        console.error("Failed to load selection from localStorage", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Sync with LocalStorage
  useEffect(() => {
    if (!isInitialized) return;
    
    const timeoutId = setTimeout(() => {
      const array = Array.from(selectedTweaks.values());
      localStorage.setItem("bp:selected_tweaks", JSON.stringify(array));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [selectedTweaks, isInitialized]);

  const toggleTweak = useCallback((tweak: Tweak) => {
    setSelectedTweaks((prev: Map<string, Tweak>) => {
      const next = new Map(prev);
      if (next.has(tweak.id)) {
        next.delete(tweak.id);
      } else {
        next.set(tweak.id, tweak);
      }
      return next;
    });
  }, []);

  // Derive activeTweakId reactively whenever selectedTweaks changes.
  // Runs after the state update is committed, so it always reads fresh values.
  useEffect(() => {
    if (activeTweakId !== null && !selectedTweaks.has(activeTweakId)) {
      setActiveTweakId(selectedTweaks.size > 0 ? (Array.from(selectedTweaks.keys())[0] ?? null) : null);
    } else if (activeTweakId === null && selectedTweaks.size > 0) {
      setActiveTweakId(Array.from(selectedTweaks.keys())[0] ?? null);
    }
  }, [selectedTweaks, activeTweakId]);

  const clearSelection = useCallback(() => {
    setSelectedTweaks(new Map());
    setActiveTweakId(null);
  }, []);

  const selectAll = useCallback((categories: TweakCategory[], isAdmin: boolean = false) => {
    const next = new Map<string, Tweak>();
    categories.forEach(cat => {
      cat.tweaks?.forEach(t => {
        if (isAdmin || t.is_visible) {
          next.set(t.id, t);
        }
      });
    });
    setSelectedTweaks(next);
    if (next.size > 0) {
        setActiveTweakId(Array.from(next.keys())[0]);
    }
  }, []);

  const updateTweakCounters = useCallback((tweakIds: string[], type: "download" | "favorite") => {
    setSelectedTweaks((prev: Map<string, Tweak>) => {
      const newMap = new Map(prev);
      tweakIds.forEach((id) => {
        const tweak = newMap.get(id);
        if (tweak) {
          newMap.set(id, {
            ...tweak,
            download_count: type === "download" ? (tweak.download_count ?? 0) + 1 : tweak.download_count,
            favorite_count: type === "favorite" ? (tweak.favorite_count ?? 0) + 1 : tweak.favorite_count,
          });
        }
      });
      return newMap;
    });
  }, []);

  const selectedTweaksArray = useMemo(() => Array.from(selectedTweaks.values()), [selectedTweaks]);
  const selectedTweaksSet = useMemo(() => new Set(selectedTweaks.keys()), [selectedTweaks]);

  const value = useMemo(() => ({
    selectedTweaks,
    selectedTweaksArray,
    selectedTweaksSet,
    activeTweakId,
    setActiveTweakId,
    toggleTweak,
    clearSelection,
    selectAll,
    updateTweakCounters,
    isInitialized
  }), [selectedTweaks, selectedTweaksArray, selectedTweaksSet, activeTweakId, toggleTweak, clearSelection, selectAll, updateTweakCounters, isInitialized]);

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error("useSelection must be used within a SelectionProvider");
  }
  return context;
}
