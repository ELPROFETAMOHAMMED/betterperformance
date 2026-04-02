"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import VisualTree from "./visual-tree";
import type { Tweak, TweakCategory } from "@/features/tweaks/types/tweak.types";
import { useUser } from "@/shared/hooks/use-user";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelection } from "@/features/tweaks/context/selection-context";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  ArrowPathIcon,
  FlagIcon,
  ArrowDownTrayIcon,
  ClipboardIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Badge } from "@/shared/components/ui/badge";
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
import { TweakFormDialog } from "./tweak-form-dialog";
import { CategoryFormDialog } from "./category-form-dialog";
import { DownloadWarningDialog } from "./download-warning-dialog";
import { SaveFavoriteDialog } from "./save-favorite-dialog";
import { useTweakHistoryFilters } from "@/features/tweaks/hooks/use-tweak-history-filters";
import { useTweakReportsFilters } from "@/features/tweaks/hooks/use-tweak-reports-filters";
import { useTweakDownload } from "@/features/tweaks/hooks/use-tweak-download";
import { useFavoriteDialog } from "@/features/tweaks/hooks/use-favorite-dialog";
import { useHistoryDialogs } from "@/features/tweaks/hooks/use-history-dialogs";

interface TweaksContentProps {
  categories: TweakCategory[];
  activeTab?: string;
}

export default function TweaksContent({ categories, activeTab = "library" }: TweaksContentProps) {
  const { user, loading: userLoading } = useUser();
  const isAdmin = user?.user_metadata?.role === "admin";
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get("q") || "";

  const {
    selectedTweaks,
    selectedTweaksArray,
    selectedTweaksSet,
    activeTweakId,
    setActiveTweakId,
    toggleTweak: handleTweakToggle,
    clearSelection: handleClearAll,
    selectAll: handleSelectAllTweaks,
    updateTweakCounters,
  } = useSelection();

  const {
    historyTweakIds,
    favoriteTweakIds,
    userFavoriteSelections,
    userHistorySelections,
    isLoading: isHistoryLoading,
    handleRefresh,
  } = useTweakHistoryFilters(!!user);

  const {
    reportedTweakIds,
    userReports,
    allReports,
    userReportDescriptions,
    allReportDescriptions,
    isLoading: isReportsLoading,
    refreshReports,
  } = useTweakReportsFilters(!!user);

  const {
    isLoading,
    isCopying,
    handleCopy,
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
    setIsSavingFavorite,
    openQuickSaveDialog,
    openSaveAsFavoriteDialog,
    handleConfirmSaveFavorite,
  } = useFavoriteDialog({ 
    selectedTweaks, 
    user,
    favoriteTweakIds,
    onCountersUpdated: updateTweakCounters,
  });

  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [tweakFormDialogOpen, setTweakFormDialogOpen] = useState(false);
  const [editingTweak, setEditingTweak] = useState<Tweak | null>(null);
  const [categoryFormDialogOpen, setCategoryFormDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TweakCategory | null>(null);
  const {
    renameDialogOpen,
    renameValue,
    isRenaming,
    setRenameDialogOpen,
    setRenameValue,
    openRenameDialog,
    confirmRename,
    deleteDialogOpen,
    isDeleting,
    setDeleteDialogOpen,
    openDeleteDialog,
    confirmDelete,
  } = useHistoryDialogs();

  const handleCreateTweak = () => {
    setEditingTweak(null);
    setTweakFormDialogOpen(true);
  };

  const handleEditTweak = (tweak: Tweak) => {
    setEditingTweak(tweak);
    setTweakFormDialogOpen(true);
  };

  const handleTweakFormSuccess = () => {
    router.refresh();
  };

  const handleEditCategory = (category: TweakCategory) => {
    setEditingCategory(category);
    setCategoryFormDialogOpen(true);
  };

  const handleCategoryFormSuccess = () => {
    router.refresh();
  };

  const activeIndex = activeTweakId ? selectedTweaksArray.findIndex(t => t.id === activeTweakId) : 0;
  const activeTweak = selectedTweaksArray[activeIndex] || selectedTweaksArray[0] || null;
  const activeCategory = activeTweak ? categories.find(c => c.id === activeTweak.category_id) : null;
  const infoTweak = activeTweak;

  const handleNextTweak = () => {
    if (activeIndex < selectedTweaksArray.length - 1) {
      setActiveTweakId(selectedTweaksArray[activeIndex + 1].id);
    }
  };

  const handlePrevTweak = () => {
    if (activeIndex > 0) {
      setActiveTweakId(selectedTweaksArray[activeIndex - 1].id);
    }
  };

  const globalIsLoading = isHistoryLoading || isReportsLoading;

  return (
    <motion.div
      className="w-full h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* UNIFIED HEADER */}
      <div className="flex items-center justify-between border-b border-border/20 py-2 w-full bg-background/50 backdrop-blur-xl shrink-0">
        {/* Left: Section Title (Explorer width) */}
        <div className="flex items-center lg:w-[32%] px-4 border-r border-border/20">
          <span className="text-sm font-bold tracking-tight uppercase opacity-50">Explorer</span>
        </div>

        {/* Right: Actions and Navigation */}
        <div className="flex-1 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {activeTweak ? (
              <>
                <Badge variant="outline" className="bg-background/50 font-normal shadow-sm">
                  {activeIndex + 1} / {selectedTweaksArray.length}
                </Badge>
                <div className="h-4 w-px bg-border/60 mx-1" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {activeCategory?.name || "Uncategorized"}
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground italic pl-2">No tweaks selected</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-normal">
              <TooltipProvider>
                {activeTweak && (
                  <div className="flex items-center gap-1 mr-2 pr-2 border-r border-border/40">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-yellow-500 hover:bg-yellow-500/10"
                          onClick={() => openSaveAsFavoriteDialog([activeTweak], `Favorite: ${activeTweak.title}`)}
                          disabled={isSavingFavorite}
                        >
                          <StarIconSolid className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Save to favorites</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleCopy(activeTweakId)}
                          disabled={isCopying}
                        >
                          <ClipboardIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy code</TooltipContent>
                    </Tooltip>

                    {isAdmin && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleEditTweak(activeTweak)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Tweak</TooltipContent>
                      </Tooltip>
                    )}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setReportDialogOpen(true)}
                        >
                          <FlagIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Report issue</TooltipContent>
                    </Tooltip>
                  </div>
                )}

                {activeTab === "library" && isAdmin && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={handleCreateTweak}>
                        <PlusIcon className="h-3.5 w-3.5" /> 
                        <span className="hidden sm:inline">Add Tweak</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Create new Tweak</TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 gap-1.5"
                      onClick={() => handleRefresh(!!user)}
                      disabled={globalIsLoading}
                    >
                      <ArrowPathIcon className={cn("h-3.5 w-3.5", globalIsLoading && "animate-spin")} />
                      <span>Refresh</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh data</TooltipContent>
                </Tooltip>

                {activeTweak && (
                  <Button
                    size="sm"
                    className="h-8 rounded-lg px-4 gap-2 transition-all hover:scale-105 active:scale-95 shadow-sm ml-1"
                    onClick={handleDownloadWithSettings}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </>
                    )}
                  </Button>
                )}
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-1 border-l border-border/40 pl-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={handlePrevTweak}
                disabled={!activeTweak || activeIndex <= 0}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={handleNextTweak}
                disabled={!activeTweak || activeIndex >= selectedTweaksArray.length - 1}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col lg:flex-row min-h-0 overflow-hidden bg-background/20 backdrop-blur-xl">
        {/* Left: Library Panel (VisualTree) */}
        <div className="flex w-full flex-col lg:w-[32%] shrink-0 h-full border-b lg:border-b-0 lg:border-r border-border/20 bg-muted/5">
          <VisualTree
            activeTab={activeTab}
            searchQuery={searchQuery}
            categories={categories}
            selectedTweaks={selectedTweaksSet}
            onTweakToggle={handleTweakToggle}
            historyTweakIds={historyTweakIds}
            favoriteTweakIds={favoriteTweakIds}
            reportedTweakIds={reportedTweakIds}
            userReports={userReports}
            allReports={allReports}
            userReportDescriptions={userReportDescriptions}
            allReportDescriptions={allReportDescriptions}
            userFavoriteSelections={userFavoriteSelections}
            userHistorySelections={userHistorySelections}
            onSelectAll={() => handleSelectAllTweaks(categories, isAdmin)}
            onClearSelection={handleClearAll}
            isLoading={isHistoryLoading || isReportsLoading}
            onRenameSelection={openRenameDialog}
            onDeleteSelection={openDeleteDialog}
            onSaveAsFavorite={openSaveAsFavoriteDialog}
            onRefresh={() => handleRefresh(!!user)}
            onCreateTweak={handleCreateTweak}
            onEditCategory={isAdmin ? handleEditCategory : undefined}
          />
        </div>

        {/* Right: Details Panel */}
        <div className="flex h-full w-full flex-1 flex-col bg-background/50 backdrop-blur-xl overflow-hidden">
          <TweakDetailsPanel
            selectedTweaks={selectedTweaksArray}
            activeTweakId={activeTweakId}
            categories={categories}
            userReports={userReports}
            allReports={allReports}
            isAdmin={isAdmin}
          />
        </div>
      </div>

      <SaveFavoriteDialog
        open={favoriteDialogOpen}
        onOpenChange={setFavoriteDialogOpen}
        favoriteName={favoriteName}
        onFavoriteNameChange={setFavoriteName}
        isSaving={isSavingFavorite}
        onConfirm={handleConfirmSaveFavorite}
        tweaksCount={tweaksForFavorite.length}
      />

      <AlertDialog
        open={renameDialogOpen}
        onOpenChange={(open) => {
          setRenameDialogOpen(open);
          if (!open) setRenameValue("");
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
              <Button onClick={confirmRename}>
                {isRenaming ? "Renaming..." : "Rename"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
              <Button onClick={confirmDelete}>
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
        onReportSubmitted={refreshReports}
      />

      <DownloadWarningDialog
        open={warningDialogOpen}
        onContinue={onWarningContinue}
        onCancel={onWarningCancel}
      />

      <TweakFormDialog
        open={tweakFormDialogOpen}
        onOpenChange={setTweakFormDialogOpen}
        categories={categories}
        tweak={editingTweak}
        onSuccess={handleTweakFormSuccess}
      />

      <CategoryFormDialog
        open={categoryFormDialogOpen}
        onOpenChange={setCategoryFormDialogOpen}
        category={editingCategory}
        onSuccess={handleCategoryFormSuccess}
      />
    </motion.div>
  );
}
