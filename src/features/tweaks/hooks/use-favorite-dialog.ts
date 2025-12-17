 "use client";

import { useCallback, useState } from "react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Tweak } from "@/features/tweaks/types/tweak.types";
import { saveTweakHistory } from "@/features/history-tweaks/utils/tweak-history-client";
import type { profile } from "@/features/auth/types/user.types";

interface UseFavoriteDialogParams {
  selectedTweaks: Map<string, Tweak>;
  user: profile | null;
  favoriteTweakIds?: Set<string>;
  onCountersUpdated?: (tweakIds: string[], type: "download" | "favorite") => void;
}

export function useFavoriteDialog({
  selectedTweaks,
  user,
  favoriteTweakIds,
  onCountersUpdated,
}: UseFavoriteDialogParams) {
  const queryClient = useQueryClient();
  const [favoriteDialogOpen, setFavoriteDialogOpen] = useState(false);
  const [favoriteName, setFavoriteName] = useState("");
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);
  const [tweaksForFavorite, setTweaksForFavorite] = useState<Tweak[]>([]);

  const openQuickSaveDialog = useCallback(() => {
    const tweaksToSave = Array.from(selectedTweaks.values());
    if (tweaksToSave.length === 0) return;

    if (!user) {
      toast.error("Unable to save selection", {
        description: "You need to be signed in to keep a history of tweaks.",
      });
      return;
    }

    const now = new Date();
    const defaultName = `Favorite selection - ${format(
      now,
      "dd/MM/yyyy HH:mm"
    )}`;

    setTweaksForFavorite(tweaksToSave);
    setFavoriteName(defaultName);
    setFavoriteDialogOpen(true);
  }, [selectedTweaks, user]);

  const openSaveAsFavoriteDialog = useCallback(
    (tweaks: Tweak[], defaultName: string) => {
      // If saving a single tweak, check if it's already in favorites
      if (tweaks.length === 1 && favoriteTweakIds) {
        const tweakId = tweaks[0]?.id;
        if (tweakId && favoriteTweakIds.has(tweakId)) {
          toast.error("Tweak already in favorites", {
            description: "This tweak is already saved in your favorites.",
          });
          return;
        }
      }
      
      // If multiple tweaks, allow saving (even if some tweaks might be in other favorites)
      setTweaksForFavorite(tweaks);
      setFavoriteName(defaultName);
      setFavoriteDialogOpen(true);
    },
    [favoriteTweakIds]
  );

  const closeFavoriteDialog = useCallback(() => {
    setFavoriteDialogOpen(false);
    setIsSavingFavorite(false);
  }, []);

  const handleConfirmSaveFavorite = useCallback(async () => {
    if (!user) return;

    const tweaksToSave =
      tweaksForFavorite.length > 0
        ? tweaksForFavorite
        : Array.from(selectedTweaks.values());

    if (!tweaksToSave.length || !favoriteName.trim()) return;

    try {
      setIsSavingFavorite(true);
      await saveTweakHistory({
        tweaks: tweaksToSave,
        name: favoriteName.trim(),
        isFavorite: true,
      });
      // Update counters locally after successful save
      const tweakIds = tweaksToSave.map((t) => t.id);
      onCountersUpdated?.(tweakIds, "favorite");
      await queryClient.invalidateQueries({ queryKey: ["history-tweaks"] });
      toast.success("Saved as favorite");
      closeFavoriteDialog();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save selection");
    } finally {
      setIsSavingFavorite(false);
    }
  }, [
    user,
    tweaksForFavorite,
    selectedTweaks,
    favoriteName,
    queryClient,
    closeFavoriteDialog,
    onCountersUpdated,
  ]);

  return {
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
  };
}


