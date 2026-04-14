import type {
  FavoriteItem,
  ToggleFavoriteInput,
  ToggleFavoriteResult,
} from "@/features/favorites/types/favorite.types";

export async function fetchFavorites(): Promise<FavoriteItem[]> {
  const response = await fetch("/api/favorites", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch favorites");
  }

  return response.json();
}

export async function toggleFavorite(input: ToggleFavoriteInput): Promise<ToggleFavoriteResult> {
  const response = await fetch("/api/favorites/toggle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to toggle favorite");
  }

  return response.json();
}
