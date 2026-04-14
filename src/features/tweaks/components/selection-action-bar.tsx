"use client";

import { ArrowDownTrayIcon, StarIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

import { DownloadWarningDialog } from "@/features/tweaks/components/download-warning-dialog";
import { SaveFavoriteDialog } from "@/features/tweaks/components/save-favorite-dialog";
import { useSelection } from "@/features/tweaks/context/selection-context";
import { useFavoriteDialog } from "@/features/tweaks/hooks/use-favorite-dialog";
import { useTweakDownload } from "@/features/tweaks/hooks/use-tweak-download";
import { downloadWallpaperScript } from "@/features/wallpapers/services/download-wallpaper-script";
import { Button } from "@/shared/components/ui/button";
import { useUser } from "@/shared/hooks/use-user";
import { Trash2 } from "lucide-react";

function buildSelectionLabel(tweaksCount: number, wallpapersCount: number) {
  const parts: string[] = [];

  if (tweaksCount > 0 && wallpapersCount > 0) {
    parts.push(`${tweaksCount} tweak${tweaksCount === 1 ? "" : "s"}`);
    parts.push(`${wallpapersCount} wallpaper${wallpapersCount === 1 ? "" : "s"}`);
  }

  return parts.join(" · ");
}

export function SelectionActionBar() {
  const { user, loading: userLoading } = useUser();
  const {
    clearSelection,
    lastSelectedWallpaperId,
    selectedTweaks,
    selectedTweaksArray,
    selectedWallpapersArray,
    updateTweakCounters,
  } = useSelection();
  const tweaksCount = selectedTweaksArray.length;
  const wallpapersCount = selectedWallpapersArray.length;
  const totalCount = tweaksCount + wallpapersCount;

  const {
    isLoading: isDownloadingTweaks,
    handleDownloadWithSettings,
    warningDialogOpen,
    onWarningContinue,
    onWarningCancel,
  } = useTweakDownload({
    selectedTweaks,
    user,
    userLoading,
    onCountersUpdated: updateTweakCounters,
  });

  const {
    favoriteDialogOpen,
    favoriteName,
    isSavingFavorite,
    tweaksForFavorite,
    setFavoriteDialogOpen,
    setFavoriteName,
    openQuickSaveDialog,
    handleConfirmSaveFavorite,
  } = useFavoriteDialog({
    selectedTweaks,
    user,
    onCountersUpdated: updateTweakCounters,
  });

  const handleWallpaperDownload = async () => {
    if (wallpapersCount === 0) {
      return;
    }

    try {
      await downloadWallpaperScript({
        wallpaperIds: selectedWallpapersArray.map((wallpaper) => wallpaper.id),
        lastSelectedId:
          lastSelectedWallpaperId || selectedWallpapersArray[selectedWallpapersArray.length - 1]?.id || null,
      });
      toast.success(
        wallpapersCount === 1 ? "Wallpaper script downloaded" : "Wallpaper batch script downloaded"
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to download wallpaper script");
    }
  };

  return (
    <>
      <AnimatePresence>
        {totalCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/20 bg-background/80 shadow-[0_-4px_24px_rgba(0,0,0,0.15)] backdrop-blur-md"
          >
            <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {buildSelectionLabel(tweaksCount, wallpapersCount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {wallpapersCount > 0
                    ? "The last selected wallpaper will be applied automatically after the downloads finish."
                    : "Your selected tweaks are ready to export as a BetterPerformance script."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {tweaksCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={openQuickSaveDialog}
                    disabled={isSavingFavorite}
                  >
                    <StarIcon className="mr-2 h-4 w-4" />
                    Save tweaks
                  </Button>
                )}
                {tweaksCount > 0 && (
                  <Button
                    variant="default"
                    onClick={handleDownloadWithSettings}
                    disabled={isDownloadingTweaks}
                  >
                    <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                    Download tweaks
                  </Button>
                )}
                {wallpapersCount > 0 && (
                  <div className="flex items-center gap-x-2">
                    <Button variant="secondary" size="icon" className="" onClick={clearSelection}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={handleWallpaperDownload}>
                      <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                      Download selected
                    </Button>

                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DownloadWarningDialog
        open={warningDialogOpen}
        onContinue={onWarningContinue}
        onCancel={onWarningCancel}
      />
      <SaveFavoriteDialog
        open={favoriteDialogOpen}
        onOpenChange={setFavoriteDialogOpen}
        favoriteName={favoriteName}
        onFavoriteNameChange={setFavoriteName}
        isSaving={isSavingFavorite}
        onConfirm={handleConfirmSaveFavorite}
        tweaksCount={tweaksForFavorite.length || selectedTweaksArray.length}
      />
    </>
  );
}
