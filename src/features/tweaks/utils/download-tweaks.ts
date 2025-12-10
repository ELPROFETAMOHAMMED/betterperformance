import type { Tweak } from "@/features/tweaks/types/tweak.types";

function cleanTweakCode(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n") // normalise line endings
    .replace(/\n{3,}/g, "\n\n") // collapse 3+ blank lines into 1 blank line
    .replace(/[ \t]+$/gm, "") // strip trailing spaces on each line
    .trim(); // remove leading/trailing blank lines
}

export function downloadTweaks({
  tweaks,
  options,
}: {
  tweaks: Tweak[];
  options: {
    encodingUtf8: boolean;
    hideSensitive: boolean;
    downloadEachTweak: boolean;
    customCode?: string | null;
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

  // If custom code is provided (edited script), always download a single file with that content
  if (options.customCode) {
    const cleaned = cleanTweakCode(options.customCode);
    makeBlobAndDownload(
      cleaned,
      "Betterperformance-Custom.ps1",
      options.encodingUtf8
    );
    return;
  }

  if (options.downloadEachTweak) {
    tweaks.forEach((tweak, i) => {
      const fileName = `${
        tweak.title.replace(/[^a-z0-9-_]/gi, "_") || `tweak-${i + 1}`
      }.ps1`;
      const cleaned = cleanTweakCode(tweak.code || "");
      makeBlobAndDownload(cleaned, fileName, options.encodingUtf8);
    });
  } else {
    // Combine all tweaks with at most a single blank line between them
    const cleanedBlocks = tweaks.map((t) => cleanTweakCode(t.code || ""));
    const combinedCode = cleanedBlocks.filter(Boolean).join("\n\n").trimEnd();
    makeBlobAndDownload(
      combinedCode,
      "Betterperformance-Tweaks-Selection.ps1",
      options.encodingUtf8
    );
  }
}



