/**
 * Service for handling download operations with user session and history management
 */

import type { profile } from "@/features/auth/types/user.types";
import { ensureDownloadSession } from "@/features/tweaks/services/ensure-download-session";
import { saveDownloadHistory } from "@/features/tweaks/services/save-download-history";
import { trackTweakDownloads } from "@/features/tweaks/services/track-tweak-downloads";
import type { Tweak } from "@/features/tweaks/types/tweak.types";
import { createSafetyTimeout } from "@/shared/utils/async-helpers";

export interface PrepareDownloadOptions {
  tweaks: Tweak[];
  user: profile | null;
  userLoading: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface DownloadPreparationResult {
  user: profile | null;
  safetyTimeout: NodeJS.Timeout;
}

/**
 * Prepares download by handling user session, incrementing downloads, and saving history
 * Returns the user and a safety timeout that should be cleared when download starts
 */
export async function prepareDownload({
  tweaks,
  user,
  userLoading,
  onSuccess,
  onError,
}: PrepareDownloadOptions): Promise<DownloadPreparationResult> {
  // Safety timeout: will be cleared by the caller when download starts
  // The callback should be provided by the caller to handle timeout
  const safetyTimeout = createSafetyTimeout(() => {
    console.warn("Download operation timed out");
  }, 10000);

  try {
    const currentUser = user;

    await ensureDownloadSession(userLoading, Boolean(currentUser));
    await trackTweakDownloads(tweaks);
    await saveDownloadHistory(tweaks, currentUser);

    onSuccess?.();
    return { user: currentUser, safetyTimeout };
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error(String(error)));
    return { user, safetyTimeout };
  }
}
