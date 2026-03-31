"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/shared/lib/utils";
import type { TweakCategory, Tweak, TweakHistoryEntry } from "@/features/tweaks/types/tweak.types";
import {
  filterAndSortTweaks,
  type SortOption,
} from "@/features/tweaks/utils/filter-tweaks";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { 
  FolderIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  StarIcon,
  UsersIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FolderOpenIcon,
  CheckCircleIcon,
  PencilIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationCircleIcon as ExclamationCircleIconSolid,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { TweakItem } from "./tweak-item";
import { VisualTreeSortMenu } from "./visual-tree-sort-menu";
import { TweaksEmptyState } from "./tweaks-empty-state";
import { useUser } from "@/shared/hooks/use-user";
import DynamicIcon from "@/shared/components/common/dynamic-icon";
import type { TweakReport } from "@/features/tweaks/hooks/use-tweak-reports-filters";
import { formatDistanceToNow } from "date-fns";
import { deleteTweakReport } from "../actions/delete-report";
import { useQueryClient } from "@tanstack/react-query";
import { TweakReportDeleteDialog } from "./tweak-report-delete-dialog";

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
  onDeleteSelection?: (id: string) => void;
  onSaveAsFavorite?: (tweaks: Tweak[], defaultName: string) => void;
  onRefresh?: () => void;
  onCreateTweak?: () => void;
  onEditCategory?: (category: TweakCategory) => void;
  searchQuery?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
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
  userReportDescriptions,
  allReportDescriptions,
  userFavoriteSelections,
  userHistorySelections,
  onSelectAll,
  onClearSelection,
  isLoading = false,
  onRenameSelection,
  onDeleteSelection,
  onSaveAsFavorite,
  onRefresh,
  onCreateTweak,
  onEditCategory,
  searchQuery = "",
  activeTab = "library",
  onTabChange,
}: VisualTreeProps) {
  const { user } = useUser();
  const isAdmin = user?.user_metadata?.role === "admin";
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [sortOption, setSortOption] = useState<SortOption>("alphabetical");
  
  // View States
  const [favoritesScope, setFavoritesScope] = useState<"user" | "global">("user");
  const [favoritesView, setFavoritesView] = useState<"list" | "tree">("tree"); 
  const [reportedScope, setReportedScope] = useState<"user" | "global">("global");
  const [historyView, setHistoryView] = useState<"list" | "tree">("tree");
  const [historyShowCategory, setHistoryShowCategory] = useState(true);
  const [popularView, setPopularView] = useState<"list" | "tree">("list");
  const [popularShowCategory, setPopularShowCategory] = useState(true);

  const [displayLimit, setDisplayLimit] = useState(20);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const allTweaksMap = useMemo(() => {
    const map = new Map<string, Tweak>();
    categories.forEach(cat => {
      cat.tweaks?.forEach(t => map.set(t.id, { ...t, category_id: cat.id }));
    });
    return map;
  }, [categories]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleSelectGroup = (tweaksToSelect: Tweak[], e: React.MouseEvent) => {
    e.stopPropagation();
    const selectableTweaks = isAdmin ? tweaksToSelect : tweaksToSelect.filter(t => t.is_visible);
    if (selectableTweaks.length === 0) return;
    
    const allSelected = selectableTweaks.every(t => selectedTweaks.has(t.id));
    
    selectableTweaks.forEach(tweak => {
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
        // Special case for reported handled separately if activeTab === "reported"
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
  }, [categories, activeTab, searchQuery, historyTweakIds, favoriteTweakIds, reportedTweakIds, sortOption, favoritesScope]);

  const isLibraryTree = activeTab === "library" && !searchQuery;
  const isFavoritesTree = activeTab === "favorites" && favoritesScope === "user" && favoritesView === "tree";
  const isHistoryTree = activeTab === "history" && historyView === "tree";
  const isPopularTree = activeTab === "popular" && popularView === "tree";

  const groupSelections = useMemo(() => {
    if (isFavoritesTree && userFavoriteSelections) {
      return userFavoriteSelections.map(entry => {
        const tweaks = (Array.isArray(entry.tweaks) ? (entry.tweaks as { id: string }[]) : [])
          .map((t) => allTweaksMap.get(t.id))
          .filter((t): t is Tweak => !!t);
        
        const matchedTweaks = searchQuery 
          ? tweaks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
          : tweaks;

        return {
          id: entry.id,
          title: entry.name || `Selection ${new Date(entry.createdAt).toLocaleDateString()}`,
          tweaks: matchedTweaks,
          icon: <StarIcon className="h-4 w-4 text-primary/70" />,
          isUserSelection: true,
          isHistoryItem: false,
        };
      }).filter(g => g.tweaks.length > 0);
    }
    
    if (isHistoryTree && userHistorySelections) {
      return userHistorySelections.map(entry => {
        const tweaks = (Array.isArray(entry.tweaks) ? (entry.tweaks as { id: string }[]) : [])
          .map((t) => allTweaksMap.get(t.id))
          .filter((t): t is Tweak => !!t);

        const matchedTweaks = searchQuery 
          ? tweaks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
          : tweaks;

        return {
          id: entry.id,
          title: entry.name || `History - ${new Date(entry.createdAt).toLocaleString()}`,
          tweaks: matchedTweaks,
          icon: <ClockIcon className="h-4 w-4 text-muted-foreground" />,
          isUserSelection: true,
          isHistoryItem: true,
        };
      }).filter(g => g.tweaks.length > 0);
    }

    return [];
  }, [isFavoritesTree, isHistoryTree, userFavoriteSelections, userHistorySelections, allTweaksMap, searchQuery]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 200) {
      setDisplayLimit(prev => Math.min(prev + 20, flatTweaks.length));
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
        <ScrollArea 
          className="absolute inset-0" 
          onScrollCapture={handleScroll}
          ref={scrollViewportRef}
        >
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
                filteredCategories.map((category) => {
                  const isExpanded = expandedCategories.has(category.id);
                  const tweaks = category.tweaks || [];
                  const selectableTweaks = isAdmin ? tweaks : tweaks.filter(t => t.is_visible);
                  const selectedCount = selectableTweaks.filter(t => selectedTweaks.has(t.id)).length;
                  const allSelected = selectableTweaks.length > 0 && selectedCount === selectableTweaks.length;
                  const someSelected = selectedCount > 0 && !allSelected;

                  return (
                    <div key={category.id} className="mb-2 last:mb-0">
                      <div 
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 mx-2 rounded-md cursor-pointer transition-colors",
                          isExpanded ? "bg-secondary/20 text-foreground font-medium" : "hover:bg-secondary/40 text-muted-foreground"
                        )}
                        onClick={() => toggleCategory(category.id)}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground"
                        >
                          {isExpanded ? (
                            <ChevronDownIcon className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRightIcon className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {category.icon ? (
                            <DynamicIcon
                              name={category.icon}
                              className={isExpanded ? "text-primary/70" : "text-muted-foreground"}
                            />
                          ) : isExpanded ? (
                            <FolderOpenIcon className="h-4 w-4 text-primary/70" />
                          ) : (
                            <FolderIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium truncate select-none block">
                              {category.name}
                            </span>
                            {category.description && (
                              <p className="text-[11px] text-muted-foreground line-clamp-1 leading-relaxed mt-0.5">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {selectedCount}/{selectableTweaks.length}
                          </span>
                          {isAdmin && onEditCategory && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditCategory(category);
                              }}
                              title="Edit category"
                            >
                              <PencilIcon className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-6 w-6 rounded-full",
                              allSelected ? "text-primary hover:text-primary/80" : 
                              someSelected ? "text-primary/70 hover:text-primary" : 
                              "text-muted-foreground hover:text-foreground"
                            )}
                            onClick={(e) => handleSelectGroup(tweaks, e)}
                          >
                            {allSelected ? (
                              <CheckCircleIconSolid className="h-4 w-4" />
                            ) : (
                              <CheckCircleIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="flex flex-col mt-1">
                              {tweaks.map((tweak) => (
                                <TweakItem 
                                  key={tweak.id} 
                                  tweak={tweak} 
                                  selected={selectedTweaks.has(tweak.id)} 
                                  onToggle={() => onTweakToggle(tweak)}
                                  isAdmin={isAdmin}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}

              {(isFavoritesTree || isHistoryTree) && (
                groupSelections.length > 0 ? (
                  groupSelections.map((group) => {
                    const isExpanded = expandedCategories.has(group.id);
                    const tweaks = group.tweaks;
                    const selectableTweaks = isAdmin ? tweaks : tweaks.filter(t => t.is_visible);
                    const selectedCount = selectableTweaks.filter(t => selectedTweaks.has(t.id)).length;
                    const allSelected = selectableTweaks.length > 0 && selectedCount === selectableTweaks.length;
                    const someSelected = selectedCount > 0 && !allSelected;

                    return (
                      <div key={group.id} className="mb-2 last:mb-0">
                         <div 
                           className={cn(
                             "flex items-center gap-2 px-3 py-2 mx-2 rounded-md cursor-pointer transition-colors",
                             isExpanded ? "bg-secondary/20 text-foreground font-medium" : "hover:bg-secondary/40 text-muted-foreground"
                           )}
                           onClick={() => toggleCategory(group.id)}
                         >
                           <Button
                             variant="ghost"
                             size="icon"
                             className="h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground"
                           >
                             {isExpanded ? (
                               <ChevronDownIcon className="h-3.5 w-3.5" />
                             ) : (
                               <ChevronRightIcon className="h-3.5 w-3.5" />
                             )}
                           </Button>
                           
                           <div className="flex items-center gap-2 flex-1 min-w-0">
                             {group.icon}
                             <span className="text-sm font-medium truncate select-none">
                               {group.title}
                             </span>
                           </div>

                           <div className="flex items-center gap-2">
                             <span className="text-[10px] text-muted-foreground font-mono">
                               {selectedCount}/{selectableTweaks.length}
                             </span>
                             <Button
                               variant="ghost"
                               size="icon"
                               className={cn(
                                 "h-6 w-6 rounded-full",
                                 allSelected ? "text-primary hover:text-primary/80" : 
                                 someSelected ? "text-primary/70 hover:text-primary" : 
                                 "text-muted-foreground hover:text-foreground"
                               )}
                               onClick={(e) => handleSelectGroup(tweaks, e)}
                             >
                               {allSelected ? (
                                 <CheckCircleIconSolid className="h-4 w-4" />
                               ) : (
                                 <CheckCircleIcon className="h-4 w-4" />
                               )}
                             </Button>

                             {group.isUserSelection && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <EllipsisHorizontalIcon className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    onRenameSelection?.(group.id, group.title);
                                  }}
                                >
                                  <PencilIcon className="h-4 w-4 mr-2" />
                                  Rename
                                </DropdownMenuItem>
                                {group.isHistoryItem && (
                                  <DropdownMenuItem
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      onSaveAsFavorite?.(group.tweaks, group.title);
                                    }}
                                  >
                                    <StarIcon className="h-4 w-4 mr-2" />
                                    Save to Favorites
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    onDeleteSelection?.(group.id);
                                  }}
                                >
                                  <TrashIcon className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                             )}
                           </div>
                         </div>

                         <AnimatePresence initial={false}>
                           {isExpanded && (
                             <motion.div
                               initial={{ height: 0, opacity: 0 }}
                               animate={{ height: "auto", opacity: 1 }}
                               exit={{ height: 0, opacity: 0 }}
                               transition={{ duration: 0.2 }}
                             >
                               <div className="pl-9 pr-2 py-1 space-y-0.5 border-t border-border/20 bg-muted/10">
                                 {tweaks.map((tweak) => (
                                   <TweakItem 
                                     key={tweak.id} 
                                     tweak={tweak} 
                                     selected={selectedTweaks.has(tweak.id)} 
                                     onToggle={() => onTweakToggle(tweak)}
                                     isAdmin={isAdmin}
                                   />
                                 ))}
                               </div>
                             </motion.div>
                           )}
                         </AnimatePresence>
                      </div>
                    )
                  })
                ) : (
                  <TweaksEmptyState title="No items found" />
                )
              )}

              {isPopularTree && (
                filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => {
                    const isExpanded = expandedCategories.has(category.id);
                    const tweaks = category.tweaks || [];
                    const selectableTweaks = isAdmin ? tweaks : tweaks.filter(t => t.is_visible);
                    const selectedCount = selectableTweaks.filter(t => selectedTweaks.has(t.id)).length;
                    const allSelected = selectableTweaks.length > 0 && selectedCount === selectableTweaks.length;
                    const someSelected = selectedCount > 0 && !allSelected;

                    return (
                      <div key={category.id} className="overflow-hidden border-b border-border/10 last:border-0 transition-colors">
                        <div 
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors",
                            isExpanded ? "bg-black/5 dark:bg-white/5" : "hover:bg-black/5 dark:hover:bg-white/5"
                          )}
                          onClick={() => toggleCategory(category.id)}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground"
                          >
                            {isExpanded ? (
                              <ChevronDownIcon className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronRightIcon className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {category.icon ? (
                              <DynamicIcon
                                name={category.icon}
                                className={isExpanded ? "text-primary/70" : "text-muted-foreground"}
                              />
                            ) : isExpanded ? (
                              <FolderOpenIcon className="h-4 w-4 text-primary/70" />
                            ) : (
                              <FolderIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium truncate select-none block">
                                {category.name}
                              </span>
                              {category.description && (
                                <p className="text-[11px] text-muted-foreground line-clamp-1 leading-relaxed mt-0.5">
                                  {category.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {selectedCount}/{selectableTweaks.length}
                            </span>
                            {isAdmin && onEditCategory && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditCategory(category);
                                }}
                                title="Edit category"
                              >
                                <PencilIcon className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "h-6 w-6 rounded-full",
                                allSelected ? "text-primary hover:text-primary/80" : 
                                someSelected ? "text-primary/70 hover:text-primary" : 
                                "text-muted-foreground hover:text-foreground"
                              )}
                              onClick={(e) => handleSelectGroup(tweaks, e)}
                            >
                              {allSelected ? (
                                <CheckCircleIconSolid className="h-4 w-4" />
                              ) : (
                                <CheckCircleIcon className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="flex flex-col border-t border-border/10">
                                {tweaks.map((tweak) => (
                                  <TweakItem 
                                    key={tweak.id} 
                                    tweak={tweak} 
                                    selected={selectedTweaks.has(tweak.id)} 
                                    onToggle={() => onTweakToggle(tweak)}
                                    isAdmin={isAdmin}
                                  />
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                ) : (
                  <TweaksEmptyState
                    title="No popular tweaks found"
                    description="No tweaks with downloads found"
                  />
                )
              )}

              {(!isLibraryTree && !isFavoritesTree && !isHistoryTree && !isPopularTree) && (
                flatTweaks.length > 0 ? (
                  <>
                    {flatTweaks.slice(0, displayLimit).map((tweak) => (
                      <TweakItem 
                        key={tweak.id} 
                        tweak={tweak} 
                        selected={selectedTweaks.has(tweak.id)} 
                        onToggle={() => onTweakToggle(tweak)}
                        isAdmin={isAdmin}
                        showCategory
                        categoryName={categories.find(c => c.id === tweak.category_id)?.name}
                        showCategoryAsDescription={(activeTab === "history" && historyShowCategory) || (activeTab === "popular" && popularShowCategory)}
                        showReportDescription={activeTab === "reported"}
                      />
                    ))}
                    {flatTweaks.length > displayLimit && (
                      <div className="py-4 text-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
                      </div>
                    )}
                  </>
                ) : (
                  <TweaksEmptyState
                    title="No tweaks found"
                    description="Try adjusting your filters"
                  />
                )
              )}
            </>
          )}
        </div>
      </ScrollArea>
      </div>
    </div>
  );
}

function ReportsExplorer({ 
    allReports, 
    userReports, 
    scope, 
    onScopeChange, 
    allTweaksMap, 
    onTweakToggle,
    onRefresh 
}: { 
    allReports: TweakReport[]; 
    userReports: TweakReport[]; 
    scope: "user" | "global";
    onScopeChange: (scope: "user" | "global") => void;
    allTweaksMap: Map<string, Tweak>;
    onTweakToggle: (tweak: Tweak) => void;
    onRefresh?: () => void;
}) {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<TweakReport | null>(null);

    const reports = scope === "user" ? userReports : allReports;

    const handleDeleteClick = (report: TweakReport) => {
        setSelectedReport(report);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedReport) return;
        
        setIsDeleting(selectedReport.id);
        try {
          const result = await deleteTweakReport(selectedReport.id);
          if (result.success) {
            queryClient.invalidateQueries({ queryKey: ["all-reports-with-descriptions"] });
            queryClient.invalidateQueries({ queryKey: ["user-reports"] });
            if (onRefresh) onRefresh();
            setDeleteDialogOpen(false);
          } else {
            alert(result.error || "Failed to delete report");
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsDeleting(null);
          setSelectedReport(null);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 p-1">
                <Button
                    variant={scope === "global" ? "secondary" : "ghost"}
                    size="sm"
                    className="justify-start gap-2 h-9 px-3 rounded-lg"
                    onClick={() => onScopeChange("global")}
                >
                    <UsersIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">Global Reports</span>
                    <Badge variant="outline" className="ml-auto text-[10px] h-4 px-1">{allReports.length}</Badge>
                </Button>
                <Button
                    variant={scope === "user" ? "secondary" : "ghost"}
                    size="sm"
                    className="justify-start gap-2 h-9 px-3 rounded-lg"
                    onClick={() => onScopeChange("user")}
                    disabled={!user}
                >
                    <UserIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">My Reports</span>
                    <Badge variant="outline" className="ml-auto text-[10px] h-4 px-1">{userReports.length}</Badge>
                </Button>
            </div>

            <div className="space-y-3 mt-2">
                {reports.length === 0 ? (
                    <div className="py-10 text-center opacity-40 mix-blend-luminosity">
                        <ExclamationTriangleIcon className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-xs font-medium">No reports found</p>
                    </div>
                ) : (
                    reports.map((report) => {
                        const tweak = allTweaksMap.get(report.tweak_id);
                        if (!tweak) return null;
                        
                        return (
                            <motion.div
                                key={report.id}
                                className="group relative flex flex-col gap-2 p-3 rounded-xl bg-card border border-border/40 hover:border-primary/30 transition-all cursor-pointer shadow-sm hover:shadow-md"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => onTweakToggle(tweak)}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <div className={cn(
                                                "h-2 w-2 rounded-full",
                                                report.status === "resolved" ? "bg-emerald-500" :
                                                report.risk_level === "high" ? "bg-red-500" :
                                                report.risk_level === "medium" ? "bg-amber-500" :
                                                "bg-blue-500"
                                            )} />
                                            <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground truncate">
                                                {tweak.title}
                                            </span>
                                        </div>
                                        <h5 className="text-xs font-semibold text-foreground line-clamp-1 leading-tight mb-0.5">
                                            {report.title}
                                        </h5>
                                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed italic">
                                            &quot;{report.description}&quot;
                                        </p>
                                    </div>
                                    
                                    {user?.id === report.user_id && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteClick(report);
                                            }}
                                            disabled={isDeleting === report.id}
                                        >
                                            {isDeleting === report.id ? (
                                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            ) : (
                                                <TrashIcon className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/10">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={cn(
                                            "text-[9px] h-3.5 px-1 font-normal lowercase",
                                            report.status === "resolved" ? "text-emerald-500 border-emerald-500/20" : "text-amber-500 border-amber-500/20"
                                        )}>
                                            {report.status}
                                        </Badge>
                                        <span className={cn(
                                            "text-[9px] font-medium",
                                            report.risk_level === "high" ? "text-red-500" :
                                            report.risk_level === "medium" ? "text-amber-500" : "text-emerald-500"
                                        )}>
                                            {report.risk_level} risk
                                        </span>
                                    </div>
                                    <span className="text-[9px] text-muted-foreground opacity-60">
                                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            <TweakReportDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                isDeleting={!!isDeleting}
                reportTitle={selectedReport?.title}
            />
        </div>
    );
}
