"use client";

import { useState, useCallback, useMemo, useDeferredValue } from "react";
import { useEditorSettings } from "@/hooks/useEditorSettings";
import VisualTree from "./visual-tree";
import CodeEditor from "./code-editor";
import { downloadTweaks } from "@/services/download-tweaks";
import {
  saveTweakHistory,
  incrementTweakDownloads,
} from "@/services/tweak-history";
import type { TweakCategory, Tweak } from "@/types/tweak.types";
import { useUser } from "@/hooks/use-user";
import { format, setISODay } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SlidersHorizontal,
  FilterX,
  File,
  Trash2,
  FilterXIcon,
  Loader2,
} from "lucide-react";
import LottieIllustration from "@/components/layout/lottie-illustration";
import heroAnimation from "@/data/lottie/hero-loop.json";
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
  const { user } = useUser();
  const [selectedTweaks, setSelectedTweaks] = useState<Map<string, Tweak>>(
    new Map()
  );
  const [activeTweakId, setActiveTweakId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(FILTER_DEFAULTS);
  const [isLoading, setIsLoading] = useState(false);
  const deferredSearch = useDeferredValue(searchQuery);
  const { settings } = useEditorSettings();

  const code = useMemo(() => {
    const selectedTweaksArray = Array.from(selectedTweaks.values());
    const combinedCode = selectedTweaksArray
      .map(
        (tweak) => tweak.code || `# ${tweak.title}\n# ${tweak.description}\n`
      )
      .join("\n\n");
    return combinedCode || "#BetterPerformance code Editor v1.0.0 ";
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
  } = settings;

  // enhanced download handler that respects settings (encoding, per-tweak, redaction)
  const handleDownloadWithSettings = useCallback(async () => {
    setIsLoading(true);
    const tweaksToDownload = Array.from(selectedTweaks.values());
    // Make sure that we have tweaksSelected
    if (tweaksToDownload.length === 0) return;

    if (!user)
      return toast.error("Error", {
        description: "Please try again later...",
      });

    // 1. Increment downloads for each tweak
    await incrementTweakDownloads(tweaksToDownload.map((t) => t.id));

    // 2. Save tweak history with formatted date as name
    const now = new Date();
    const formattedDate = format(now, "dd/MM/yyyy");
    const historyName = `Last Tweak Applied - ${formattedDate}`;
    await saveTweakHistory({
      userId: user.id,
      tweaks: tweaksToDownload,
      name: historyName,
    });

    // 3. Download tweaks
    downloadTweaks({
      tweaks: tweaksToDownload,
      options: {
        encodingUtf8,
        hideSensitive,
        downloadEachTweak,
      },
    });

    setIsLoading(false);
  }, [selectedTweaks, encodingUtf8, hideSensitive, downloadEachTweak, user]);

  const selectedTweaksSet = useMemo(
    () => new Set(selectedTweaks.keys()),
    [selectedTweaks]
  );
  const selectedTweaksArray = Array.from(selectedTweaks.values());
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
  const lineCount = useMemo(() => (code ? code.split("\n").length : 0), [code]);

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
              <LottieIllustration
                animationData={heroAnimation}
                className="h-32 w-32 opacity-60"
              />
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
                  className="w-full border-l border-border/70 bg-background/95 p-4 sm:max-w-xl"
                >
                  <SheetHeader>
                    <SheetTitle>Final PowerShell script</SheetTitle>
                    <SheetDescription>
                      Combined .ps1 content for all currently selected tweaks.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-4 flex flex-col gap-3">
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
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        disabled={!selectedTweaksArray.length}
                      >
                        Copy script
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleDownloadWithSettings}
                        disabled={!selectedTweaksArray.length || isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                          "Download"
                        )}
                      </Button>
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
    </div>
  );
}
