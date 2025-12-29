/**
 * Service for handling tweak downloads with business logic
 */

import type { Tweak } from "@/features/tweaks/types/tweak.types";
import { cleanTweakCode, combineTweakBlocks } from "@/features/tweaks/utils/code-cleaner";
import {
  prependRestorePointCode,
  wrapWithCompletionNotification,
  wrapTweaksWithAtomicExecution,
} from "@/features/tweaks/services/powershell-generator";
import { downloadFile } from "@/features/tweaks/utils/file-downloader";

export interface DownloadTweaksOptions {
  encodingUtf8: boolean;
  hideSensitive: boolean;
  downloadEachTweak: boolean;
  customCode?: string | null;
  autoCreateRestorePoint?: boolean;
}

/**
 * Processes code by adding restore point (if enabled) and completion notification
 */
function processTweakCode(
  code: string,
  autoCreateRestorePoint: boolean
): string {
  // First, add restore point code if enabled
  const codeWithRestorePoint = prependRestorePointCode(
    code,
    autoCreateRestorePoint
  );

  // Then, wrap everything with completion notification (always shown)
  return wrapWithCompletionNotification(codeWithRestorePoint);
}

export function downloadTweaks({
  tweaks,
  options,
}: {
  tweaks: Tweak[];
  options: DownloadTweaksOptions;
}): void {
  // Default to true if not specified (matches default settings)
  const shouldCreateRestorePoint = options.autoCreateRestorePoint ?? true;

  // If custom code is provided (edited script), always download a single file
  if (options.customCode) {
    const cleaned = cleanTweakCode(options.customCode);
    const finalCode = processTweakCode(cleaned, shouldCreateRestorePoint);
    downloadFile(
      finalCode,
      "Betterperformance-Custom.ps1",
      options.encodingUtf8
    );
    return;
  }

  // Download each tweak as a separate file
  if (options.downloadEachTweak) {
    tweaks.forEach((tweak, i) => {
      const fileName = `${
        tweak.title.replace(/[^a-z0-9-_]/gi, "_") || `tweak-${i + 1}`
      }.ps1`;
      const cleaned = cleanTweakCode(tweak.code || "");
      const finalCode = processTweakCode(cleaned, shouldCreateRestorePoint);
      downloadFile(finalCode, fileName, options.encodingUtf8);
    });
    return;
  }

  // Combine all tweaks into a single file with atomic execution
  const tweaksWithCleanedCode = tweaks.map((t) => ({
    title: t.title,
    code: cleanTweakCode(t.code || ""),
  }));
  const combinedCode = wrapTweaksWithAtomicExecution(tweaksWithCleanedCode);
  const finalCode = processTweakCode(combinedCode, shouldCreateRestorePoint);
  downloadFile(
    finalCode,
    "Betterperformance-Tweaks-Selection.ps1",
    options.encodingUtf8
  );
}
