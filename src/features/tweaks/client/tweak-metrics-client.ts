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
