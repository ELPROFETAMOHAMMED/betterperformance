"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import VisualTree from "./visual-tree";
import type { Tweak, TweakCategory } from "@/features/tweaks/types/tweak.types";
import { useUser } from "@/shared/hooks/use-user";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
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
import { useSelectedTweaks } from "@/features/tweaks/hooks/use-selected-tweaks";
import { useTweakHistoryFilters } from "@/features/tweaks/hooks/use-tweak-history-filters";
import { useTweakReportsFilters } from "@/features/tweaks/hooks/use-tweak-reports-filters";
import { useTweakDownload } from "@/features/tweaks/hooks/use-tweak-download";
import { useFavoriteDialog } from "@/features/tweaks/hooks/use-favorite-dialog";
import { useHistoryDialogs } from "@/features/tweaks/hooks/use-history-dialogs";

interface TweaksContentProps {
  categories: TweakCategory[];
}

export default function TweaksContent({ categories }: TweaksContentProps) {
  const { user, loading: userLoading } = useUser();
  const isAdmin = user?.user_metadata?.role === "admin";
  const {
    selectedTweaks,
    selectedTweaksArray,
    selectedTweaksSet,
    activeTweakId,
    setActiveTweakId,
    infoTweak,
    handleTweakToggle,
    handleClearAll,
    handleSelectAllTweaks,
    updateTweakCounters,
  } = useSelectedTweaks({ categories, isAdmin });

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
    WarningDialog,
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
    // Refresh the page to get updated categories and tweaks
    window.location.reload();
  };

  const handleEditCategory = (category: TweakCategory) => {
    setEditingCategory(category);
    setCategoryFormDialogOpen(true);
  };

  const handleCategoryFormSuccess = () => {
    // Refresh the page to get updated categories and tweaks
    window.location.reload();
  };

  const [activeTab, setActiveTab] = useState("library");
  const [searchQuery, setSearchQuery] = useState("");

  const activeIndex = activeTweakId ? selectedTweaksArray.findIndex(t => t.id === activeTweakId) : 0;
  const activeTweak = selectedTweaksArray[activeIndex] || selectedTweaksArray[0] || null;
  const activeCategory = activeTweak ? categories.find(c => c.id === activeTweak.category_id) : null;

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
     className="w-full h-full "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* UNIFIED HEADER */}
      <div className="flex items-center justify-between border-b border-border/20 py-2 w-full bg-background/50 backdrop-blur-xl shrink-0">
        {/* Left: Search Bar (spanning Explorer width) */}
        <div className="flex items-center lg:w-[32%] px-4 border-r border-border/20">
          <div className="relative w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search tweaks..." 
              className="pl-9 h-9 bg-muted/50 border-border/40 shadow-sm focus-visible:ring-1 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
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
            <div className="flex items-center gap-1.5">
              {activeTab === "library" && isAdmin && (
                 <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={handleCreateTweak}>
                   <PlusIcon className="h-3.5 w-3.5" /> 
                   <span className="hidden sm:inline">Add Tweak</span>
                 </Button>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                className={cn("h-8 gap-1.5",)}
                onClick={() => handleRefresh(!!user)}
                disabled={globalIsLoading}
              >
                <ArrowPathIcon className={cn("h-3.5 w-3.5",  globalIsLoading && "animate-spin")} />
                <span>Refresh</span>
              </Button>
            </div>

            {/* Pagination Controls */}
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

      <div className="flex w-full  flex-1 flex-col lg:flex-row h-[calc(100vh-8rem)] mx-auto bg-background/20 backdrop-blur-xl">
        {/* Left: Library Panel (VisualTree) */}
        <div className="flex w-full flex-col lg:w-[32%] shrink-0 h-full border-b lg:border-b-0 lg:border-r border-border/20 bg-muted/5">
          <VisualTree
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchQuery={searchQuery}
            categories={categories}
            selectedTweaks={selectedTweaksSet}
            onTweakToggle={handleTweakToggle}
            historyTweakIds={historyTweakIds}
            favoriteTweakIds={favoriteTweakIds}
            reportedTweakIds={reportedTweakIds}
            userReportDescriptions={userReportDescriptions}
            allReportDescriptions={allReportDescriptions}
            userFavoriteSelections={userFavoriteSelections}
            userHistorySelections={userHistorySelections}
            onSelectAll={handleSelectAllTweaks}
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
        <div className="flex h-full w-full flex-1 flex-col bg-background/50 backdrop-blur-xl">
          <TweakDetailsPanel
            selectedTweaks={selectedTweaksArray}
            activeTweakId={activeTweakId}
            onTweakChange={setActiveTweakId}
            categories={categories}
            onReport={() => setReportDialogOpen(true)}
            onDownload={handleDownloadWithSettings}
            onCopy={() => handleCopy(activeTweakId)}
            onSaveFavorite={openQuickSaveDialog}
            onSaveSingleFavorite={(tweak: Tweak): void => {
              openSaveAsFavoriteDialog(
                [tweak],
                `Favorite: ${tweak.title}`
              );
            }}
            isDownloading={isLoading}
            isCopying={isCopying}
            isSavingFavorite={isSavingFavorite}
            onEditTweak={handleEditTweak}
          />
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
              <Button onClick={handleConfirmSaveFavorite}>
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
              <Button onClick={confirmRename}>
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

      <WarningDialog />

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
