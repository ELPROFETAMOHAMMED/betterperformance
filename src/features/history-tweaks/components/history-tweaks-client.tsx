"use client";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import type { TweakHistoryEntry } from "@/features/tweaks/types/tweak.types";
import HistoryTweaksTable from "@/features/history-tweaks/components/history-tweaks-table";
import { Button } from "@/shared/components/ui/button";
import { Star, Loader2 } from "lucide-react";
import { useEditorSettings } from "@/features/settings/hooks/use-editor-settings";
import { useDownloadTweaks } from "@/features/tweaks/hooks/use-download-tweaks";
import { incrementTweakDownloads } from "@/features/history-tweaks/utils/tweak-history-client";
import {
  deleteTweakHistoryEntry,
  renameTweakHistoryEntry,
  setTweakHistoryFavorite,
} from "@/features/history-tweaks/utils/tweak-history-actions-client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/shared/components/ui/alert-dialog";
import { Input } from "@/shared/components/ui/input";

export default function HistoryTweaksClient({
  history,
}: {
  history: TweakHistoryEntry[];
}) {
  const [entries, setEntries] = useState<TweakHistoryEntry[]>(history);
  const { settings } = useEditorSettings();
  const { encodingUtf8, hideSensitive, downloadEachTweak, autoCreateRestorePoint } = settings;
  const { handleDownload: handleDownloadWithWarning, WarningDialog } = useDownloadTweaks();

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<TweakHistoryEntry | null>(
    null
  );
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TweakHistoryEntry | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Track loading states per entry ID for download, favorite actions
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [favoritingIds, setFavoritingIds] = useState<Set<string>>(new Set());

  const favorites = useMemo(
    () => entries.filter((entry) => entry.isFavorite),
    [entries]
  );

  const totalEntries = entries.length;
  const lastEntry = entries[0];

  const handleDownload = async (entry: TweakHistoryEntry) => {
    if (downloadingIds.has(entry.id)) return; // Prevent double-click
    
    try {
      if (!entry.tweaks || entry.tweaks.length === 0) {
        toast.error("No tweaks to download", {
          description: "This entry has no tweaks associated with it.",
        });
        return;
      }

      setDownloadingIds((prev) => new Set(prev).add(entry.id));

      await incrementTweakDownloads(entry.tweaks.map((t) => t.id));

      // Use the hook's handleDownload which will show warning dialog if needed
      // The callbacks ensure toast and loading state are only updated when download actually starts
      handleDownloadWithWarning(
        entry.tweaks,
        {
          encodingUtf8,
          hideSensitive,
          downloadEachTweak,
          autoCreateRestorePoint,
        },
        {
          onDownloadStart: () => {
            // Only show toast and clear loading when download actually starts
            toast.success("Download started", {
              description: `Re-downloading "${entry.name ?? "Last tweak"}"`,
            });
            setDownloadingIds((prev) => {
              const next = new Set(prev);
              next.delete(entry.id);
              return next;
            });
          },
          onDownloadCancel: () => {
            // Clear loading state if user cancels
            setDownloadingIds((prev) => {
              const next = new Set(prev);
              next.delete(entry.id);
              return next;
            });
          },
        }
      );

      // Only clear loading if warning is disabled (download starts immediately)
      // If warning is enabled, loading will be cleared in onDownloadStart or onDownloadCancel
      if (!settings.alwaysShowWarning) {
        setDownloadingIds((prev) => {
          const next = new Set(prev);
          next.delete(entry.id);
          return next;
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to download tweaks history", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(entry.id);
        return next;
      });
    }
  };

  const handleRename = (entry: TweakHistoryEntry) => {
    setRenameTarget(entry);
    setRenameValue(entry.name ?? "");
    setRenameOpen(true);
  };

  const handleConfirmRename = async () => {
    if (!renameTarget) return;
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === renameTarget.name) {
      setRenameOpen(false);
      setRenameTarget(null);
      return;
    }

    try {
      setIsRenaming(true);
      await renameTweakHistoryEntry(renameTarget.id, trimmed);
      setEntries((prev) =>
        prev.map((item) =>
          item.id === renameTarget.id ? { ...item, name: trimmed } : item
        )
      );
      toast.success("History renamed");
      setRenameOpen(false);
      setRenameTarget(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to rename history entry");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = (entry: TweakHistoryEntry) => {
    setDeleteTarget(entry);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;

    try {
      setIsDeleting(true);
      await deleteTweakHistoryEntry(deleteTarget.id);
      setEntries((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      toast.success("History entry deleted");
      setDeleteTarget(null);
      setDeleteOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete history entry", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModify = (entry: TweakHistoryEntry) => {
    // Persist the tweaks so the main tweaks page can pre-select them
    try {
      if (typeof window === "undefined") return;
      const tweakIds = entry.tweaks?.map((t) => t.id) ?? [];
      if (!tweakIds.length) return;

      window.localStorage.setItem(
        "bp:preselectedTweaksFromHistory",
        JSON.stringify(tweakIds)
      );
      toast.success("Loading tweaks into editor", {
        description: "You can adjust them on the main tweaks page.",
      });
      window.location.href = "/tweaks";
    } catch (error) {
      console.error(error);
      toast.error("Failed to load tweaks into editor");
    }
  };

  const handleFavorite = async (entry: TweakHistoryEntry) => {
    if (favoritingIds.has(entry.id)) return; // Prevent double-click
    
    const nextFavorite = !entry.isFavorite;

    try {
      setFavoritingIds((prev) => new Set(prev).add(entry.id));
      await setTweakHistoryFavorite(entry.id, nextFavorite);
      setEntries((prev) =>
        prev.map((item) =>
          item.id === entry.id ? { ...item, isFavorite: nextFavorite } : item
        )
      );
      toast.success(
        nextFavorite ? "Added to favorites" : "Removed from favorites"
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to update favorites", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setFavoritingIds((prev) => {
        const next = new Set(prev);
        next.delete(entry.id);
        return next;
      });
    }
  };

  return (
    <>
      <div className="w-full px-4 py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          >
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1 text-[11px] text-muted-foreground"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                <span>Your saved tweak selections</span>
              </motion.div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                  Tweak history
                </h1>
                <p className="text-xs text-muted-foreground md:text-sm">
                  Re-download, rename, favorite, or re-open any combination of
                  tweaks you&apos;ve applied in the past.
                </p>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex items-center gap-4 text-[11px] text-muted-foreground"
            >
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.16em]">
                  Saved sets
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {totalEntries}
                </span>
              </div>
              <div className="h-8 w-px bg-border/30" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.16em]">
                  Favorites
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {favorites.length}
                </span>
              </div>
              {lastEntry && (
                <>
                  <div className="h-8 w-px bg-border/30" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.16em]">
                      Last applied
                    </span>
                    <span className="text-xs text-foreground">
                      {format(new Date(lastEntry.createdAt), "dd MMM yyyy")}
                    </span>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Favorites strip - Modernized */}
          <AnimatePresence>
            {favorites.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <h2 className="text-sm font-semibold">Favorites</h2>
                  <span className="text-xs text-muted-foreground">
                    ({favorites.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {favorites.map((entry, index) => {
                    const isDownloading = downloadingIds.has(entry.id);
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.2,
                          delay: 0.3 + index * 0.05,
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-auto gap-2 px-3 py-2 text-xs hover:bg-muted/50 transition-colors"
                          onClick={() => handleDownload(entry)}
                          disabled={isDownloading}
                        >
                          {isDownloading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          )}
                          <span className="font-medium">
                            {entry.name ?? "Favorite tweaks"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            · {entry.tweaks?.length ?? 0}
                          </span>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <HistoryTweaksTable
              history={entries}
              onDownload={handleDownload}
              onRename={handleRename}
              onDelete={handleDelete}
              onModify={handleModify}
              onFavorite={handleFavorite}
              downloadingIds={downloadingIds}
              favoritingIds={favoritingIds}
            />
          </motion.div>
        </div>
      </div>

      <AlertDialog
        open={renameOpen}
        onOpenChange={(open) => {
          setRenameOpen(open);
          if (!open) {
            setRenameTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename tweak selection</AlertDialogTitle>
            <AlertDialogDescription>
              Give this combination of tweaks a descriptive name so you can
              recognize it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-2 space-y-2">
            <Input
              autoFocus
              placeholder="e.g. Gaming optimizations"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
            />
            {renameTarget && (
              <p className="text-xs text-muted-foreground">
                Contains {renameTarget.tweaks?.length ?? 0} tweak
                {((renameTarget.tweaks?.length ?? 0) || 0) === 1 ? "" : "s"}:
                {" "}
                {renameTarget.tweaks
                  ?.map((tweak) => tweak.title)
                  .slice(0, 3)
                  .join(", ")}
                {renameTarget.tweaks &&
                  renameTarget.tweaks.length > 3 &&
                  "…"}
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRenaming}>Cancel</AlertDialogCancel>
            <Button
              onClick={handleConfirmRename}
              disabled={isRenaming || !renameValue.trim()}
            >
              {isRenaming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save name"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tweak selection</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this saved selection from your
              history. The tweaks themselves will remain available in the main
              Tweaks page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteTarget && (
            <p className="text-xs text-muted-foreground mt-2">
              Entry:{" "}
              <span className="font-medium">
                {deleteTarget.name ?? "Unnamed selection"}
              </span>{" "}
              · {deleteTarget.tweaks?.length ?? 0} tweak
              {((deleteTarget.tweaks?.length ?? 0) || 0) === 1 ? "" : "s"}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete selection"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Warning Dialog - handled by useDownloadTweaks hook */}
      <WarningDialog />
    </>
  );
}



