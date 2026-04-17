"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useUser } from "@/shared/hooks/use-user";
import { filterAndSortTweaks, type SortOption } from "@/features/tweaks/utils/filter-tweaks";
import { VisualTreeSortMenu } from "@/features/tweaks/components/visual-tree-sort-menu";
import { ReportsExplorer } from "@/features/tweaks/components/reports-explorer";

import type { TweakCategory, Tweak, TweakHistoryEntry } from "@/features/tweaks/types/tweak.types";
import type { TweakReport } from "@/features/tweaks/types/tweak-report.types";

// Hooks
import { useTreeExpansion } from "@/features/tweaks/components/visual-tree/hooks/use-tree-expansion";
import { useGroupSelections } from "@/features/tweaks/components/visual-tree/hooks/use-group-selections";

// Trees
import { LibraryTree } from "@/features/tweaks/components/visual-tree/library-tree";
import { GroupTree } from "@/features/tweaks/components/visual-tree/group-tree";
import { PopularTree } from "@/features/tweaks/components/visual-tree/popular-tree";
import { FlatTree } from "@/features/tweaks/components/visual-tree/flat-tree";

interface VisualTreeProps {
  categories: TweakCategory[];
  selectedTweaks: Set<string>;
  onTweakToggle: (tweak: Tweak) => void;
  historyTweakIds?: Set<string>;
  favoriteTweakIds?: Set<string>;
  reportedTweakIds?: Set<string>;
  userReports?: TweakReport[];
  allReports?: TweakReport[];
  userReportDescriptions?: Map<string, string>;
  allReportDescriptions?: Map<string, string>;
  userFavoriteSelections?: TweakHistoryEntry[];
  userHistorySelections?: TweakHistoryEntry[];
  onSelectAll: () => void;
  onClearSelection: () => void;
  isLoading?: boolean;
  onRenameSelection?: (id: string, currentName: string) => void;
  onEditSelection?: (id: string, tweaks: Tweak[]) => void;
  onDeleteSelection?: (id: string) => void;
  onSaveAsFavorite?: (tweaks: Tweak[], defaultName: string) => void;
  onRefresh?: () => void;
  onCreateTweak?: () => void;
  onEditCategory?: (category: TweakCategory) => void;
  searchQuery?: string;
  activeTab?: string;
}

export default function VisualTree({
  categories,
  selectedTweaks,
  onTweakToggle,
  historyTweakIds,
  favoriteTweakIds,
  reportedTweakIds,
  userReports = [],
  allReports = [],
  userFavoriteSelections,
  userHistorySelections,
  onSelectAll,
  isLoading = false,
  onRenameSelection,
  onEditSelection,
  onDeleteSelection,
  onSaveAsFavorite,
  onRefresh,
  onEditCategory,
  searchQuery = "",
  activeTab = "library",
}: VisualTreeProps) {
  const { user } = useUser();
  const isAdmin = user?.user_metadata?.role === "admin";
  const { expandedCategories, toggleCategory } = useTreeExpansion();
  const [sortOption, setSortOption] = useState<SortOption>("alphabetical");

  // View States
  const [favoritesScope] = useState<"user" | "global">("user");
  const [favoritesView] = useState<"list" | "tree">("list");
  const [reportedScope, setReportedScope] = useState<"user" | "global">("global");
  const [historyView] = useState<"list" | "tree">("tree");
  const [historyShowCategory] = useState(true);
  const [popularView] = useState<"list" | "tree">("list");
  const [popularShowCategory] = useState(true);

  const [displayLimit, setDisplayLimit] = useState(20);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const allTweaksMap = useMemo(() => {
    const map = new Map<string, Tweak>();
    categories.forEach((cat) => {
      cat.tweaks?.forEach((t) => map.set(t.id, { ...t, category_id: cat.id }));
    });
    return map;
  }, [categories]);

  const handleSelectGroup = (tweaksToSelect: Tweak[], e: React.MouseEvent) => {
    e.stopPropagation();
    const selectableTweaks = isAdmin ? tweaksToSelect : tweaksToSelect.filter((t) => t.is_visible);
    if (selectableTweaks.length === 0) return;

    const allSelected = selectableTweaks.every((t) => selectedTweaks.has(t.id));

    selectableTweaks.forEach((tweak) => {
      if (allSelected) {
        if (selectedTweaks.has(tweak.id)) onTweakToggle(tweak);
      } else {
        if (!selectedTweaks.has(tweak.id)) onTweakToggle(tweak);
      }
    });
  };

  // Filter Logic
  const { filteredCategories, flatTweaks } = useMemo(() => {
    let currentSort = sortOption;
    let historyOnly = false;
    const reportedOnly = false;
    let favoritesOnly = false;
    let userFavoritesOnly = false;
    const userReportedOnly = false;
    let minDownloads = 0;

    if (activeTab === "popular") {
      minDownloads = 1;
      if (currentSort === "alphabetical") currentSort = "downloads-desc";
    } else if (activeTab === "history") {
      historyOnly = true;
    } else if (activeTab === "reported") {
      return { filteredCategories: [], flatTweaks: [] };
    } else if (activeTab === "favorites") {
      if (favoritesScope === "user") {
        userFavoritesOnly = true;
      } else {
        favoritesOnly = true;
      }
      if (currentSort === "alphabetical") currentSort = "favorites-desc";
    }

    return filterAndSortTweaks(categories, {
      searchQuery,
      selectedOnly: false,
      historyOnly,
      reportedOnly,
      favoritesOnly,
      userFavoritesOnly,
      userReportedOnly,
      minDownloads,
      historyTweakIds,
      favoriteTweakIds,
      reportedTweakIds,
      sort: activeTab === "library" ? undefined : currentSort,
    });
  }, [
    categories,
    activeTab,
    searchQuery,
    historyTweakIds,
    favoriteTweakIds,
    reportedTweakIds,
    sortOption,
    favoritesScope,
  ]);

  const isLibraryTree = activeTab === "library" && !searchQuery;
  const isFavoritesTree = activeTab === "favorites" && favoritesScope === "user" && favoritesView === "tree";
  const isHistoryTree = activeTab === "history" && historyView === "tree";
  const isPopularTree = activeTab === "popular" && popularView === "tree";

  const groupSelections = useGroupSelections(
    isFavoritesTree,
    isHistoryTree,
    userFavoriteSelections,
    userHistorySelections,
    allTweaksMap,
    searchQuery
  );

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 200) {
      setDisplayLimit((prev) => Math.min(prev + 20, flatTweaks.length));
    }
  };

  useEffect(() => {
    setDisplayLimit(20);
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = 0;
    }
  }, [activeTab, searchQuery, favoritesView, historyView, popularView, favoritesScope, reportedScope]);

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-transparent">
      <div className="flex-none p-2 border-b border-border/10 sticky top-0 z-10 bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {activeTab === "library" ? "System Library" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </span>

          <div className="flex items-center gap-1">
            {activeTab !== "library" && activeTab !== "reported" && (
              <VisualTreeSortMenu
                sortOption={sortOption}
                onSortChange={(v) => setSortOption(v)}
                onSelectAllVisible={onSelectAll}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <ScrollArea className="absolute inset-0" onScrollCapture={handleScroll} ref={scrollViewportRef}>
          <div className="p-3 space-y-1 pb-10">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activeTab === "reported" ? (
              <ReportsExplorer
                allReports={allReports}
                userReports={userReports}
                scope={reportedScope as "user" | "global"}
                onScopeChange={(s) => setReportedScope(s)}
                allTweaksMap={allTweaksMap}
                onTweakToggle={onTweakToggle}
                onRefresh={onRefresh}
              />
            ) : (
              <>
                {isLibraryTree && (
                  <LibraryTree
                    categories={filteredCategories}
                    expandedCategories={expandedCategories}
                    toggleCategory={toggleCategory}
                    isAdmin={isAdmin}
                    selectedTweaks={selectedTweaks}
                    onTweakToggle={onTweakToggle}
                    onEditCategory={onEditCategory}
                    handleSelectGroup={handleSelectGroup}
                  />
                )}

                {(isFavoritesTree || isHistoryTree) && (
                  <GroupTree
                    groups={groupSelections}
                    expandedCategories={expandedCategories}
                    toggleCategory={toggleCategory}
                    isAdmin={isAdmin}
                    selectedTweaks={selectedTweaks}
                    onTweakToggle={onTweakToggle}
                    handleSelectGroup={handleSelectGroup}
                    onRenameSelection={onRenameSelection}
                    onEditSelection={onEditSelection}
                    onSaveAsFavorite={onSaveAsFavorite}
                    onDeleteSelection={onDeleteSelection}
                  />
                )}

                {isPopularTree && (
                  <PopularTree
                    categories={filteredCategories}
                    expandedCategories={expandedCategories}
                    toggleCategory={toggleCategory}
                    isAdmin={isAdmin}
                    selectedTweaks={selectedTweaks}
                    onTweakToggle={onTweakToggle}
                    onEditCategory={onEditCategory}
                    handleSelectGroup={handleSelectGroup}
                  />
                )}

                {!isLibraryTree && !isFavoritesTree && !isHistoryTree && !isPopularTree && (
                  <FlatTree
                    tweaks={flatTweaks}
                    categories={categories}
                    isAdmin={isAdmin}
                    selectedTweaks={selectedTweaks}
                    onTweakToggle={onTweakToggle}
                    displayLimit={displayLimit}
                    activeTab={activeTab}
                    historyShowCategory={historyShowCategory}
                    popularShowCategory={popularShowCategory}
                  />
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
