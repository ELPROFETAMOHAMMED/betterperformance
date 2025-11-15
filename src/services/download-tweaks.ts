import type { Tweak } from "@/types/tweak.types";

export function downloadTweaks({
  tweaks,
  options,
}: {
  tweaks: Tweak[];
  options: {
    encodingUtf8: boolean;
    hideSensitive: boolean;
    downloadEachTweak: boolean;
  };
}) {
  // Helper to trigger download in browser
  const makeBlobAndDownload = (
    content: string,
    filename: string,
    encodingUtf8: boolean
  ) => {
    const mime = encodingUtf8
      ? "text/plain;charset=utf-8"
      : "text/plain;charset=utf-16";
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (options.downloadEachTweak) {
    tweaks.forEach((tweak, i) => {
      const fileName = `${
        tweak.title.replace(/[^a-z0-9-_]/gi, "_") || `tweak-${i + 1}`
      }.ps1`;
      makeBlobAndDownload(tweak.code || "", fileName, options.encodingUtf8);
    });
  } else {
    // Combine all tweaks
    const combinedCode = tweaks.map((t) => t.code || "").join("\n\n");
    makeBlobAndDownload(combinedCode, "tweaks.ps1", options.encodingUtf8);
  }
}
