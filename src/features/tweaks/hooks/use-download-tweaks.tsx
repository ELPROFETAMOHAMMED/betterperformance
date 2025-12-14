"use client";

import { useState, useCallback } from "react";
import { downloadTweaks } from "@/features/tweaks/utils/download-tweaks";
import { useEditorSettings } from "@/features/settings/hooks/use-editor-settings";
import type { Tweak } from "@/features/tweaks/types/tweak.types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

interface UseDownloadTweaksOptions {
  encodingUtf8: boolean;
  hideSensitive: boolean;
  downloadEachTweak: boolean;
  customCode?: string | null;
}

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
      setShowWarningDialog(false);
      performDownload(pendingDownload.tweaks, pendingDownload.options, pendingDownload.callbacks);
      setPendingDownload(null);
    }
  }, [pendingDownload, performDownload]);

  const handleWarningDialogCancel = useCallback(() => {
    if (pendingDownload) {
      pendingDownload.callbacks?.onDownloadCancel?.();
    }
    setShowWarningDialog(false);
    setPendingDownload(null);
  }, [pendingDownload]);

  const WarningDialog = () => (
    <AlertDialog open={showWarningDialog} onOpenChange={(open) => {
      if (!open) {
        // Dialog is being closed (user clicked outside or pressed ESC)
        handleWarningDialogCancel();
      }
    }}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Important Warning - Read Before Downloading</AlertDialogTitle>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3">
              <p className="font-semibold text-yellow-600 dark:text-yellow-500 mb-2">
                ⚠️ Experimental Feature - Use at Your Own Risk
              </p>
              <p>
                This platform is currently in experimental phase. We take no responsibility for any damage, data loss, or system instability that may occur from using these tweaks.
              </p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-2">
                Before downloading and applying tweaks, please ensure you:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Have reviewed and understand each tweak you&apos;re about to apply</li>
                <li>Have created a system restore point (strongly recommended)</li>
                <li>Are aware that some tweaks may require administrator privileges</li>
                <li>Have backed up all important data</li>
                <li>Understand that combining incompatible tweaks may break your system</li>
                <li>Know what you&apos;re doing or are willing to accept the risks</li>
              </ul>
            </div>

            <div className="rounded-md border border-red-500/50 bg-red-500/10 p-3">
              <p className="font-semibold text-red-600 dark:text-red-500 mb-1">
                ⚠️ Compatibility Warning
              </p>
              <p className="text-xs">
                Some tweaks may not be compatible with each other or with your specific system configuration. Applying incompatible tweaks together can cause system instability, crashes, or require a system restore. Always test tweaks individually when possible.
              </p>
            </div>

            <p className="text-xs text-muted-foreground italic">
              By clicking &quot;Continue Download&quot;, you acknowledge that you understand these risks and that BetterPerformance is not responsible for any consequences resulting from the use of these tweaks.
            </p>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleWarningDialogCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleWarningDialogContinue}>
            I Understand - Continue Download
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return {
    handleDownload,
    WarningDialog,
  };
}

