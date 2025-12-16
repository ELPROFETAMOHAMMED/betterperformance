"use client";

import {
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { motion } from "framer-motion";
import { useEditorSettings } from "@/features/settings/hooks/use-editor-settings";
import VisualTree from "./visual-tree";
import { useDownloadTweaks } from "@/features/tweaks/hooks/use-download-tweaks";
import { prepareDownload } from "@/features/tweaks/services/download-handler-service";
import { saveTweakHistory, updateTweakHistory, deleteTweakHistory } from "@/features/history-tweaks/utils/tweak-history-client";
import { useHistoryTweaks } from "@/features/history-tweaks/hooks/use-history-tweaks";
import type { TweakCategory, Tweak } from "@/features/tweaks/types/tweak.types";
import { useUser } from "@/shared/hooks/use-user";
import { format } from "date-fns";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
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
import { TweakReportDialog } from "./tweak-report-dialog";
import { TweakDetailsPanel } from "./tweak-details-panel";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface TweaksContentProps {
  categories: TweakCategory[];
}

export default function TweaksContent({ categories }: TweaksContentProps) {
  const { user, loading: userLoading } = useUser();
  const [selectedTweaks, setSelectedTweaks] = useState<Map<string, Tweak>>(
    new Map()
  );
  const [activeTweakId, setActiveTweakId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const { settings } = useEditorSettings();
  const { handleDownload: handleDownloadWithWarning, WarningDialog } = useDownloadTweaks();
  const queryClient = useQueryClient();

  // Fetch user history for the filter
  const { 
    data: historyEntries, 
    isLoading: isHistoryLoading,
    isRefetching: isHistoryRefetching,
    refetch: refetchHistory 
  } = useHistoryTweaks(!!user);
  
  const { historyTweakIds, favoriteTweakIds, userFavoriteSelections, userHistorySelections } = useMemo(() => {
    const historyIds = new Set<string>();
    const favoriteIds = new Set<string>();
    const favSelections = [];
    const histSelections = [];

    if (historyEntries) {
      for (const entry of historyEntries) {
        if (entry.isFavorite) {
          favSelections.push(entry);
          if (Array.isArray(entry.tweaks)) {
            (entry.tweaks as { id: string }[]).forEach((t) => favoriteIds.add(t.id));
          }
        } else {
           histSelections.push(entry);
           if (Array.isArray(entry.tweaks)) {
             (entry.tweaks as { id: string }[]).forEach((t) => historyIds.add(t.id));
           }
        }
      }
    }
    return { 
      historyTweakIds: historyIds, 
      favoriteTweakIds: favoriteIds,
      userFavoriteSelections: favSelections,
      userHistorySelections: histSelections
    };
  }, [historyEntries]);

  // Pre-select tweaks coming from history/favorites (localStorage logic)
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

  const handleSelectAllTweaks = useCallback(() => {
    const newMap = new Map<string, Tweak>();
    categories.forEach(cat => {
      cat.tweaks?.forEach(t => newMap.set(t.id, t));
    });
    setSelectedTweaks(newMap);
    if (newMap.size > 0) {
      const last = Array.from(newMap.values()).pop();
      if (last) setActiveTweakId(last.id);
    }
  }, [categories]);

  const handleCopy = useCallback(async () => {
    if (isCopying) return;
    
    // For single tweak copy, we get the active tweak's code
    const activeTweak = activeTweakId ? selectedTweaks.get(activeTweakId) : null;
    // If no active tweak selected (or not in map), check if we can use the first selected
    const tweakToCopy = activeTweak || Array.from(selectedTweaks.values())[0];
    const codeToCopy = tweakToCopy?.code;

    if (!codeToCopy) {
      toast.error("No code to copy", { description: "Select a tweak with code first." });
      return;
    }
    
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(codeToCopy);
      toast.success("Code copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy code to clipboard");
      console.error("Copy error:", error);
    } finally {
      setIsCopying(false);
    }
  }, [selectedTweaks, activeTweakId, isCopying]);

  // Settings now come from TanStack Query/localStorage
  const {
    encodingUtf8,
    hideSensitive,
    downloadEachTweak,
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

    // Safety timeout: always clear loading state after 10 seconds maximum
    const safetyTimeout = setTimeout(() => {
      console.warn("Download operation timed out, clearing loading state");
      setIsLoading(false);
    }, 10000);

    try {
      await prepareDownload({
        tweaks: tweaksToDownload,
        user,
        userLoading,
      });

      // Download tweaks using the hook (will show warning dialog if enabled)
      try {
        handleDownloadWithWarning(
          tweaksToDownload,
          {
            encodingUtf8,
            hideSensitive,
            downloadEachTweak,
            customCode: null, // Custom code editing removed
            autoCreateRestorePoint: settings.autoCreateRestorePoint,
          },
          {
            onDownloadStart: () => {
              // Clear safety timeout since download started successfully
              clearTimeout(safetyTimeout);
              toast.success("Download started", {
                description: `Downloading ${tweaksToDownload.length} tweak${tweaksToDownload.length > 1 ? "s" : ""}`,
              });
              setTimeout(() => setIsLoading(false), 100);
            },
            onDownloadCancel: () => {
              // Clear safety timeout and loading state if user cancels
              clearTimeout(safetyTimeout);
              setIsLoading(false);
            },
          }
        );

        // Only clear loading if warning is disabled (download starts immediately)
        if (!settings.alwaysShowWarning) {
          clearTimeout(safetyTimeout);
          setTimeout(() => setIsLoading(false), 100);
        }
      } catch (downloadError) {
        clearTimeout(safetyTimeout);
        console.error("Error in download handler:", downloadError);
        toast.error("Error starting download", {
          description: "Please try again.",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Error while preparing download", {
        description:
          error instanceof Error ? error.message : "Please try again later...",
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
    settings.alwaysShowWarning,
    settings.autoCreateRestorePoint,
  ]);

  const [tweaksForFavorite, setTweaksForFavorite] = useState<Tweak[]>([]);

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

    setTweaksForFavorite(tweaksToSave);
    setFavoriteName(defaultName);
    setFavoriteDialogOpen(true);
  }, [selectedTweaks, user]);

  const handleRefresh = useCallback(async () => {
    try {
      if (user) {
        await refetchHistory();
        toast.success("History refreshed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to refresh");
    }
  }, [user, refetchHistory]);

  const selectedTweaksArray = Array.from(selectedTweaks.values());
  const selectedTweaksSet = useMemo(() => new Set(selectedTweaks.keys()), [selectedTweaks]);

  const infoTweak = useMemo(() => {
    if (activeTweakId && selectedTweaks.has(activeTweakId)) {
      return selectedTweaks.get(activeTweakId) || null;
    }
    return selectedTweaksArray[0] || null;
  }, [activeTweakId, selectedTweaks, selectedTweaksArray]);

  const [favoriteDialogOpen, setFavoriteDialogOpen] = useState(false);
  const [favoriteName, setFavoriteName] = useState("");
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  // Rename & Delete Dialog States
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRenameSelection = (id: string, currentName: string) => {
    setRenameId(id);
    setRenameValue(currentName);
    setRenameDialogOpen(true);
  };

  const handleDeleteSelection = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleSaveAsFavorite = (tweaks: Tweak[], defaultName: string) => {
    setTweaksForFavorite(tweaks);
    setFavoriteName(defaultName);
    setFavoriteDialogOpen(true);
  };

  return (
    <motion.div
      className="w-full px-4 py-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 h-[calc(100vh-8rem)] lg:flex-row overflow-hidden">
        {/* Left: Library Panel (VisualTree) */}
        <div className="flex w-full flex-col lg:w-1/2 h-full overflow-hidden">
          <VisualTree
            categories={categories}
            selectedTweaks={selectedTweaksSet}
            onTweakToggle={handleTweakToggle}
            historyTweakIds={historyTweakIds}
            favoriteTweakIds={favoriteTweakIds}
            userFavoriteSelections={userFavoriteSelections}
            userHistorySelections={userHistorySelections}
            onSelectAll={handleSelectAllTweaks}
            onClearSelection={handleClearAll}
            isLoading={(isHistoryLoading || isHistoryRefetching) && !!user}
            onRenameSelection={handleRenameSelection}
            onDeleteSelection={handleDeleteSelection}
            onSaveAsFavorite={handleSaveAsFavorite}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Right: Details Panel */}
        <div className="flex h-full w-full flex-1 flex-col gap-4 lg:w-1/2 overflow-hidden">
          <TweakDetailsPanel
            selectedTweaks={selectedTweaksArray}
            activeTweakId={activeTweakId}
            onTweakChange={setActiveTweakId}
            categories={categories}
            onReport={() => setReportDialogOpen(true)}
            onSelectAll={handleSelectAllTweaks}
            onDownload={handleDownloadWithSettings}
            onCopy={handleCopy}
            onSaveFavorite={handleQuickSaveToHistory}
            onSaveSingleFavorite={async (tweak) => {
              if (!user) {
                toast.error("Unable to save favorite", {
                  description: "You need to be signed in to save favorites.",
                });
                return;
              }
              try {
                setIsSavingFavorite(true);
                await saveTweakHistory({
                  tweaks: [tweak],
                  name: `Favorite: ${tweak.title}`,
                  isFavorite: true,
                });
                await queryClient.invalidateQueries({ queryKey: ["history-tweaks"] });
                toast.success("Saved to favorites", {
                  description: `${tweak.title} has been added to your favorites.`,
                });
              } catch (error) {
                console.error(error);
                toast.error("Failed to save favorite");
              } finally {
                setIsSavingFavorite(false);
              }
            }}
            isDownloading={isLoading}
            isCopying={isCopying}
            isSavingFavorite={isSavingFavorite}
          />
        </div>
      </div>

      <AlertDialog
        open={favoriteDialogOpen}
        onOpenChange={(open) => {
          setFavoriteDialogOpen(open);
          if (!open) {
             setIsSavingFavorite(false);
             // Clear temp tweaks when closing if not saving?
             // Not strictly necessary as it's overwritten on next open
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save selection as favorite</AlertDialogTitle>
            <AlertDialogDescription>
              Give this combination of tweaks a descriptive name.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-2 space-y-2">
            <Input
              autoFocus
              value={favoriteName}
              onChange={(e) => setFavoriteName(e.target.value)}
              placeholder="e.g. Gaming preset..."
            />
            {tweaksForFavorite.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Contains {tweaksForFavorite.length} tweak
                {tweaksForFavorite.length === 1 ? "" : "s"}.
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSavingFavorite}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              asChild
              disabled={isSavingFavorite || !favoriteName.trim()}
            >
              <Button
                onClick={async () => {
                  if (!user) return;
                  // Use the specific tweaks for favorite if set, otherwise fallback to selection (though we set it now always)
                  const tweaksToSave = tweaksForFavorite.length > 0 
                    ? tweaksForFavorite 
                    : Array.from(selectedTweaks.values());
                  
                  if (!tweaksToSave.length) return;
                  
                  try {
                    setIsSavingFavorite(true);
                    await saveTweakHistory({
                      tweaks: tweaksToSave,
                      name: favoriteName.trim(),
                      isFavorite: true,
                    });
                    await queryClient.invalidateQueries({ queryKey: ["history-tweaks"] });
                    toast.success("Saved as favorite");
                    setFavoriteDialogOpen(false);
                  } catch (error) {
                    console.error(error);
                    toast.error("Failed to save selection");
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

      {/* Rename Dialog */}
      <AlertDialog
        open={renameDialogOpen}
        onOpenChange={(open) => {
          setRenameDialogOpen(open);
          if (!open) {
            setRenameId(null);
            setRenameValue("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Selection</AlertDialogTitle>
            <AlertDialogDescription>Enter a new name for this selection.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-2">
             <Input
               value={renameValue}
               onChange={(e) => setRenameValue(e.target.value)}
               placeholder="Selection name"
               autoFocus
             />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRenaming}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild disabled={isRenaming || !renameValue.trim()}>
              <Button onClick={async () => {
                 if (!renameId) return;
                 try {
                   setIsRenaming(true);
                   await updateTweakHistory(renameId, { name: renameValue.trim() });
                   await queryClient.invalidateQueries({ queryKey: ["history-tweaks"] });
                   toast.success("Renamed successfully");
                   setRenameDialogOpen(false);
                 } catch (error) {
                   console.error(error);
                   toast.error("Failed to rename selection");
                 } finally {
                   setIsRenaming(false);
                 }
              }}>
                {isRenaming ? "Renaming..." : "Rename"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this selection? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <Button onClick={async () => {
                if (!deleteId) return;
                try {
                  setIsDeleting(true);
                  await deleteTweakHistory(deleteId);
                  await queryClient.invalidateQueries({ queryKey: ["history-tweaks"] });
                  toast.success("Selection deleted");
                  setDeleteDialogOpen(false);
                } catch (error) {
                  console.error(error);
                  toast.error("Failed to delete selection");
                } finally {
                  setIsDeleting(false);
                }
              }}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TweakReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        tweak={infoTweak}
      />

      <WarningDialog />
    </motion.div>
  );
}
