"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetDescription
} from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { QueueListIcon, TrashIcon, ArrowDownTrayIcon, StarIcon } from "@heroicons/react/24/outline";
import { useSelection } from "@/features/tweaks/context/selection-context";
import { useTweakDownload } from "@/features/tweaks/hooks/use-tweak-download";
import { useFavoriteDialog } from "@/features/tweaks/hooks/use-favorite-dialog";
import { SaveFavoriteDialog } from "@/features/tweaks/components/save-favorite-dialog";
import { useUser } from "@/shared/hooks/use-user";
import { motion, AnimatePresence } from "framer-motion";
import type { SelectedItem } from "@/shared/types/selection.types";

interface SelectionSheetProps {
  children: React.ReactNode;
}

export function SelectionSheet({ children }: SelectionSheetProps) {
  const { user, loading: userLoading } = useUser();
  const {
    selectedItemsArray,
    selectedTweaksArray,
    toggleWallpaper,
    toggleTweak,
    clearSelection,
    updateTweakCounters
  } = useSelection();

  const {
    isLoading: isDownloading,
    handleDownloadWithSettings,
  } = useTweakDownload({
    selectedItems: selectedItemsArray,
    selectedTweaks: new Map(selectedTweaksArray.map(t => [t.id, t])),
    user,
    userLoading,
    onCountersUpdated: updateTweakCounters,
  });

  const {
    openQuickSaveDialog,
    isSavingFavorite,
    favoriteDialogOpen,
    favoriteName,
    setFavoriteDialogOpen,
    setFavoriteName,
    handleConfirmSaveFavorite,
    itemsForFavorite,
  } = useFavoriteDialog({
    selectedItems: selectedItemsArray,
    selectedTweaks: new Map(selectedTweaksArray.map(t => [t.id, t])),
    user,
    onCountersUpdated: updateTweakCounters,
  });

  const handleRemoveSelectedItem = (selectedItem: SelectedItem) => {
    if (selectedItem.type === "tweak") {
      toggleTweak(selectedItem.item);
      return;
    }

    toggleWallpaper(selectedItem.item);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col border-l border-border/40 bg-background/50 p-0 backdrop-blur-xl sm:max-w-lg">
        <SheetHeader className="p-6 border-b border-border/20 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-[var(--radius-md)] bg-primary/10 p-2 text-primary">
                <QueueListIcon className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-xl font-bold tracking-tight">Current Selection</SheetTitle>
                <SheetDescription className="mt-0.5 text-xs">
                  Manage your tweaks and wallpapers before exporting
                </SheetDescription>
              </div>
            </div>
            {selectedItemsArray.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="h-8 gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-destructive"
              >
                <TrashIcon className="h-3.5 w-3.5" />
                Clear All
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="py-6 space-y-2.5">
            <AnimatePresence mode="popLayout" initial={false}>
              {selectedItemsArray.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center space-y-4 py-20 text-center opacity-50"
                >
                  <div className="rounded-[var(--radius-md)] bg-muted/50 p-4">
                    <QueueListIcon className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Your selection is empty</p>
                    <p className="text-xs">Browse the library to add tweaks or wallpapers</p>
                  </div>
                </motion.div>
              ) : (
                selectedItemsArray.map((selectedItem) => {
                  const isTweak = selectedItem.type === "tweak";
                  const codeLength = isTweak ? selectedItem.item.code?.length || 0 : 0;
                  const lineCount = isTweak ? selectedItem.item.code?.split("\n").length || 0 : 0;
                  const sizeEst = (codeLength / 1024).toFixed(1);
                  const durationEst = Math.max(1, Math.round(0.5 + (lineCount / 40)));

                  return (
                    <motion.div
                      key={`${selectedItem.type}:${selectedItem.id}`}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="group flex flex-row items-start gap-3 rounded-[var(--radius-md)] border border-border/40 bg-muted/5 p-3.5 transition-all duration-200 hover:border-border/80 hover:bg-muted/10"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRemoveSelectedItem(selectedItem)}
                        title={`Remove ${selectedItem.type}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>

                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex flex-col gap-1">
                          <h4 className="text-sm font-semibold truncate leading-tight group-hover:text-primary transition-colors" title={selectedItem.item.title}>
                            {selectedItem.item.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-muted-foreground opacity-70">
                            <span>{selectedItem.type}</span>
                            {isTweak && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-border" />
                                <span className="flex items-center gap-1">{sizeEst} KB</span>
                                <span className="w-1 h-1 rounded-full bg-border" />
                                <span className="flex items-center gap-1">~{durationEst}s setup</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {selectedItemsArray.length > 0 && (
          <SheetFooter className="p-6 border-t border-border/20 bg-muted/10 flex-col sm:flex-col gap-3">
            <div className="flex w-full gap-3">
              <Button
                variant="outline"
                className="h-9 flex-1 gap-2"
                onClick={openQuickSaveDialog}
                disabled={isSavingFavorite}
              >
                <StarIcon className="h-4 w-4 group-hover:text-yellow-500 transition-colors" />
                <span>Save as Favorite</span>
              </Button>
              <Button
                variant="default"
                className="h-9 flex-1 gap-2"
                onClick={handleDownloadWithSettings}
                disabled={isDownloading || selectedItemsArray.length === 0}
              >
                {isDownloading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <>
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>Download (.ps1)</span>
                  </>
                )}
              </Button>
            </div>
            <p className="px-4 text-center text-xs italic leading-tight text-muted-foreground">
              Exported scripts are production-ready and optimized for Windows 10/11.
            </p>
          </SheetFooter>
        )}
      </SheetContent>
      <SaveFavoriteDialog
        open={favoriteDialogOpen}
        onOpenChange={setFavoriteDialogOpen}
        favoriteName={favoriteName}
        onFavoriteNameChange={setFavoriteName}
        isSaving={isSavingFavorite}
        onConfirm={handleConfirmSaveFavorite}
        tweaksCount={itemsForFavorite.length || selectedItemsArray.length}
      />
    </Sheet>
  );
}
