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
  const favoriteSelectionIds = new Set(favorites.map((favorite) => favorite.id));

  return {
    favorites,
    favoriteSelectionIds,
    favoriteTweakIds: new Set<string>(),
    favoriteWallpaperIds: new Set<string>(),
    isLoading: favoritesQuery.isLoading || favoritesQuery.isRefetching,
    toggleFavorite: toggleFavoriteMutation.mutateAsync,
    isTogglingFavorite: toggleFavoriteMutation.isPending,
  };
}
