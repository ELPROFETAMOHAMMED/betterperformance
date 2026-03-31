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
// Badge removed
import { 
  QueueListIcon, 
  TrashIcon, 
  XMarkIcon,
  ArrowDownTrayIcon,
  StarIcon
} from "@heroicons/react/24/outline";
import { useSelection } from "@/features/tweaks/context/selection-context";
import { useTweakDownload } from "@/features/tweaks/hooks/use-tweak-download";
import { useFavoriteDialog } from "@/features/tweaks/hooks/use-favorite-dialog";
import { useUser } from "@/shared/hooks/use-user";
// cn removed
import { motion, AnimatePresence } from "framer-motion";

interface SelectionSheetProps {
  children: React.ReactNode;
}

export function SelectionSheet({ children }: SelectionSheetProps) {
  const { user, loading: userLoading } = useUser();
  const { 
    selectedTweaksArray, 
    toggleTweak, 
    clearSelection, 
    updateTweakCounters 
  } = useSelection();

  const {
    isLoading: isDownloading,
    handleDownloadWithSettings,
    WarningDialog,
  } = useTweakDownload({
    selectedTweaks: new Map(selectedTweaksArray.map(t => [t.id, t])),
    user,
    userLoading,
    onCountersUpdated: updateTweakCounters,
  });

  const {
    openQuickSaveDialog,
    isSavingFavorite,
  } = useFavoriteDialog({
    selectedTweaks: new Map(selectedTweaksArray.map(t => [t.id, t])),
    user,
    onCountersUpdated: updateTweakCounters,
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg bg-background/80 backdrop-blur-3xl border-l border-border/40 p-0 flex flex-col shadow-2xl">
        <SheetHeader className="p-6 border-b border-border/20 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <QueueListIcon className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-xl font-bold tracking-tight">Current Selection</SheetTitle>
                <SheetDescription className="text-[11px] mt-0.5">
                  Manage your tweaks before exporting
                </SheetDescription>
              </div>
            </div>
            {selectedTweaksArray.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearSelection}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 gap-2 text-[10px] uppercase font-bold tracking-wider"
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
              {selectedTweaksArray.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50"
                >
                  <div className="p-4 rounded-full bg-muted/50">
                    <QueueListIcon className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Your selection is empty</p>
                    <p className="text-xs">Browse the library to add some tweaks</p>
                  </div>
                </motion.div>
              ) : (
                selectedTweaksArray.map((tweak) => {
                  const codeLength = tweak.code?.length || 0;
                  const lineCount = tweak.code?.split("\n").length || 0;
                  const sizeEst = (codeLength / 1024).toFixed(1);
                  const durationEst = Math.max(1, Math.round(0.5 + (lineCount / 40)));

                  return (
                    <motion.div
                      key={tweak.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="group flex flex-row items-start gap-3 p-3.5 rounded-xl border border-border/40 bg-muted/5 hover:bg-muted/10 hover:border-border/80 transition-all duration-200"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleTweak(tweak)}
                        className="h-8 w-8 shrink-0 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/20 hover:scale-110 transition-all rounded-lg bg-background/50 border border-border/10 mt-0.5"
                        title="Remove tweak"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>

                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex flex-col gap-1">
                          <h4 className="text-sm font-semibold truncate leading-tight group-hover:text-primary transition-colors" title={tweak.title}>
                            {tweak.title}
                          </h4>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase tracking-widest font-medium opacity-70">
                            <span className="flex items-center gap-1">
                              {sizeEst} KB
                            </span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="flex items-center gap-1">
                              ~{durationEst}s setup
                            </span>
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

        {selectedTweaksArray.length > 0 && (
          <SheetFooter className="p-6 border-t border-border/20 bg-muted/10 flex-col sm:flex-col gap-3">
            <div className="flex w-full gap-3">
              <Button 
                variant="outline" 
                className="flex-1 h-11 gap-2 rounded-xl group" 
                onClick={openQuickSaveDialog}
                disabled={isSavingFavorite}
              >
                <StarIcon className="h-4 w-4 group-hover:text-yellow-500 transition-colors" />
                <span>Save as Favorite</span>
              </Button>
              <Button 
                className="flex-1 h-11 gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20" 
                onClick={handleDownloadWithSettings}
                disabled={isDownloading}
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
            <p className="text-[10px] text-center text-muted-foreground px-4 italic leading-tight">
              Exported scripts are production-ready and optimized for Windows 10/11.
            </p>
          </SheetFooter>
        )}
      </SheetContent>
      <WarningDialog />
    </Sheet>
  );
}
