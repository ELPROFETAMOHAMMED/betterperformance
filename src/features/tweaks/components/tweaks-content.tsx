"use client";

import {
  useState,
  useCallback,
  useMemo,
  useDeferredValue,
  useEffect,
  useRef,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useEditorSettings } from "@/features/settings/hooks/use-editor-settings";
import VisualTree from "./visual-tree";
import CodeEditor from "./code-editor";
import { useDownloadTweaks } from "@/features/tweaks/hooks/use-download-tweaks";
import {
  saveTweakHistory,
  incrementTweakDownloads,
} from "@/features/history-tweaks/utils/tweak-history-client";
import type { TweakCategory, Tweak } from "@/features/tweaks/types/tweak.types";
import { useUser } from "@/shared/hooks/use-user";
import { cn } from "@/shared/lib/utils";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  SlidersHorizontal,
  FilterX,
  File,
  Trash2,
  FilterXIcon,
  Loader2,
  Clipboard,
  ArrowDownToLine,
  BookmarkPlus,
  CheckSquare2,
  ChevronLeft,
  ChevronRight,
  Info,
  Search,
} from "lucide-react";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import LazyLottieHero from "@/features/landing/components/lazy-lottie-hero";
import { toast } from "sonner";

interface TweaksContentProps {
  categories: TweakCategory[];
}

const FILTER_DEFAULTS = {
  selectedOnly: false,
  highDownloads: false,
  reportedOnly: false,
};

export default function TweaksContent({ categories }: TweaksContentProps) {
  const { user, loading: userLoading } = useUser();
  const [selectedTweaks, setSelectedTweaks] = useState<Map<string, Tweak>>(
    new Map()
  );
  const [activeTweakId, setActiveTweakId] = useState<string | null>(null);
  const [savedEditedCode, setSavedEditedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(FILTER_DEFAULTS);
  const [isLoading, setIsLoading] = useState(false);
  const [infoIndex, setInfoIndex] = useState(0);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestIndex, setSuggestIndex] = useState(0);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const suggestionItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const deferredSearch = useDeferredValue(searchQuery);
  const { settings } = useEditorSettings();
  const { handleDownload: handleDownloadWithWarning, WarningDialog } = useDownloadTweaks();

  // Pre-select tweaks coming from history/favorites
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

  const code = useMemo(() => {
    const selectedTweaksArray = Array.from(selectedTweaks.values());
    const cleanedBlocks = selectedTweaksArray.map((tweak) => {
      const raw =
        tweak.code || `# ${tweak.title}\n# ${tweak.description || ""}`;
      // Remove trailing whitespace and filter out empty lines
      const lines = raw
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+$/gm, "")
        .split("\n")
        .filter(line => line.trim().length > 0);
      return lines.join("\n");
    });

    // Join blocks and remove all empty lines
    const combinedCode = cleanedBlocks
      .filter(Boolean)
      .join("\n")
      .split("\n")
      .filter(line => line.trim().length > 0)
      .join("\n");

    return (
      combinedCode ||
      "# BetterPerformance code editor\n# Select tweaks on the left to build your script."
    );
  }, [selectedTweaks]);

  // Reset saved custom code when the selection changes (new script)
  useEffect(() => {
    setSavedEditedCode(null);
  }, [selectedTweaks]);

  const handleTweakToggle = useCallback((tweak: Tweak) => {
    setSelectedTweaks((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(tweak.id)) {
        newMap.delete(tweak.id);
      } else {
        newMap.set(tweak.id, tweak);
      }
      // update active tweak based on new selection state
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

  const handleClearSelection = useCallback(() => {
    handleClearAll();
  }, [handleClearAll]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(savedEditedCode ?? code);
  }, [code, savedEditedCode]);

  // Settings now come from TanStack Query/localStorage
  const {
    showLineNumbers,
    enableTextColors,
    encodingUtf8,
    hideSensitive,
    downloadEachTweak,
    alwaysShowWarning,
    showComments,
  } = settings;

 

  // Enhanced download handler that shows warning dialog if enabled
  const handleDownloadWithSettings = useCallback(async () => {
    const tweaksToDownload = Array.from(selectedTweaks.values());
    
    if (tweaksToDownload.length === 0) {
      toast.error("No tweaks selected", {
        description: "Please select at least one tweak to download.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Try to get user, but don't block download if user is not available
      // Downloads can work without user (just won't save history or increment downloads)
      const currentUser = user;
      
      // If user is still loading or not available, try to get it from session
      if ((userLoading || !currentUser) && typeof window !== "undefined") {
        try {
          const { createClient } = await import("@/shared/utils/supabase/client");
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && !currentUser) {
            // We have a user from session, but we'll use the user from hook if available
            // The download will proceed regardless
          }
        } catch (e) {
          // Ignore errors, proceed with download
          console.warn("Could not fetch user session:", e);
        }
      }

      // 1. Increment downloads for each tweak (only if user is available)
      if (currentUser) {
        try {
          await incrementTweakDownloads(tweaksToDownload.map((t) => t.id));
        } catch (error) {
          console.warn("Failed to increment download count:", error);
          // Continue with download even if this fails
        }
      }

      // 2. Save tweak history with formatted date as name (only if user is available)
      if (currentUser) {
        try {
          const now = new Date();
          const formattedDate = format(now, "dd/MM/yyyy");
          const historyName = `Last Tweak Applied - ${formattedDate}`;
          await saveTweakHistory({
            userId: currentUser.id,
            tweaks: tweaksToDownload,
            name: historyName,
            isFavorite: false,
          });
        } catch (error) {
          console.warn("Failed to save tweak history:", error);
          // Continue with download even if this fails
        }
      }

      // 3. Download tweaks using the hook (will show warning dialog if enabled)
      // The callbacks ensure toast and loading state are only updated when download actually starts
      handleDownloadWithWarning(
        tweaksToDownload,
        {
          encodingUtf8,
          hideSensitive,
          downloadEachTweak,
          customCode: savedEditedCode ?? null,
        },
        {
          onDownloadStart: () => {
            // Only show toast and clear loading when download actually starts
            toast.success("Download started", {
              description: `Downloading ${tweaksToDownload.length} tweak${tweaksToDownload.length > 1 ? "s" : ""}`,
            });
            setIsLoading(false);
          },
          onDownloadCancel: () => {
            // Clear loading state if user cancels
            setIsLoading(false);
          },
        }
      );

      // Only clear loading if warning is disabled (download starts immediately)
      // If warning is enabled, loading will be cleared in onDownloadStart or onDownloadCancel
      if (!settings.alwaysShowWarning) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Error while preparing download", {
        description: error instanceof Error ? error.message : "Please try again later...",
      });
      setIsLoading(false);
    }
  }, [
    selectedTweaks,
    encodingUtf8,
    hideSensitive,
    downloadEachTweak,
    user,
    userLoading,
    handleDownloadWithWarning,
    savedEditedCode,
    settings.alwaysShowWarning,
  ]);

  const handleQuickSaveToHistory = useCallback(async () => {
    const tweaksToSave = Array.from(selectedTweaks.values());
    if (tweaksToSave.length === 0) return;

    if (!user) {
      toast.error("Unable to save selection", {
        description: "You need to be signed in to keep a history of tweaks.",
      });
      return;
    }

    const now = new Date();
    const defaultName = `Favorite selection - ${format(
      now,
      "dd/MM/yyyy HH:mm"
    )}`;

    setFavoriteName(defaultName);
    setFavoriteDialogOpen(true);
  }, [selectedTweaks, user]);

  const selectedTweaksSet = useMemo(
    () => new Set(selectedTweaks.keys()),
    [selectedTweaks]
  );
  const selectedTweaksArray = Array.from(selectedTweaks.values());
  const activeFiltersCount =
    Number(filters.selectedOnly) +
    Number(filters.highDownloads) +
    Number(filters.reportedOnly);
  const currentSelectionKey = useMemo(
    () =>
      selectedTweaksArray.length
        ? selectedTweaksArray
            .map((tweak) => tweak.id)
            .sort()
            .join("|")
        : "",
    [selectedTweaksArray]
  );
  const filteredCategories = useMemo(() => {
    const normalized = deferredSearch.trim().toLowerCase();
    return categories
      .map((category) => {
        if (!category.tweaks || category.tweaks.length === 0) {
          return null;
        }
        const tweaksForCategory = category.tweaks.filter((tweak) => {
          if (filters.selectedOnly && !selectedTweaksSet.has(tweak.id)) {
            return false;
          }
          if (
            filters.highDownloads &&
            (tweak.download_count ?? 0) < 1000
          ) {
            return false;
          }
          // Only include tweaks that have reports when reportedOnly is enabled
          if (filters.reportedOnly && ((tweak as Tweak & { report?: number })?.report ?? 0) === 0) {
            return false;
          }
          if (normalized.length > 0) {
            const haystack =
              `${category.name} ${tweak.title} ${tweak.description ?? ""}`.toLowerCase();
            if (!haystack.includes(normalized)) {
              return false;
            }
          }
          return true;
        });

        if (tweaksForCategory.length === 0) {
          return null;
        }

        return {
          ...category,
          tweaks: tweaksForCategory,
        };
      })
      .filter((category): category is TweakCategory => Boolean(category));
  }, [categories, filters, deferredSearch, selectedTweaksSet]);

  const totalVisibleTweaks = useMemo(
    () =>
      filteredCategories.reduce(
        (sum, category) => sum + category.tweaks.length,
        0
      ),
    [filteredCategories]
  );
  const hasActiveFilters =
    filters.selectedOnly || filters.highDownloads || filters.reportedOnly;

  const toggleFilter = useCallback(
    (key: keyof typeof FILTER_DEFAULTS, value?: boolean) => {
      setFilters((prev) => ({
        ...prev,
        [key]: typeof value === "boolean" ? value : !prev[key],
      }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(FILTER_DEFAULTS);
    setSearchQuery("");
  }, []);

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const items: { tweak: Tweak; category: string }[] = [];
    for (const category of filteredCategories) {
      for (const tweak of category.tweaks) {
        items.push({ tweak, category: category.name });
        if (items.length >= 8) break;
      }
      if (items.length >= 8) break;
    }
    return items;
  }, [filteredCategories, searchQuery]);

  useEffect(() => {
    setSuggestIndex(0);
    setSuggestOpen(searchQuery.trim().length > 0 && searchSuggestions.length > 0);
  }, [searchQuery, searchSuggestions.length]);

  useEffect(() => {
    if (!selectedTweaksArray.length) {
      setInfoIndex(0);
      return;
    }
    setInfoIndex((prev) =>
      Math.min(Math.max(prev, 0), selectedTweaksArray.length - 1)
    );
  }, [selectedTweaksArray.length]);

  useEffect(() => {
    if (!activeTweakId) return;
    const idx = selectedTweaksArray.findIndex((t) => t.id === activeTweakId);
    if (idx >= 0) {
      setInfoIndex(idx);
    }
  }, [activeTweakId, selectedTweaksArray]);

  const activeTweak =
    (activeTweakId && selectedTweaks.get(activeTweakId)) ||
    selectedTweaksArray[selectedTweaksArray.length - 1] ||
    null;
  const activeCategory =
    activeTweak &&
    categories.find((category) => category.id === activeTweak.category_id);
  const infoTweak = selectedTweaksArray[infoIndex] || null;
  const infoCategory = infoTweak
    ? categories.find((category) => category.id === infoTweak.category_id)
    : null;
  const [lineCount, setLineCount] = useState(0);
  const [favoriteDialogOpen, setFavoriteDialogOpen] = useState(false);
  const [favoriteName, setFavoriteName] = useState("");
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);

  const handleSelectAllTweaks = useCallback(() => {
    const allTweaks: Tweak[] = [];
    categories.forEach((category) => {
      (category.tweaks || []).forEach((tweak) => {
        allTweaks.push(tweak);
      });
    });

    if (!allTweaks.length) return;

    const totalTweaksCount = allTweaks.length;
    const currentlySelectedCount = selectedTweaks.size;
    const selectingAll = currentlySelectedCount !== totalTweaksCount;

    setSelectedTweaks(() => {
      const newMap = new Map<string, Tweak>();

      if (selectingAll) {
        allTweaks.forEach((tweak) => {
          newMap.set(tweak.id, tweak);
        });
        const last = allTweaks[allTweaks.length - 1];
        setActiveTweakId(last ? last.id : null);
      } else {
        setActiveTweakId(null);
      }

      return newMap;
    });
  }, [categories, selectedTweaks.size]);

  const handleSelectSuggestion = useCallback(
    (tweak: Tweak) => {
      handleTweakToggle(tweak);
      setSearchQuery("");
      setSuggestOpen(false);
    },
    [handleTweakToggle]
  );

  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!suggestOpen || searchSuggestions.length === 0) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSuggestIndex((prev) => (prev + 1) % searchSuggestions.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSuggestIndex((prev) =>
          prev - 1 < 0 ? searchSuggestions.length - 1 : prev - 1
        );
      } else if (event.key === "Enter") {
        event.preventDefault();
        const target = searchSuggestions[suggestIndex];
        if (target) {
          handleSelectSuggestion(target.tweak);
        }
      } else if (event.key === "Escape") {
        setSuggestOpen(false);
      }
    },
    [searchSuggestions, suggestIndex, suggestOpen, handleSelectSuggestion]
  );

  // Auto-scroll to active suggestion when navigating with keyboard
  useEffect(() => {
    if (!suggestOpen || !suggestionsRef.current) return;
    const activeItem = suggestionItemRefs.current[suggestIndex];
    if (activeItem && suggestionsRef.current) {
      const container = suggestionsRef.current;
      const itemTop = activeItem.offsetTop;
      const itemBottom = itemTop + activeItem.offsetHeight;
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;

      if (itemTop < containerTop) {
        // Item is above visible area
        container.scrollTo({ top: itemTop, behavior: "smooth" });
      } else if (itemBottom > containerBottom) {
        // Item is below visible area
        container.scrollTo({
          top: itemBottom - container.clientHeight,
          behavior: "smooth",
        });
      }
    }
  }, [suggestIndex, suggestOpen]);

  const handleInfoNav = useCallback(
    (direction: number) => {
      if (!selectedTweaksArray.length) return;
      setInfoIndex((prev) => {
        const next =
          (prev + direction + selectedTweaksArray.length) %
          selectedTweaksArray.length;
        const target = selectedTweaksArray[next];
        setActiveTweakId(target?.id ?? null);
        return next;
      });
    },
    [selectedTweaksArray]
  );

  return (
    <motion.div
      className="w-full px-4 py-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:min-h-[calc(100vh-8rem)] lg:flex-row">
        {/* Left: tree with filters */}
        <div className="flex w-full flex-col gap-4 lg:w-1/2">
          {/* Search bar with suggestions */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
          >
            {/* Backdrop for suggestions */}
            <AnimatePresence>
              {suggestOpen && searchSuggestions.length > 0 && (
                <motion.div
                  key="suggest-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 z-20 bg-background/70 backdrop-blur-sm"
                  onClick={() => setSuggestOpen(false)}
                />
              )}
            </AnimatePresence>
            <div className="relative z-30 flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Search tweaks, categories, descriptions..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onFocus={() =>
                    setSuggestOpen(
                      searchQuery.trim().length > 0 &&
                        searchSuggestions.length > 0
                    )
                  }
                  onKeyDown={handleSearchKeyDown}
                  className="h-10 w-full rounded-sm border border-border/30 bg-background/80 pl-10 pr-3 text-sm focus-visible:ring-2 focus-visible:ring-primary/30"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="relative z-40 h-10 w-10 rounded-sm border border-border/30 bg-background/80 text-muted-foreground transition hover:text-foreground"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-background/95 backdrop-blur-sm"
                >
                  <DropdownMenuCheckboxItem
                    checked={filters.selectedOnly}
                    onCheckedChange={(checked) =>
                      toggleFilter("selectedOnly", Boolean(checked))
                    }
                  >
                    Show selected tweaks
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filters.highDownloads}
                    onCheckedChange={(checked) =>
                      toggleFilter("highDownloads", Boolean(checked))
                    }
                  >
                    Popular tweaks only
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filters.reportedOnly}
                    onCheckedChange={(checked) =>
                      toggleFilter("reportedOnly", Boolean(checked))
                    }
                  >
                    Show reported tweaks
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={resetFilters}
                    disabled={!hasActiveFilters}
                  >
                    <FilterXIcon className="w-4 h-4" />
                    Reset filters
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={!selectedTweaksArray.length}
                    onClick={handleClearSelection}
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear selection
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* Search suggestions */}
            <AnimatePresence>
              {suggestOpen && searchSuggestions.length > 0 && (
                <motion.div
                  key="suggest-panel"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="absolute z-40 mt-1 w-full rounded-sm border border-border/30 bg-background/95 backdrop-blur-sm shadow-xl"
                >
                  <div
                    ref={suggestionsRef}
                    className="max-h-72 overflow-y-auto p-2"
                  >
                    {searchSuggestions.map((item, idx) => {
                      const isActive = idx === suggestIndex;
                      return (
                        <motion.button
                          key={item.tweak.id}
                          ref={(el) => {
                            suggestionItemRefs.current[idx] = el;
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSelectSuggestion(item.tweak)}
                          className={cn(
                            "w-full rounded-sm px-3 py-2 text-left text-sm transition-colors",
                            isActive
                              ? "bg-accent text-foreground"
                              : "hover:bg-accent/40"
                          )}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15, delay: idx * 0.01 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="font-medium text-foreground">
                            {item.tweak.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.category}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          {filteredCategories.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-[var(--radius-md)] border border-dashed border-border/40  p-4 text-center text-xs text-muted-foreground">
              <LazyLottieHero className="h-32 w-32 opacity-60" />
              <p>No tweaks match your filters right now.</p>
              <Button
                variant="link"
                size="sm"
                className="text-xs font-medium text-primary"
                onClick={resetFilters}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <VisualTree
                categories={filteredCategories}
                selectedTweaks={selectedTweaksSet}
                onTweakToggle={handleTweakToggle}
              />
            </div>
          )}
        </div>

        {/* Right: details + controls */}
        <div className="flex h-full w-full flex-1 flex-col gap-4 p-4 lg:w-1/2">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold tracking-tight">
                Selected tweaks
              </h2>
              <p className="text-xs text-muted-foreground">
                {selectedTweaksArray.length > 0
                  ? `${selectedTweaksArray.length} tweak${
                      selectedTweaksArray.length > 1 ? "s" : ""
                    } selected`
                  : "Choose tweaks from the left panel to preview their script."}
              </p>
            </div>
            <div className="hidden items-center gap-2">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleSelectAllTweaks}
                      disabled={!categories.length}
                    >
                      <CheckSquare2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-[11px]">
                      {selectedTweaksArray.length === 0
                        ? "Select all tweaks"
                        : "Toggle select all tweaks"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!selectedTweaksArray.length}
                  >
                    <File className="h-4 w-4" />
                    View final script
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="flex h-full w-full flex-col overflow-y-auto border-l border-border/70 bg-background/95 p-4 sm:max-w-xl"
                >
                  <SheetHeader>
                    <SheetTitle>Final PowerShell script</SheetTitle>
                    <SheetDescription>
                      Combined .ps1 content for all currently selected tweaks.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-4 flex-1 pr-2">
                    <div className="flex flex-col gap-3 pb-4">
                      <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                      <span className="rounded-full border border-border/60 bg-background/70 px-2 py-0.5">
                        {selectedTweaksArray.length} selected tweak
                        {selectedTweaksArray.length === 1 ? "" : "s"}
                      </span>
                      <span className="rounded-full border border-border/60 bg-background/70 px-2 py-0.5">
                        ~{lineCount} lines
                      </span>
                      <span className="rounded-full border border-border/60 bg-background/70 px-2 py-0.5">
                        {
                          new Set(
                            selectedTweaksArray.map(
                              (tweak) => tweak.category_id
                            )
                          ).size
                        }{" "}
                        categories
                      </span>
                    </div>
                      <div className="h-[420px] rounded-[var(--radius-md)] border border-border/70 bg-background/80 p-2">
                        <CodeEditor
                          selectedTweaks={selectedTweaksArray}
                          code={code}
                          onSaveCode={setSavedEditedCode}
                          showLineNumbers={showLineNumbers}
                          enableTextColors={enableTextColors}
                          hideSensitive={hideSensitive}
                          wrapCode={settings.wrapCode}
                          showComments={showComments}
                          enableCodeEditing={settings.enableCodeEditing}
                          enableLineCount={settings.enableLineCount}
                          onLineCountChange={setLineCount}
                        />
                      </div>
                      {/* Summary of selected tweaks */}
                      <div className="mt-3 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
                        <p className="mb-2 text-[11px] font-medium text-foreground">
                          Selected tweaks overview
                        </p>
                        <ScrollArea className="h-40 pr-1">
                          <div className="space-y-2">
                            {selectedTweaksArray.map((tweak, index) => (
                              <div key={tweak.id}>
                                <p className="text-[11px] font-semibold text-foreground">
                                  {index + 1}. {tweak.title}
                                </p>
                                <p className="line-clamp-2 text-[11px] text-muted-foreground">
                                  {tweak.description}
                                </p>
                                {index < selectedTweaksArray.length - 1 && (
                                  <div className="mt-2 border-b border-border/40" />
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="max-w-sm text-[11px] text-muted-foreground">
                          Quick actions for this combined script: bookmark it in
                          your history, copy it to the clipboard, or download it
                          as a .ps1 file.
                        </p>
                        <TooltipProvider delayDuration={200}>
                          <div className="flex flex-wrap items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={handleQuickSaveToHistory}
                                  disabled={!selectedTweaksArray.length || isSavingFavorite}
                                >
                                  {isSavingFavorite ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <BookmarkPlus className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-[11px]">
                                  Save this selection as a named favorite
                                </p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={handleCopy}
                                  disabled={!selectedTweaksArray.length}
                                >
                                  <Clipboard className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-[11px]">Copy script</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={handleDownloadWithSettings}
                                  disabled={!selectedTweaksArray.length || isLoading}
                                >
                                  {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <ArrowDownToLine className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-[11px]">
                                  {isLoading
                                    ? "Preparing download..."
                                    : "Download script"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto rounded-[var(--radius-md)] p-3 text-sm">
              {selectedTweaksArray.length > 0 && infoTweak ? (
                <div className="flex h-full flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
                        {selectedTweaksArray.length} selected
                      </span>
                      <span className="rounded-full bg-muted/60 px-2.5 py-0.5 text-foreground/80">
                        {infoCategory?.name ?? "Category"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition hover:text-foreground"
                        onClick={() => handleInfoNav(-1)}
                        aria-label="Previous tweak"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <div className="text-[11px] text-muted-foreground">
                        {infoIndex + 1} / {selectedTweaksArray.length}
                      </div>
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition hover:text-foreground"
                        onClick={() => handleInfoNav(1)}
                        aria-label="Next tweak"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[var(--radius-md)] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          {infoCategory?.name || "Category"}
                        </p>
                        <h3 className="text-base font-semibold leading-snug text-foreground">
                          {infoTweak.title}
                        </h3>
                        <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
                          {infoTweak.description || "No description provided."}
                        </p>
                      </div>
                      <div className="rounded-md bg-muted/50 px-2 py-1 text-[11px] text-muted-foreground">
                        ID:{" "}
                        <span className="font-mono text-[10px]">
                          {infoTweak.id}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-muted-foreground">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">Metrics</p>
                        <p className="flex items-center gap-1">
                          <ArrowDownToLine className="h-3.5 w-3.5" />
                          <span className="font-semibold text-foreground">
                            {infoTweak.download_count ?? 0}
                          </span>
                          <span>downloads</span>
                        </p>
                        <p className="flex items-center gap-1">
                          <BookmarkPlus className="h-3.5 w-3.5" />
                          <span className="font-semibold text-foreground">
                            {infoTweak.favorite_count ?? 0}
                          </span>
                          <span>favorites</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">Details</p>
                        <p className="flex items-center gap-1">
                          <Info className="h-3.5 w-3.5" />
                          <span className="font-semibold text-foreground">
                            {infoCategory?.tweaks?.length ?? 0}
                          </span>
                          <span>in category</span>
                        </p>
                        <p className="flex items-center gap-1">
                          <CheckSquare2 className="h-3.5 w-3.5" />
                          <span className="font-semibold text-foreground">
                            {
                              (infoCategory?.tweaks || []).filter((tweak) =>
                                selectedTweaksSet.has(tweak.id)
                              ).length
                            }
                          </span>
                          <span>selected in group</span>
                        </p>
                      </div>
                    </div>

                    {infoTweak.tweak_comment && (
                      <div className="mt-3 rounded-md border border-dashed border-border/40 bg-background/80 px-3 py-2 text-[11px]">
                        <p className="mb-1 text-[11px] font-medium text-foreground">
                          Author notes
                        </p>
                        <p className="line-clamp-2 text-[11px] text-muted-foreground">
                          {infoTweak.tweak_comment}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col items-start justify-center gap-2 text-xs text-muted-foreground">
                  <p className="text-sm font-medium text-foreground">
                    No tweak selected yet
                  </p>
                  <p>
                    Start by choosing a category and one or more tweaks from the
                    left panel. We will show here a concise explanation and
                    impact overview.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border/20 pt-3">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={handleSelectAllTweaks}
                    disabled={!categories.length}
                  >
                    <CheckSquare2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-[11px]">
                    {selectedTweaksArray.length === 0
                      ? "Select all tweaks"
                      : "Toggle select all tweaks"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="gap-2"
                  disabled={!selectedTweaksArray.length}
                >
                  <File className="h-4 w-4" />
                  View final script
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex h-full w-full flex-col overflow-y-auto border-l border-border/70 bg-background/95 p-4 sm:max-w-xl"
              >
                <SheetHeader>
                  <SheetTitle>Final PowerShell script</SheetTitle>
                  <SheetDescription>
                    Combined .ps1 content for all currently selected tweaks.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 flex-1 pr-2">
                  <div className="flex flex-col gap-3 pb-4">
                    <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                      <span className="rounded-full border border-border/60 bg-background/70 px-2 py-0.5">
                        {selectedTweaksArray.length} selected tweak
                        {selectedTweaksArray.length === 1 ? "" : "s"}
                      </span>
                      <span className="rounded-full border border-border/60 bg-background/70 px-2 py-0.5">
                        ~{lineCount} lines
                      </span>
                      <span className="rounded-full border border-border/60 bg-background/70 px-2 py-0.5">
                        {
                          new Set(
                            selectedTweaksArray.map(
                              (tweak) => tweak.category_id
                            )
                          ).size
                        }{" "}
                        categories
                      </span>
                    </div>
                    <div className="h-[420px] rounded-[var(--radius-md)] border border-border/70 bg-background/80 p-2">
                      <CodeEditor
                        selectedTweaks={selectedTweaksArray}
                        code={code}
                        onSaveCode={setSavedEditedCode}
                        showLineNumbers={showLineNumbers}
                        enableTextColors={enableTextColors}
                        hideSensitive={hideSensitive}
                        wrapCode={settings.wrapCode}
                        showComments={showComments}
                        enableCodeEditing={settings.enableCodeEditing}
                        enableLineCount={settings.enableLineCount}
                        onLineCountChange={setLineCount}
                      />
                    </div>
                    {/* Summary of selected tweaks */}
                    <div className="mt-3 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
                      <p className="mb-2 text-[11px] font-medium text-foreground">
                        Selected tweaks overview
                      </p>
                      <ScrollArea className="h-40 pr-1">
                        <div className="space-y-2">
                          {selectedTweaksArray.map((tweak, index) => (
                            <div key={tweak.id}>
                              <p className="text-[11px] font-semibold text-foreground">
                                {index + 1}. {tweak.title}
                              </p>
                              <p className="line-clamp-2 text-[11px] text-muted-foreground">
                                {tweak.description}
                              </p>
                              {index < selectedTweaksArray.length - 1 && (
                                <div className="mt-2 border-b border-border/40" />
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="max-w-sm text-[11px] text-muted-foreground">
                        Quick actions for this combined script: bookmark it in
                        your history, copy it to the clipboard, or download it
                        as a .ps1 file.
                      </p>
                      <TooltipProvider delayDuration={200}>
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleQuickSaveToHistory}
                                disabled={
                                  !selectedTweaksArray.length || isSavingFavorite
                                }
                              >
                                {isSavingFavorite ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <BookmarkPlus className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="text-[11px]">
                                Save this selection as a named favorite
                              </p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleCopy}
                                disabled={!selectedTweaksArray.length}
                              >
                                <Clipboard className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="text-[11px]">Copy script</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleDownloadWithSettings}
                                disabled={!selectedTweaksArray.length || isLoading}
                              >
                                {isLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <ArrowDownToLine className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="text-[11px]">
                                {isLoading
                                  ? "Preparing download..."
                                  : "Download script"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <AlertDialog
        open={favoriteDialogOpen}
        onOpenChange={(open) => {
          setFavoriteDialogOpen(open);
          if (!open) {
            setIsSavingFavorite(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save selection as favorite</AlertDialogTitle>
            <AlertDialogDescription>
              Give this combination of tweaks a descriptive name so you can
              quickly find it in your history later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-2 space-y-2">
            <Input
              autoFocus
              value={favoriteName}
              onChange={(e) => setFavoriteName(e.target.value)}
              placeholder="e.g. Gaming preset, Work essentials..."
            />
            {selectedTweaksArray.length > 0 && (
              <p className="text-xs text-muted-foreground">
                This selection contains {selectedTweaksArray.length} tweak
                {selectedTweaksArray.length === 1 ? "" : "s"}.
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSavingFavorite}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              asChild
              disabled={isSavingFavorite || !favoriteName.trim()}
            >
              <Button
                onClick={async () => {
                  if (!user) {
                    toast.error("Unable to save selection", {
                      description:
                        "You need to be signed in to keep a history of tweaks.",
                    });
                    return;
                  }
                  const tweaksToSave = Array.from(selectedTweaks.values());
                  if (!tweaksToSave.length) {
                    setFavoriteDialogOpen(false);
                    return;
                  }
                  try {
                    setIsSavingFavorite(true);
                    await saveTweakHistory({
                      userId: user.id,
                      tweaks: tweaksToSave,
                      name: favoriteName.trim(),
                      isFavorite: true,
                    });
                    toast.success("Saved as favorite in history", {
                      description:
                        "You can find it later in the History tab, marked with a star.",
                    });
                    setFavoriteDialogOpen(false);
                  } catch (error) {
                    console.error(error);
                    toast.error("Failed to save selection", {
                      description: "Please try again later...",
                    });
                  } finally {
                    setIsSavingFavorite(false);
                  }
                }}
              >
                {isSavingFavorite ? "Saving…" : "Save favorite"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Warning Dialog - handled by useDownloadTweaks hook */}
      <WarningDialog />
    </motion.div>
  );
}



