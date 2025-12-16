import type { Tweak, TweakCategory } from "@/features/tweaks/types/tweak.types";

export type SortOption = "alphabetical" | "downloads-desc" | "downloads-asc" | "favorites-desc" | "favorites-asc" | "reports-desc" | "reports-asc";

export interface FilterOptions {
  searchQuery: string;
  selectedOnly: boolean;
  historyOnly: boolean;
  reportedOnly: boolean; // Global reports > 0
  favoritesOnly: boolean; // Global favorites > 0
  
  // User specific filters
  userFavoritesOnly?: boolean;
  userReportedOnly?: boolean;
  
  minDownloads?: number;
  
  // ID Sets
  historyTweakIds?: Set<string>;
  favoriteTweakIds?: Set<string>;
  reportedTweakIds?: Set<string>;
  
  sort?: SortOption;
}

export function filterAndSortTweaks(
  categories: TweakCategory[],
  filters: FilterOptions
): { filteredCategories: TweakCategory[]; flatTweaks: Tweak[] } {
  const { 
    searchQuery, 
    // selectedOnly, // unused in loop logic currently, usually handled by caller or specific logic
    historyOnly, 
    reportedOnly, 
    favoritesOnly, 
    userFavoritesOnly,
    userReportedOnly,
    minDownloads, 
    historyTweakIds, 
    favoriteTweakIds,
    reportedTweakIds,
    sort 
  } = filters;
  
  const normalizedSearch = searchQuery.trim().toLowerCase();
  
  // First, extract all matching tweaks
  const allMatchingTweaks: Tweak[] = [];

  categories.forEach((category) => {
    const tweaks = category.tweaks || [];
    tweaks.forEach((tweak) => {
      // Search filter
      if (normalizedSearch) {
        const haystack = `${category.name} ${tweak.title} ${tweak.description ?? ""}`.toLowerCase();
        if (!haystack.includes(normalizedSearch)) return;
      }

      // History filter
      if (historyOnly && historyTweakIds && !historyTweakIds.has(tweak.id)) return;

      // Global Reported filter (show tweaks with any reports)
      if (reportedOnly && (tweak.report_count ?? 0) === 0) return;

      // Global Favorites filter (show tweaks with any favorites)
      if (favoritesOnly && (tweak.favorite_count ?? 0) === 0) return;

      // User Specific Favorites
      if (userFavoritesOnly && favoriteTweakIds && !favoriteTweakIds.has(tweak.id)) return;

      // User Specific Reports
      if (userReportedOnly && reportedTweakIds && !reportedTweakIds.has(tweak.id)) return;

      // Downloads filter
      if (minDownloads && (tweak.download_count ?? 0) < minDownloads) return;

      allMatchingTweaks.push({ ...tweak, category_id: category.id });
    });
  });

  // Sort flat list
  if (sort) {
    allMatchingTweaks.sort((a, b) => {
      switch (sort) {
        case "downloads-desc":
          return (b.download_count ?? 0) - (a.download_count ?? 0);
        case "downloads-asc":
          return (a.download_count ?? 0) - (b.download_count ?? 0);
        case "favorites-desc":
          return (b.favorite_count ?? 0) - (a.favorite_count ?? 0);
        case "favorites-asc":
          return (a.favorite_count ?? 0) - (b.favorite_count ?? 0);
        case "reports-desc":
          return (b.report_count ?? 0) - (a.report_count ?? 0);
        case "reports-asc":
          return (a.report_count ?? 0) - (b.report_count ?? 0);
        case "alphabetical":
        default:
          return a.title.localeCompare(b.title);
      }
    });
  }

  // Reconstruct categories for Tree View
  const filteredCategories = categories
    .map((cat) => {
      // Find tweaks that belong to this category AND are in our filtered list
      const catTweaks = allMatchingTweaks.filter((t) => t.category_id === cat.id);
      if (catTweaks.length === 0) return null;
      return { ...cat, tweaks: catTweaks };
    })
    .filter((c) => c !== null) as TweakCategory[];

  return { filteredCategories, flatTweaks: allMatchingTweaks };
}
