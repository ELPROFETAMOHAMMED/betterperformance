import type { Tweak } from "@/features/tweaks/types/tweak.types";

export async function saveTweakHistory({
  userId,
  tweaks,
  name,
  isFavorite,
}: {
  userId: string;
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

