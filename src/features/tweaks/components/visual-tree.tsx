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
import { Input } from "@/shared/components/ui/input";
import { Tabs, TabsList } from "@/shared/components/ui/tabs";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { 
  Square2StackIcon,
  FolderIcon,
  FireIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  StarIcon,
  ListBulletIcon,
  QueueListIcon,
  UserIcon,
  GlobeAmericasIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FolderOpenIcon,
  CheckCircleIcon,
  PencilIcon,
  EllipsisHorizontalIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { TweakItem } from "./tweak-item";
import { VisualTreeTabTrigger } from "./visual-tree-tab-trigger";
import { VisualTreeSortMenu } from "./visual-tree-sort-menu";
import { TweaksEmptyState } from "./tweaks-empty-state";

interface VisualTreeProps {
  categories: TweakCategory[];
  selectedTweaks: Set<string>;
  onTweakToggle: (tweak: Tweak) => void;
  historyTweakIds?: Set<string>;
  favoriteTweakIds?: Set<string>;
  reportedTweakIds?: Set<string>;
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
}

export default function VisualTree({
  categories,
  selectedTweaks,
  onTweakToggle,
  historyTweakIds,
  favoriteTweakIds,
  reportedTweakIds,
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
}: VisualTreeProps) {
  const [activeTab, setActiveTab] = useState("library");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("alphabetical");
  
  // View States
  const [favoritesScope, setFavoritesScope] = useState<"user" | "global">("user");
  const [favoritesView, setFavoritesView] = useState<"list" | "tree">("tree"); // Default to tree for favorites (groups)
  
  const [reportedScope, setReportedScope] = useState<"user" | "global">("user");
  
  const [historyView, setHistoryView] = useState<"list" | "tree">("tree"); // Default to tree for history (groups)
  const [historyShowCategory, setHistoryShowCategory] = useState(true);
  
  const [popularView, setPopularView] = useState<"list" | "tree">("list"); // Default to list for popular
  const [popularShowCategory, setPopularShowCategory] = useState(true);

  // Infinite scroll state for flat lists
  const [displayLimit, setDisplayLimit] = useState(20);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  // Helper to get all tweaks map for quick lookup
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
    const allSelected = tweaksToSelect.every(t => selectedTweaks.has(t.id));
    
    tweaksToSelect.forEach(tweak => {
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
    let reportedOnly = false; // Global reported > 0
    let favoritesOnly = false; // Global favorites > 0
    let userFavoritesOnly = false;
    let userReportedOnly = false;
    let minDownloads = 0;

    if (activeTab === "popular") {
      minDownloads = 1;
      if (currentSort === "alphabetical") currentSort = "downloads-desc";
    } else if (activeTab === "history") {
      historyOnly = true;
    } else if (activeTab === "reported") {
      if (reportedScope === "user") {
        userReportedOnly = true;
      } else {
        reportedOnly = true;
      }
      if (currentSort === "alphabetical") currentSort = "reports-desc";
    } else if (activeTab === "favorites") {
      if (favoritesScope === "user") {
        userFavoritesOnly = true;
      } else {
        favoritesOnly = true;
      }
      if (currentSort === "alphabetical") currentSort = "favorites-desc";
    }

    // For "All Reports", we need to filter by tweaks that have reports in allReportDescriptions
    // instead of relying on report_count which may not be accurate
    let allReportedTweakIds: Set<string> | undefined;
    
    if (activeTab === "reported" && reportedScope === "global" && allReportDescriptions) {
      // Get all tweak IDs that have reports from the allReportDescriptions map
      allReportedTweakIds = new Set(allReportDescriptions.keys());
      // Override reportedOnly to false and use userReportedOnly with the Set of reported tweak IDs
      reportedOnly = false;
      userReportedOnly = true; // We'll use this with allReportedTweakIds
    }

    const result = filterAndSortTweaks(categories, {
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
      reportedTweakIds: activeTab === "reported" && reportedScope === "global" && allReportedTweakIds
        ? allReportedTweakIds 
        : reportedTweakIds,
      sort: activeTab === "library" ? undefined : currentSort, 
    });

    // Apply report descriptions to tweaks when in reported tab
    if (activeTab === "reported") {
      const reportDescriptions = reportedScope === "user" ? userReportDescriptions : allReportDescriptions;
      if (reportDescriptions) {
        result.flatTweaks = result.flatTweaks.map(tweak => ({
          ...tweak,
          report_description: reportDescriptions.get(tweak.id),
        }));
        result.filteredCategories = result.filteredCategories.map(cat => ({
          ...cat,
          tweaks: cat.tweaks?.map(tweak => ({
            ...tweak,
            report_description: reportDescriptions.get(tweak.id),
          })),
        }));
      }
    }

    return result;
  }, [categories, activeTab, searchQuery, historyTweakIds, favoriteTweakIds, reportedTweakIds, sortOption, favoritesScope, reportedScope, userReportDescriptions, allReportDescriptions]);

  // Determine current view mode
  const isLibraryTree = activeTab === "library" && !searchQuery;
  const isFavoritesTree = activeTab === "favorites" && favoritesScope === "user" && favoritesView === "tree";
  const isHistoryTree = activeTab === "history" && historyView === "tree";
  const isPopularTree = activeTab === "popular" && popularView === "tree";

  // Prepare Groups for Favorites/History Tree Views
  const groupSelections = useMemo(() => {
    if (isFavoritesTree && userFavoriteSelections) {
      return userFavoriteSelections.map(entry => {
        const tweaks = (Array.isArray(entry.tweaks) ? (entry.tweaks as { id: string }[]) : [])
          .map((t) => allTweaksMap.get(t.id))
          .filter((t): t is Tweak => !!t);
        
        // Filter tweaks by search query if exists
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

  // Handle infinite scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 200) {
      setDisplayLimit(prev => Math.min(prev + 20, flatTweaks.length));
    }
  };

  // Reset limit when tab changes
  useEffect(() => {
    setDisplayLimit(20);
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = 0;
    }
  }, [activeTab, searchQuery, favoritesView, historyView, popularView, favoritesScope, reportedScope]);

  return (
    <div className="flex h-full flex-col rounded-xl bg-card border border-border/40 shadow-sm overflow-hidden">
      {/* Header & Tabs */}
      <div className="flex flex-col border-b border-border/40 bg-muted/30">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/20">
          <div className="flex items-center gap-2">
            <Square2StackIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground uppercase tracking-wider">
              Explorer
            </span>
          </div>
          <div className="flex items-center gap-1">
             {onRefresh && (
               <Button 
                 variant="ghost" 
                 size="icon" 
                 className={cn("h-7 w-7", isLoading && "animate-spin")}
                 onClick={onRefresh}
                 title="Refresh"
                 disabled={isLoading}
               >
                 <ArrowPathIcon className="h-3.5 w-3.5" />
               </Button>
             )}
             {selectedTweaks.size > 0 && (
               <Button variant="outline" size="icon" className="h-7 w-7" onClick={onClearSelection} title="Clear selection">
                 <TrashIcon className="h-3.5 w-3.5" />
               </Button>
             )}
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start h-9 p-0 bg-transparent rounded-none px-4 gap-4 overflow-x-auto no-scrollbar">
            <VisualTreeTabTrigger value="library" icon={<FolderIcon className="h-3.5 w-3.5" />}>Library</VisualTreeTabTrigger>
            <VisualTreeTabTrigger value="popular" icon={<FireIcon className="h-3.5 w-3.5" />}>Popular</VisualTreeTabTrigger>
            <VisualTreeTabTrigger value="favorites" icon={<StarIcon className="h-3.5 w-3.5" />}>Favorites</VisualTreeTabTrigger>
            <VisualTreeTabTrigger value="history" icon={<ClockIcon className="h-3.5 w-3.5" />}>History</VisualTreeTabTrigger>
            <VisualTreeTabTrigger value="reported" icon={<ExclamationTriangleIcon className="h-3.5 w-3.5" />}>Reported</VisualTreeTabTrigger>
          </TabsList>
        </Tabs>

        {/* Search Bar */}
        <div className="px-3 py-2 space-y-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="Search tweaks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs bg-background/50 border-border/40"
            />
          </div>

          {/* Contextual Toolbar */}
          {activeTab === "favorites" && (
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-md">
                <Button 
                  variant={favoritesScope === "user" ? "secondary" : "ghost"} 
                  size="sm" 
                  className="h-6 text-[10px] px-2"
                  onClick={() => setFavoritesScope("user")}
                >
                  <UserIcon className="h-3 w-3 mr-1" /> My Favorites
                </Button>
                <Button 
                  variant={favoritesScope === "global" ? "secondary" : "ghost"} 
                  size="sm" 
                  className="h-6 text-[10px] px-2"
                  onClick={() => setFavoritesScope("global")}
                >
                  <GlobeAmericasIcon className="h-3 w-3 mr-1" /> Global
                </Button>
              </div>
              {favoritesScope === "user" && (
                <div className="flex items-center gap-1">
                   <Button
                     variant={favoritesView === "tree" ? "secondary" : "ghost"}
                     size="icon"
                     className="h-6 w-6"
                     onClick={() => setFavoritesView("tree")}
                     title="View as Groups"
                   >
                     <QueueListIcon className="h-3.5 w-3.5" />
                   </Button>
                   <Button
                     variant={favoritesView === "list" ? "secondary" : "ghost"}
                     size="icon"
                     className="h-6 w-6"
                     onClick={() => setFavoritesView("list")}
                     title="View as List"
                   >
                     <ListBulletIcon className="h-3.5 w-3.5" />
                   </Button>
                </div>
              )}
              {favoritesScope === "global" && (
                <VisualTreeSortMenu
                  sortOption={sortOption}
                  onSortChange={(v) => setSortOption(v)}
                  onSelectAllVisible={onSelectAll}
                />
              )}
            </div>
          )}

          {activeTab === "reported" && (
            <div className="flex items-center gap-2 px-1">
               <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-md">
                <Button 
                  variant={reportedScope === "user" ? "secondary" : "ghost"} 
                  size="sm" 
                  className="h-6 text-[10px] px-2"
                  onClick={() => setReportedScope("user")}
                >
                  <UserIcon className="h-3 w-3 mr-1" /> My Reports
                </Button>
                <Button 
                  variant={reportedScope === "global" ? "secondary" : "ghost"} 
                  size="sm" 
                  className="h-6 text-[10px] px-2"
                  onClick={() => setReportedScope("global")}
                >
                  <GlobeAmericasIcon className="h-3 w-3 mr-1" /> All Reports
                </Button>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-md">
                   <Button
                     variant={historyView === "tree" ? "secondary" : "ghost"}
                     size="icon"
                     className="h-6 w-6"
                     onClick={() => setHistoryView("tree")}
                     title="View as Groups"
                   >
                     <QueueListIcon className="h-3.5 w-3.5" />
                   </Button>
                   <Button
                     variant={historyView === "list" ? "secondary" : "ghost"}
                     size="icon"
                     className="h-6 w-6"
                     onClick={() => setHistoryView("list")}
                     title="View as List"
                   >
                     <ListBulletIcon className="h-3.5 w-3.5" />
                   </Button>
                 </div>
                 {historyView === "list" && (
                   <Button 
                     variant={historyShowCategory ? "secondary" : "outline"}
                     size="sm"
                     className="h-6 text-[10px] px-2"
                     onClick={() => setHistoryShowCategory(!historyShowCategory)}
                   >
                     {historyShowCategory ? "Show Desc." : "Show Category"}
                   </Button>
                 )}
              </div>
            </div>
          )}

          {activeTab === "popular" && (
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-md">
                   <Button
                     variant={popularView === "tree" ? "secondary" : "ghost"}
                     size="icon"
                     className="h-6 w-6"
                     onClick={() => setPopularView("tree")}
                     title="View with Categories"
                   >
                     <QueueListIcon className="h-3.5 w-3.5" />
                   </Button>
                   <Button
                     variant={popularView === "list" ? "secondary" : "ghost"}
                     size="icon"
                     className="h-6 w-6"
                     onClick={() => setPopularView("list")}
                     title="View as List"
                   >
                     <ListBulletIcon className="h-3.5 w-3.5" />
                   </Button>
                 </div>
                 {popularView === "list" && (
                   <Button 
                     variant={popularShowCategory ? "secondary" : "outline"}
                     size="sm"
                     className="h-6 text-[10px] px-2"
                     onClick={() => setPopularShowCategory(!popularShowCategory)}
                   >
                     {popularShowCategory ? "Show Desc." : "Show Category"}
                   </Button>
                 )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ScrollArea 
        className="flex-1" 
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
          ) : (
            <>
              {isLibraryTree && (
                filteredCategories.map((category) => {
                  const isExpanded = expandedCategories.has(category.id);
                  const tweaks = category.tweaks || [];
                  const selectedCount = tweaks.filter(t => selectedTweaks.has(t.id)).length;
                  const allSelected = tweaks.length > 0 && selectedCount === tweaks.length;
                  const someSelected = selectedCount > 0 && !allSelected;

                  return (
                    <div key={category.id} className="rounded-lg overflow-hidden border border-transparent transition-colors hover:border-border/40">
                      <div 
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors",
                          isExpanded ? "bg-muted/40" : "hover:bg-muted/20"
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
                          {isExpanded ? (
                            <FolderOpenIcon className="h-4 w-4 text-primary/70" />
                          ) : (
                            <FolderIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm font-medium truncate select-none">
                            {category.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {selectedCount}/{tweaks.length}
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
                    const selectedCount = tweaks.filter(t => selectedTweaks.has(t.id)).length;
                    const allSelected = tweaks.length > 0 && selectedCount === tweaks.length;
                    const someSelected = selectedCount > 0 && !allSelected;

                    return (
                      <div key={group.id} className="rounded-lg overflow-hidden border border-transparent transition-colors hover:border-border/40">
                         <div 
                           className={cn(
                             "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors",
                             isExpanded ? "bg-muted/40" : "hover:bg-muted/20"
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
                               {selectedCount}/{tweaks.length}
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
                    const selectedCount = tweaks.filter(t => selectedTweaks.has(t.id)).length;
                    const allSelected = tweaks.length > 0 && selectedCount === tweaks.length;
                    const someSelected = selectedCount > 0 && !allSelected;

                    return (
                      <div key={category.id} className="rounded-lg overflow-hidden border border-transparent transition-colors hover:border-border/40">
                        <div 
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors",
                            isExpanded ? "bg-muted/40" : "hover:bg-muted/20"
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
                            {isExpanded ? (
                              <FolderOpenIcon className="h-4 w-4 text-primary/70" />
                            ) : (
                              <FolderIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm font-medium truncate select-none">
                              {category.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {selectedCount}/{tweaks.length}
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
  );
}
