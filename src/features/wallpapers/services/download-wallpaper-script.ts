import type { WallpaperDownloadRequest } from "@/features/wallpapers/types/wallpaper.types";

function triggerDownload(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}

export async function downloadWallpaperScript(payload: WallpaperDownloadRequest) {
  const response = await fetch("/api/wallpapers/download", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || "Failed to generate wallpaper script");
  }

  const contentDisposition = response.headers.get("Content-Disposition") || "";
  const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/i);
  const fileName = fileNameMatch?.[1] || "download-wallpapers.ps1";
  const blob = await response.blob();

  triggerDownload(fileName, blob);
}
