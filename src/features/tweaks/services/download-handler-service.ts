/**
 * Service for handling download operations with user session and history management
 */

import type { profile } from "@/features/auth/types/user.types";
import type { Tweak } from "@/features/tweaks/types/tweak.types";
import {
  saveTweakHistory,
  incrementTweakDownloads,
} from "@/features/history-tweaks/utils/tweak-history-client";
import { format } from "date-fns";
import { withTimeout, createSafetyTimeout } from "@/shared/utils/async-helpers";

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
    // Try to get user from session if not available
    const currentUser = user;

    if ((userLoading || !currentUser) && typeof window !== "undefined") {
      try {
        const { createClient } = await import("@/shared/utils/supabase/client");
        const supabase = createClient();
        const sessionPromise = supabase.auth.getSession();
        await withTimeout(sessionPromise, 3000);
        // Note: We don't update currentUser here as it's read-only from the hook
        // The download will proceed regardless
      } catch (e) {
        console.warn("Could not fetch user session:", e);
        // Continue with download even if this fails
      }
    }

    // Increment downloads for each tweak (only if user is available, with timeout)
    if (currentUser) {
      try {
        const incrementPromise = incrementTweakDownloads(
          tweaks.map((t) => t.id)
        );
        await withTimeout(incrementPromise, 5000);
      } catch (error) {
        console.warn("Failed to increment download count:", error);
        // Continue with download even if this fails
      }
    }

    // Save tweak history with formatted date as name (only if user is available, with timeout)
    if (currentUser) {
      try {
        const now = new Date();
        const formattedDate = format(now, "dd/MM/yyyy");
        const historyName = `Last Tweak Applied - ${formattedDate}`;
        const savePromise = saveTweakHistory({
          tweaks,
          name: historyName,
          isFavorite: false,
        });
        await withTimeout(savePromise, 5000);
      } catch (error) {
        console.warn("Failed to save tweak history:", error);
        // Continue with download even if this fails
      }
    }

    onSuccess?.();
    return { user: currentUser, safetyTimeout };
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error(String(error)));
    return { user, safetyTimeout };
  }
}
