"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { downloadTweaks } from "@/features/tweaks/services/generate-download.service";
import type { DownloadTweaksOptions } from "@/features/tweaks/services/generate-download.service";
import { useEditorSettings } from "@/features/settings/hooks/use-editor-settings";
import type { Tweak } from "@/features/tweaks/types/tweak.types";

type UseDownloadTweaksOptions = DownloadTweaksOptions;

interface UseDownloadTweaksCallbacks {
  onDownloadStart?: () => void;
  onDownloadCancel?: () => void;
}

export function useDownloadTweaks() {
  const { settings } = useEditorSettings();
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<{
    tweaks: Tweak[];
    options: UseDownloadTweaksOptions;
    callbacks?: UseDownloadTweaksCallbacks;
  } | null>(null);
  // Track if cancellation was explicitly handled to prevent double callback
  const cancelHandledRef = useRef(false);

  const performDownload = useCallback(
    (tweaks: Tweak[], options: UseDownloadTweaksOptions, callbacks?: UseDownloadTweaksCallbacks) => {
      downloadTweaks({
        tweaks,
        options,
      });
      // Notify that download actually started
      callbacks?.onDownloadStart?.();
    },
    []
  );

  const handleDownload = useCallback(
    (tweaks: Tweak[], options: UseDownloadTweaksOptions, callbacks?: UseDownloadTweaksCallbacks) => {
      if (tweaks.length === 0) {
        return;
      }

      if (settings.alwaysShowWarning) {
        cancelHandledRef.current = false; // Reset flag when starting new download
        setPendingDownload({ tweaks, options, callbacks });
        setShowWarningDialog(true);
      } else {
        performDownload(tweaks, options, callbacks);
      }
    },
    [settings.alwaysShowWarning, performDownload]
  );

  const handleWarningDialogContinue = useCallback(() => {
    if (pendingDownload) {
      cancelHandledRef.current = false; // Reset flag when continuing
      setShowWarningDialog(false);
      performDownload(pendingDownload.tweaks, pendingDownload.options, pendingDownload.callbacks);
      setPendingDownload(null);
    }
  }, [pendingDownload, performDownload]);

  const handleWarningDialogCancel = useCallback(() => {
    if (pendingDownload) {
      // Mark cancellation as handled to prevent cleanup effect from calling callback again
      cancelHandledRef.current = true;
      const callbacks = pendingDownload.callbacks;
      setShowWarningDialog(false);
      setPendingDownload(null);
      // Call callback after state is cleared
      callbacks?.onDownloadCancel?.();
    } else {
      setShowWarningDialog(false);
    }
  }, [pendingDownload]);

  // Cleanup effect to ensure callbacks are called if component unmounts or dialog is closed unexpectedly
  // Only call if cancellation wasn't already explicitly handled
  useEffect(() => {
    return () => {
      if (pendingDownload && showWarningDialog && !cancelHandledRef.current) {
        pendingDownload.callbacks?.onDownloadCancel?.();
      }
      // Reset flag when effect dependencies change (new pending download)
      cancelHandledRef.current = false;
    };
  }, [pendingDownload, showWarningDialog]);

  return {
    handleDownload,
    warningDialogOpen: showWarningDialog,
    onWarningContinue: handleWarningDialogContinue,
    onWarningCancel: handleWarningDialogCancel,
  };
}
