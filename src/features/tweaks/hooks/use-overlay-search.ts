"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useSearchPackages } from "@/features/app-installer/search-packages/use-search-packages";
import type { WingetPackage } from "@/features/app-installer/types/winget-package";
import { mapPkgToTweak } from "@/features/app-installer/utils/map-pkg-to-tweak";
import { getSearchSuggestions } from "@/features/tweaks/actions/get-search-tweaks";
import { useSelection } from "@/features/tweaks/context/selection-context";
import type { Tweak, TweakCategory } from "@/features/tweaks/types/tweak.types";

type SearchableTweak = Tweak & { categoryName: string };

export function useOverlaySearch(
  open: boolean,
  onOpenChange: (open: boolean) => void
) {
  const router = useRouter();
  const { selectedTweaksSet, setActiveTweakId, toggleTweak } = useSelection();
  const [categories, setCategories] = useState<TweakCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  const isWingetSearch = search.toLowerCase().startsWith("@winget");
  const wingetQuery = isWingetSearch ? search.substring(7).trim() : "";
  const {
    packages: wingetPackages = [],
    isLoading: isWingetLoading,
  } = useSearchPackages(isWingetSearch ? wingetQuery : "");

  const allTweaks = useMemo<SearchableTweak[]>(() => {
    return categories.flatMap((category) =>
      (category.tweaks || []).map((tweak) => ({
        ...tweak,
        categoryName: category.name,
      }))
    );
  }, [categories]);

  const topMatches = useMemo(() => {
    if (!search.trim() || isWingetSearch) {
      return [];
    }

    const normalizedSearch = search.toLowerCase();

    return allTweaks
      .filter(
        (tweak) =>
          tweak.title.toLowerCase().includes(normalizedSearch) ||
          tweak.description?.toLowerCase().includes(normalizedSearch)
      )
      .slice(0, 5);
  }, [allTweaks, isWingetSearch, search]);

  useEffect(() => {
    if (!open || categories.length > 0) {
      return;
    }

    const loadSuggestions = async () => {
      setIsLoading(true);

      try {
        setCategories(await getSearchSuggestions());
      } catch (error) {
        console.error("Search fetch error", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSuggestions();
  }, [categories.length, open]);

  const handleSelectTweak = useCallback(
    (tweak: Tweak) => {
      onOpenChange(false);

      if (!selectedTweaksSet.has(tweak.id)) {
        toggleTweak(tweak);
      }

      setActiveTweakId(tweak.id);
      router.push("/tweaks/library");
    },
    [onOpenChange, router, selectedTweaksSet, setActiveTweakId, toggleTweak]
  );

  const handleSelectWingetPackage = useCallback(
    (pkg: WingetPackage) => {
      const tweak = mapPkgToTweak(pkg);

      if (!selectedTweaksSet.has(tweak.id)) {
        toggleTweak(tweak);
        toast.success(`Added ${tweak.title} to selection`, {
          description: "You can find it in your Tweak Cart.",
        });
      } else {
        toast.info(`${tweak.title} is already selected`);
      }

      onOpenChange(false);
      router.push("/tweaks/library");
    },
    [onOpenChange, router, selectedTweaksSet, toggleTweak]
  );

  return {
    categories,
    isLoading,
    isWingetLoading,
    isWingetSearch,
    search,
    setSearch,
    topMatches,
    wingetPackages,
    wingetQuery,
    handleSelectTweak,
    handleSelectWingetPackage,
  };
}
