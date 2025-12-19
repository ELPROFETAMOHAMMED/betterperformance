"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import VisualTree from "./visual-tree";
import type { Tweak, TweakCategory } from "@/features/tweaks/types/tweak.types";
import { useUser } from "@/shared/hooks/use-user";
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
        <div className="flex h-full w-full flex-1 flex-col gap-4 lg:w-1/2 overflow-hidden">
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
