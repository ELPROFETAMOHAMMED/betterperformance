"use client";

import { CategoryFormDialog } from "@/features/tweaks/components/category-form-dialog";
import { EditSelectionDialog } from "@/features/tweaks/components/edit-selection-dialog";
import { SaveFavoriteDialog } from "@/features/tweaks/components/save-favorite-dialog";
import { TweakFormDialog } from "@/features/tweaks/components/tweak-form-dialog";
import { TweakReportDialog } from "@/features/tweaks/components/tweak-report-dialog";
import type { Tweak, TweakCategory } from "@/features/tweaks/types/tweak.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { SelectedItem } from "@/shared/types/selection.types";
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

type TweaksDialogsProps = {
  categories: TweakCategory[];
  deleteDialogOpen: boolean;
  editingCategory: TweakCategory | null;
  editingTweak: Tweak | null;
  editDialogOpen: boolean;
  editTweaks: SelectedItem[];
  favoriteDialogOpen: boolean;
  favoriteName: string;
  infoTweak: Tweak | null;
  isDeletingSelection: boolean;
  isEditing: boolean;
  isRenaming: boolean;
  isSavingFavorite: boolean;
  renameDialogOpen: boolean;
  renameValue: string;
  reportDialogOpen: boolean;
  tweaksForFavoriteCount: number;
  tweakFormDialogOpen: boolean;
  categoryFormDialogOpen: boolean;
  onReportSubmitted: () => Promise<void>;
  onCategoryFormOpenChange: (open: boolean) => void;
  onConfirmDeleteSelection: () => void;
  onConfirmSaveFavorite: () => void;
  onFavoriteDialogOpenChange: (open: boolean) => void;
  onFavoriteNameChange: (value: string) => void;
  onEditDialogOpenChange: (open: boolean) => void;
  onRenameDialogOpenChange: (open: boolean) => void;
  onRenameValueChange: (value: string) => void;
  onReportDialogOpenChange: (open: boolean) => void;
  onSelectionDeleteDialogOpenChange: (open: boolean) => void;
  onSelectionEdit: (items: SelectedItem[]) => void;
  onSelectionRename: () => void;
  onTweakFormOpenChange: (open: boolean) => void;
  onTweakFormSuccess: () => void;
  onCategoryFormSuccess: () => void;
};

export function TweaksDialogs({
  categories,
  categoryFormDialogOpen,
  deleteDialogOpen,
  editingCategory,
  editingTweak,
  editDialogOpen,
  editTweaks,
  favoriteDialogOpen,
  favoriteName,
  infoTweak,
  isDeletingSelection,
  isEditing,
  isRenaming,
  isSavingFavorite,
  renameDialogOpen,
  renameValue,
  reportDialogOpen,
  tweaksForFavoriteCount,
  tweakFormDialogOpen,
  onReportSubmitted,
  onCategoryFormOpenChange,
  onCategoryFormSuccess,
  onConfirmDeleteSelection,
  onConfirmSaveFavorite,
  onFavoriteDialogOpenChange,
  onFavoriteNameChange,
  onEditDialogOpenChange,
  onRenameDialogOpenChange,
  onRenameValueChange,
  onReportDialogOpenChange,
  onSelectionDeleteDialogOpenChange,
  onSelectionEdit,
  onSelectionRename,
  onTweakFormOpenChange,
  onTweakFormSuccess,
}: TweaksDialogsProps) {
  return (
    <>
      <SaveFavoriteDialog
        open={favoriteDialogOpen}
        onOpenChange={onFavoriteDialogOpenChange}
        favoriteName={favoriteName}
        onFavoriteNameChange={onFavoriteNameChange}
        isSaving={isSavingFavorite}
        onConfirm={onConfirmSaveFavorite}
        tweaksCount={tweaksForFavoriteCount}
      />

      <EditSelectionDialog
        open={editDialogOpen}
        items={editTweaks}
        isSaving={isEditing}
        onOpenChange={onEditDialogOpenChange}
        onConfirm={onSelectionEdit}
      />

      <AlertDialog
        open={renameDialogOpen}
        onOpenChange={(open) => {
          onRenameDialogOpenChange(open);
          if (!open) {
            onRenameValueChange("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Selection</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a new name for this selection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-2">
            <Input
              value={renameValue}
              onChange={(event) => onRenameValueChange(event.target.value)}
              placeholder="Selection name"
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRenaming}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild disabled={isRenaming || !renameValue.trim()}>
              <Button onClick={onSelectionRename}>
                {isRenaming ? "Renaming..." : "Rename"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={onSelectionDeleteDialogOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this selection? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingSelection}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              asChild
              disabled={isDeletingSelection}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Button onClick={onConfirmDeleteSelection}>
                {isDeletingSelection ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TweakReportDialog
        open={reportDialogOpen}
        onOpenChange={onReportDialogOpenChange}
        tweak={infoTweak}
        onReportSubmitted={onReportSubmitted}
      />

      <TweakFormDialog
        open={tweakFormDialogOpen}
        onOpenChange={onTweakFormOpenChange}
        categories={categories}
        tweak={editingTweak}
        onSuccess={onTweakFormSuccess}
      />

      <CategoryFormDialog
        open={categoryFormDialogOpen}
        onOpenChange={onCategoryFormOpenChange}
        category={editingCategory}
        onSuccess={onCategoryFormSuccess}
      />
    </>
  );
}
