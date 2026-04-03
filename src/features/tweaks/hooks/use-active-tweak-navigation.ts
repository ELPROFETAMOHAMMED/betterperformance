"use client";

import { useMemo } from "react";

import type { Tweak, TweakCategory } from "@/features/tweaks/types/tweak.types";

type UseActiveTweakNavigationParams = {
  activeTweakId: string | null;
  categories: TweakCategory[];
  selectedTweaks: Tweak[];
  setActiveTweakId: (value: string | null) => void;
};

export function useActiveTweakNavigation({
  activeTweakId,
  categories,
  selectedTweaks,
  setActiveTweakId,
}: UseActiveTweakNavigationParams) {
  const activeIndex = useMemo(() => {
    if (!activeTweakId) {
      return 0;
    }

    return selectedTweaks.findIndex((tweak) => tweak.id === activeTweakId);
  }, [activeTweakId, selectedTweaks]);

  const activeTweak = selectedTweaks[activeIndex] || selectedTweaks[0] || null;
  const activeCategory = activeTweak
    ? categories.find((category) => category.id === activeTweak.category_id) || null
    : null;

  const handleNextTweak = () => {
    if (activeIndex >= selectedTweaks.length - 1) {
      return;
    }

    setActiveTweakId(selectedTweaks[activeIndex + 1].id);
  };

  const handlePrevTweak = () => {
    if (activeIndex <= 0) {
      return;
    }

    setActiveTweakId(selectedTweaks[activeIndex - 1].id);
  };

  return {
    activeIndex,
    activeTweak,
    activeCategory,
    handleNextTweak,
    handlePrevTweak,
  };
}
