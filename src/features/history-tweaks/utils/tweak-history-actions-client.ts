import type { Tweak } from "@/features/tweaks/types/tweak.types";

export async function renameTweakHistoryEntry(id: string, name: string) {
  const response = await fetch(`/api/history/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to rename tweak history entry");
  }
}

export async function deleteTweakHistoryEntry(id: string) {
  const response = await fetch(`/api/history/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete tweak history entry");
  }
}

export async function updateTweakHistoryTweaks(id: string, tweaks: Tweak[]) {
  const response = await fetch(`/api/history/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tweaks }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update tweak history");
  }
}

export async function setTweakHistoryFavorite(
  id: string,
  isFavorite: boolean
) {
  const response = await fetch(`/api/history/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isFavorite }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update favorite status");
  }
}

