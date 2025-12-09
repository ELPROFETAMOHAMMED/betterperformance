"use client";

import {
  useState,
  useCallback,
  useMemo,
  useDeferredValue,
  useEffect,
} from "react";
import { useEditorSettings } from "@/features/settings/hooks/use-editor-settings";
import VisualTree from "./visual-tree";
import CodeEditor from "./code-editor";
import { downloadTweaks } from "@/features/tweaks/utils/download-tweaks";
import {
  saveTweakHistory,
  incrementTweakDownloads,
} from "@/features/history-tweaks/utils/tweak-history-client";
import type { TweakCategory, Tweak } from "@/features/tweaks/types/tweak.types";
import { useUser } from "@/shared/hooks/use-user";
import { format, setISODay } from "date-fns";
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
import { fi } from "date-fns/locale";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(FILTER_DEFAULTS);
  const [isLoading, setIsLoading] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const deferredSearch = useDeferredValue(searchQuery);
  const { settings } = useEditorSettings();

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

  const handleTweakRemove = useCallback((tweakId: string) => {
    setSelectedTweaks((prev) => {
      const newMap = new Map(prev);
      newMap.delete(tweakId);
      const newActiveId = Array.from(newMap.keys())[newMap.size - 1] ?? null;
      setActiveTweakId(newActiveId);
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
    navigator.clipboard.writeText(code);
  }, [code]);

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

  // Function to create restore point script
  const createRestorePointScript = useCallback(() => {
    const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss");
    const restorePointName = `BetterPerformance_Tweaks_${timestamp}`;
    
    const script = `# Create System Restore Point
# Run this script as Administrator

$ErrorActionPreference = "Stop"

try {
    Write-Host "Creating system restore point: $restorePointName" -ForegroundColor Cyan
    
    # Check if running as administrator
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    if (-not $isAdmin) {
        Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
        Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
        exit 1
    }
    
    # Create restore point using Checkpoint-Computer
    Checkpoint-Computer -Description "$restorePointName" -RestorePointType "MODIFY_SETTINGS"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Restore point created successfully!" -ForegroundColor Green
        Write-Host "Restore Point Name: $restorePointName" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "Failed to create restore point. Exit code: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "Error creating restore point: $_" -ForegroundColor Red
    exit 1
}`;

    const blob = new Blob([script], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Create-RestorePoint-${timestamp}.ps1`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Restore point script downloaded", {
      description: "Run this script as Administrator to create a restore point.",
    });
  }, []);

  // Internal download function (performs actual download)
  const performDownload = useCallback(async () => {
    setIsLoading(true);
    try {
      const tweaksToDownload = Array.from(selectedTweaks.values());
      // Make sure that we have tweaksSelected
      if (tweaksToDownload.length === 0) {
        toast.error("No tweaks selected", {
          description: "Please select at least one tweak to download.",
        });
        setIsLoading(false);
        return;
      }

      // Try to get user, but don't block download if user is not available
      // Downloads can work without user (just won't save history or increment downloads)
      let currentUser = user;
      
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

      // 3. Download tweaks (this always works, regardless of user)
      downloadTweaks({
        tweaks: tweaksToDownload,
        options: {
          encodingUtf8,
          hideSensitive,
          downloadEachTweak,
        },
      });

      toast.success("Download started", {
        description: `Downloading ${tweaksToDownload.length} tweak${tweaksToDownload.length > 1 ? "s" : ""}`,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Error while preparing download", {
        description: error instanceof Error ? error.message : "Please try again later...",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedTweaks, encodingUtf8, hideSensitive, downloadEachTweak, user, userLoading]);

  // Enhanced download handler that shows warning dialog if enabled
  const handleDownloadWithSettings = useCallback(() => {
    const tweaksToDownload = Array.from(selectedTweaks.values());
    
    if (tweaksToDownload.length === 0) {
      toast.error("No tweaks selected", {
        description: "Please select at least one tweak to download.",
      });
      return;
    }

    // Show warning dialog if enabled, otherwise proceed directly
    if (alwaysShowWarning) {
      setShowWarningDialog(true);
    } else {
      performDownload();
    }
  }, [selectedTweaks, alwaysShowWarning, performDownload]);

  const handleWarningDialogContinue = useCallback(() => {
    setShowWarningDialog(false);
    performDownload();
  }, [performDownload]);

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
            (tweak.tweak_metadata?.downloadCount ?? 0) < 1000
          ) {
            return false;
          }
          if (
            filters.reportedOnly &&
            (tweak.tweak_metadata?.report ?? 0) === 0
          ) {
            return false;
          }
          if (normalized.length > 0) {
            const haystack =
              `${category.name} ${tweak.title} ${tweak.description}`.toLowerCase();
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
  }, [categories, filters, searchQuery, selectedTweaksSet]);

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

  const activeTweak =
    (activeTweakId && selectedTweaks.get(activeTweakId)) ||
    selectedTweaksArray[selectedTweaksArray.length - 1] ||
    null;
  const activeCategory =
    activeTweak &&
    categories.find((category) => category.id === activeTweak.category_id);
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

  return (
    <div className="w-full px-4 py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:min-h-[calc(100vh-8rem)] lg:flex-row">
        {/* Left: tree with filters */}
        <div className="flex w-full flex-col gap-4 lg:w-[600px]">
          <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-border/40 bg-transparent p-3">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                {filteredCategories.length} categor
                {filteredCategories.length === 1 ? "y" : "ies"} ·{" "}
                {totalVisibleTweaks} tweak{totalVisibleTweaks === 1 ? "" : "s"}
              </span>
              {hasActiveFilters && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto px-0 text-xs font-medium text-primary"
                  onClick={resetFilters}
                >
                  <FilterX className="mr-1 h-3 w-3" />
                  Reset
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search tweaks..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-9 flex-1 rounded-[var(--radius-md)] border-border/40 bg-transparent text-sm"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-10 rounded-[var(--radius-md)] border-border/60 bg-background/60 text-muted-foreground transition hover:text-foreground"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-background/90 backdrop-blur-sm"
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
                    <Trash2 className="h-4 w-4" />
                    Clear selection
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
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
            <VisualTree
              categories={filteredCategories}
              selectedTweaks={selectedTweaksSet}
              onTweakToggle={handleTweakToggle}
            />
          )}
        </div>

        {/* Right: details + controls */}
        <div className="flex h-full w-full flex-1 flex-col rounded-[var(--radius-md)] border border-border/40 bg-card/80 p-4">
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
            <div className="flex items-center gap-2">
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
                                  disabled={!selectedTweaksArray.length}
                                >
                                  <BookmarkPlus className="h-4 w-4" />
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

          <div className="flex-1">
            <div className="h-full rounded-[var(--radius-md)] border border-border/40 bg-background/70 p-3 text-sm">
              {activeTweak && activeCategory ? (
                <div className="flex h-full flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {activeCategory.name}
                      </p>
                      <h3 className="text-base font-semibold leading-snug">
                        {activeTweak.title}
                      </h3>
                    </div>
                    <div className="px-2 text-[11px] border-b ">
                      {activeCategory.tweaks.length} tweaks in category
                    </div>
                  </div>

                  <p className="line-clamp-3 text-xs text-muted-foreground">
                    {activeTweak.description}
                  </p>

                  <div className="mt-2 grid grid-cols-2 gap-3 text-[11px] text-muted-foreground">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">Metrics</p>
                      <p>
                        Downloads:{" "}
                        <span className="font-semibold text-foreground">
                          {activeTweak.tweak_metadata.downloadCount}
                        </span>
                      </p>
                      <p>
                        Reports:{" "}
                        <span className="font-semibold text-foreground">
                          {activeTweak.tweak_metadata.report}
                        </span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        Category insight
                      </p>
                      <p>
                        Category id:{" "}
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {activeCategory.id}
                        </span>
                      </p>
                      <p>
                        Selected in group:{" "}
                        <span className="font-semibold text-foreground">
                          {
                            activeCategory.tweaks.filter((tweak) =>
                              selectedTweaksSet.has(tweak.id)
                            ).length
                          }
                        </span>
                      </p>
                    </div>
                  </div>

                  {activeTweak.tweak_metadata.tweakComment && (
                    <div className="mt-auto rounded-md border border-dashed border-border/60 bg-background/60 px-3 py-2 text-[11px]">
                      <p className="mb-1 text-[11px] font-medium text-foreground">
                        Author notes
                      </p>
                      <p className="line-clamp-2 text-[11px] text-muted-foreground">
                        {activeTweak.tweak_metadata.tweakComment}
                      </p>
                    </div>
                  )}
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

      {/* Warning Dialog before Download */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Important Warning - Read Before Downloading</AlertDialogTitle>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3">
                <p className="font-semibold text-yellow-600 dark:text-yellow-500 mb-2">
                  ⚠️ Experimental Feature - Use at Your Own Risk
                </p>
                <p>
                  This platform is currently in experimental phase. We take no responsibility for any damage, data loss, or system instability that may occur from using these tweaks.
                </p>
              </div>

              <div>
                <p className="font-medium text-foreground mb-2">
                  Before downloading and applying tweaks, please ensure you:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Have reviewed and understand each tweak you're about to apply</li>
                  <li>Have created a system restore point (strongly recommended)</li>
                  <li>Are aware that some tweaks may require administrator privileges</li>
                  <li>Have backed up all important data</li>
                  <li>Understand that combining incompatible tweaks may break your system</li>
                  <li>Know what you're doing or are willing to accept the risks</li>
                </ul>
              </div>

              <div className="rounded-md border border-red-500/50 bg-red-500/10 p-3">
                <p className="font-semibold text-red-600 dark:text-red-500 mb-1">
                  ⚠️ Compatibility Warning
                </p>
                <p className="text-xs">
                  Some tweaks may not be compatible with each other or with your specific system configuration. Applying incompatible tweaks together can cause system instability, crashes, or require a system restore. Always test tweaks individually when possible.
                </p>
              </div>

              <p className="text-xs text-muted-foreground italic">
                By clicking "Continue Download", you acknowledge that you understand these risks and that BetterPerformance is not responsible for any consequences resulting from the use of these tweaks.
              </p>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowWarningDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleWarningDialogContinue}>
              I Understand - Continue Download
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}



