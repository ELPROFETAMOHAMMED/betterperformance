"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import VisualTree from "@/features/tweaks/components/visual-tree";
import { TweaksDialogs } from "@/features/tweaks/components/tweaks-dialogs";
import { TweaksHeader } from "@/features/tweaks/components/tweaks-header";
import { useActiveTweakNavigation } from "@/features/tweaks/hooks/use-active-tweak-navigation";
import { useAdminTweakActions } from "@/features/tweaks/hooks/use-admin-tweak-actions";
import type { TweakCategory } from "@/features/tweaks/types/tweak.types";
import { useUser } from "@/shared/hooks/use-user";
import { useSearchParams } from "next/navigation";
import { useSelection } from "@/features/tweaks/context/selection-context";
import { TweakDetailsPanel } from "@/features/tweaks/components/tweak-details-panel";
import { FavoritesPanel } from "@/features/tweaks/components/favorites-panel";
import { useFavorites } from "@/features/favorites/hooks/use-favorites";
import { WallpapersGrid } from "@/features/wallpapers/components/wallpapers-grid";
import { WallpapersHeader } from "@/features/wallpapers/components/wallpapers-header";
import type { WallpapersPageData } from "@/features/wallpapers/types/wallpaper.types";
import { useTweakHistoryFilters } from "@/features/tweaks/hooks/use-tweak-history-filters";
import { useTweakReportsFilters } from "@/features/tweaks/hooks/use-tweak-reports-filters";
import { useTweakDownload } from "@/features/tweaks/hooks/use-tweak-download";
import { useFavoriteDialog } from "@/features/tweaks/hooks/use-favorite-dialog";
import { useHistoryDialogs } from "@/features/tweaks/hooks/use-history-dialogs";
import type { SelectedItem } from "@/shared/types/selection.types";

interface TweaksContentProps {
  categories: TweakCategory[];
  activeTab?: string;
  wallpapersPageData?: WallpapersPageData | null;
}

export default function TweaksContent({
  categories,
  activeTab = "library",
  wallpapersPageData = null,
}: TweaksContentProps) {
  const { user, loading: userLoading } = useUser();
  const isAdmin = user?.user_metadata?.role === "admin";
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const {
    selectedItems,
    selectedItemsArray,
    selectedTweaks,
    selectedTweaksArray,
    selectedTweaksSet,
    activeTweakId,
    setActiveTweakId,
    toggleTweak: handleTweakToggle,
    toggleWallpaper: handleWallpaperToggle,
    clearSelection: handleClearAll,
    selectAll: handleSelectAllTweaks,
    updateTweakCounters,
  } = useSelection();

  const {
    historyTweakIds,
    userFavoriteSelections,
    userHistorySelections,
    isLoading: isHistoryLoading,
    handleRefresh,
  } = useTweakHistoryFilters(!!user);
  const { favoriteTweakIds } = useFavorites(!!user);

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
  } = useTweakDownload({
    selectedItems: selectedItemsArray,
    selectedTweaks,
    user,
    userLoading,
    onCountersUpdated: updateTweakCounters,
  });

  const {
    favoriteDialogOpen,
    favoriteName,
    isSavingFavorite,
    itemsForFavorite,
    setFavoriteDialogOpen,
    setFavoriteName,
    openSaveAsFavoriteDialog,
    handleConfirmSaveFavorite,
  } = useFavoriteDialog({
    selectedItems: selectedItemsArray,
    user,
    onCountersUpdated: updateTweakCounters,
  });

  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const {
    categoryFormDialogOpen,
    editingCategory,
    editingTweak,
    handleCategoryFormSuccess,
    handleCreateTweak,
    handleEditCategory,
    handleEditTweak,
    handleTweakFormSuccess,
    setCategoryFormDialogOpen,
    setTweakFormDialogOpen,
    tweakFormDialogOpen,
  } = useAdminTweakActions();
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
    editDialogOpen,
    editTweaks,
    isEditing,
    setEditDialogOpen,
    openEditDialog,
    confirmEdit,
  } = useHistoryDialogs();

  const {
    activeCategory,
    activeIndex,
    activeTweak,
    handleNextTweak,
    handlePrevTweak,
  } = useActiveTweakNavigation({
    activeTweakId,
    categories,
    selectedTweaks: selectedTweaksArray,
    setActiveTweakId,
  });
  const infoTweak = activeTweak;

  const globalIsLoading = isHistoryLoading || isReportsLoading;
  const isWallpapersTab = activeTab === "wallpapers";
  const handleItemToggle = (item: SelectedItem) => {
    if (item.type === "tweak") {
      handleTweakToggle(item.item);
      return;
    }

    handleWallpaperToggle(item.item);
  };

  return (
    <motion.div
      className="w-full h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <TweaksHeader
        activeCategory={activeCategory}
        visibility={activeTab === "library"}
        activeIndex={activeIndex}
        activeTab={activeTab}
        activeTweak={activeTweak}
        globalIsLoading={globalIsLoading}
        isAdmin={isAdmin}
        isCopying={isCopying}
        isDownloadLoading={isLoading}
        selectedTweaksCount={selectedTweaksArray.length}
        onCopy={() => handleCopy(activeTweakId)}
        onCreateTweak={handleCreateTweak}
        onDownload={handleDownloadWithSettings}
        onEditTweak={handleEditTweak}
        onNextTweak={handleNextTweak}
        onOpenReportDialog={() => setReportDialogOpen(true)}
        onPrevTweak={handlePrevTweak}
        onRefresh={() => handleRefresh(!!user)}
      />

      <div className="flex w-full flex-1 flex-col lg:flex-row min-h-0 overflow-hidden bg-background/20 backdrop-blur-xl">
        {isWallpapersTab && wallpapersPageData ? (
          <div className="flex h-full w-full flex-1 flex-col bg-background/50 backdrop-blur-xl overflow-hidden">
            <div className="h-full overflow-y-auto">
              <WallpapersHeader total={wallpapersPageData.total} />
              <WallpapersGrid pageData={wallpapersPageData} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex w-full flex-col lg:w-[32%] shrink-0 h-full border-b lg:border-b-0 lg:border-r border-border/20 bg-muted/5">
              <VisualTree
                activeTab={activeTab}
                searchQuery={searchQuery}
                categories={categories}
                selectedTweaks={selectedTweaksSet}
                onTweakToggle={handleTweakToggle}
                selectedItems={selectedItems}
                onItemToggle={handleItemToggle}
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
                onEditSelection={openEditDialog}
                onDeleteSelection={openDeleteDialog}
                onSaveAsFavorite={openSaveAsFavoriteDialog}
                onRefresh={() => handleRefresh(!!user)}
                onCreateTweak={handleCreateTweak}
                onEditCategory={isAdmin ? handleEditCategory : undefined}
              />
            </div>

            <div className="flex h-full w-full flex-1 flex-col bg-background/50 backdrop-blur-xl overflow-hidden">
              {activeTab === "favorites" ? (
                <FavoritesPanel />
              ) : (
                <TweakDetailsPanel
                  selectedTweaks={selectedTweaksArray}
                  activeTweakId={activeTweakId}
                  categories={categories}
                  userReports={userReports}
                  allReports={allReports}
                  isAdmin={isAdmin}
                />
              )}
            </div>
          </>
        )}
      </div>

      <TweaksDialogs
        categories={categories}
        categoryFormDialogOpen={categoryFormDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
        editingCategory={editingCategory}
        editingTweak={editingTweak}
        editDialogOpen={editDialogOpen}
        editTweaks={editTweaks}
        favoriteDialogOpen={favoriteDialogOpen}
        favoriteName={favoriteName}
        infoTweak={infoTweak}
        isDeletingSelection={isDeleting}
        isEditing={isEditing}
        isRenaming={isRenaming}
        isSavingFavorite={isSavingFavorite}
        renameDialogOpen={renameDialogOpen}
        renameValue={renameValue}
        reportDialogOpen={reportDialogOpen}
        tweaksForFavoriteCount={itemsForFavorite.length}
        tweakFormDialogOpen={tweakFormDialogOpen}
        onReportSubmitted={refreshReports}
        onCategoryFormOpenChange={setCategoryFormDialogOpen}
        onCategoryFormSuccess={handleCategoryFormSuccess}
        onConfirmDeleteSelection={confirmDelete}
        onConfirmSaveFavorite={handleConfirmSaveFavorite}
        onFavoriteDialogOpenChange={setFavoriteDialogOpen}
        onFavoriteNameChange={setFavoriteName}
        onEditDialogOpenChange={setEditDialogOpen}
        onSelectionEdit={confirmEdit}
        onRenameDialogOpenChange={setRenameDialogOpen}
        onRenameValueChange={setRenameValue}
        onReportDialogOpenChange={setReportDialogOpen}
        onSelectionDeleteDialogOpenChange={setDeleteDialogOpen}
        onSelectionRename={confirmRename}
        onTweakFormOpenChange={setTweakFormDialogOpen}
        onTweakFormSuccess={handleTweakFormSuccess}
      />
    </motion.div>
  );
}
