"use client";

import { useCallback, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import type { profile } from "@/features/auth/types/user.types";
import { saveTweakHistory } from "@/features/history-tweaks/utils/tweak-history-client";
import { useSelection } from "@/features/tweaks/context/selection-context";
import type { Tweak } from "@/features/tweaks/types/tweak.types";
import type { SelectedItem } from "@/shared/types/selection.types";

interface UseFavoriteDialogParams {
  selectedItems?: SelectedItem[];
  selectedTweaks?: Map<string, Tweak>;
  user: profile | null;
  onCountersUpdated?: (tweakIds: string[], type: "download" | "favorite") => void;
}

export function useFavoriteDialog({ selectedItems, user }: UseFavoriteDialogParams) {
  const { selectedItemsArray } = useSelection();
  const [favoriteDialogOpen, setFavoriteDialogOpen] = useState(false);
  const [favoriteName, setFavoriteName] = useState("");
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);
  const [itemsForFavorite, setItemsForFavorite] = useState<SelectedItem[]>([]);

  const itemsToSave = useMemo(
    () => (itemsForFavorite.length > 0 ? itemsForFavorite : selectedItems ?? selectedItemsArray),
    [itemsForFavorite, selectedItems, selectedItemsArray]
  );

  const openQuickSaveDialog = useCallback(() => {
    const currentSelection = selectedItems ?? selectedItemsArray;

    if (currentSelection.length === 0) {
      toast.error("Nothing to save", {
        description: "Select items first.",
      });
      return;
    }

    if (!user) {
      toast.error("Unable to save selection", {
        description: "You need to be signed in to save favorites.",
      });
      return;
    }

    const now = new Date();
    setItemsForFavorite(currentSelection);
    setFavoriteName(`Favorite selection - ${format(now, "dd/MM/yyyy HH:mm")}`);
    setFavoriteDialogOpen(true);
  }, [selectedItems, selectedItemsArray, user]);

  const openSaveAsFavoriteDialog = useCallback(
    (items: SelectedItem[], defaultName: string) => {
      if (items.length === 0) {
        return;
      }

      setItemsForFavorite(items);
      setFavoriteName(defaultName);
      setFavoriteDialogOpen(true);
    },
    []
  );

  const closeFavoriteDialog = useCallback(() => {
    setFavoriteDialogOpen(false);
    setIsSavingFavorite(false);
  }, []);

  const handleConfirmSaveFavorite = useCallback(async () => {
    if (!user) return;

    if (itemsToSave.length === 0 || !favoriteName.trim()) return;

    try {
      setIsSavingFavorite(true);

      await saveTweakHistory({
        tweaks: itemsToSave,
        name: favoriteName.trim(),
        isFavorite: true,
      });

      toast.success("Saved to favorites");
      closeFavoriteDialog();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save selection");
    } finally {
      setIsSavingFavorite(false);
    }
  }, [user, itemsToSave, favoriteName, closeFavoriteDialog]);

  return {
    favoriteDialogOpen,
    favoriteName,
    isSavingFavorite,
    itemsForFavorite,
    setFavoriteDialogOpen,
    setFavoriteName,
    setIsSavingFavorite,
    openQuickSaveDialog,
    openSaveAsFavoriteDialog,
    handleConfirmSaveFavorite,
  };
}
