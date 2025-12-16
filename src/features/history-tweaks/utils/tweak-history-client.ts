import type { Tweak, TweakHistoryEntry } from "@/features/tweaks/types/tweak.types";

export async function fetchTweakHistory(): Promise<TweakHistoryEntry[]> {
  const response = await fetch("/api/history");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch tweak history");
  }
  return response.json();
}

export async function saveTweakHistory({
  tweaks,
  name,
  isFavorite,
}: {
  tweaks: Tweak[];
  name?: string;
  isFavorite?: boolean;
}) {
  const response = await fetch("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tweaks, name, isFavorite }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to save tweak history");
  }
}

export async function updateTweakHistory(
  id: string, 
  updates: { name?: string; isFavorite?: boolean; tweaks?: Tweak[] }
) {
  const response = await fetch(`/api/history/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update tweak history");
  }
}

export async function deleteTweakHistory(id: string) {
  const response = await fetch(`/api/history/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete tweak history");
  }
}

export async function incrementTweakDownloads(tweakIds: string[]) {
  const response = await fetch("/api/tweaks/increment-downloads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tweakIds }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to increment download counts");
  }
}
