"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchFavorites, toggleFavorite } from "@/features/favorites/services/favorites-client";
import type { ToggleFavoriteInput } from "@/features/favorites/types/favorite.types";

export function useFavorites(enabled: boolean = true) {
  const queryClient = useQueryClient();

  const favoritesQuery = useQuery({
    queryKey: ["favorites-items"],
    queryFn: fetchFavorites,
    enabled,
    refetchOnWindowFocus: false,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: (input: ToggleFavoriteInput) => toggleFavorite(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["favorites-items"] });
    },
  });

  const favorites = favoritesQuery.data ?? [];
  const favoriteTweakIds = new Set(
    favorites.flatMap((favorite) => {
      if (favorite.itemType !== "tweak") {
        return [];
      }

      return [favorite.tweak.id];
    })
  );
  const favoriteWallpaperIds = new Set(
    favorites.flatMap((favorite) => {
      if (favorite.itemType !== "wallpaper") {
        return [];
      }

      return [favorite.wallpaper.id];
    })
  );

  return {
    favorites,
    favoriteTweakIds,
    favoriteWallpaperIds,
    isLoading: favoritesQuery.isLoading || favoritesQuery.isRefetching,
    toggleFavorite: toggleFavoriteMutation.mutateAsync,
    isTogglingFavorite: toggleFavoriteMutation.isPending,
  };
}
