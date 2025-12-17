 "use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useEditorSettings } from "@/features/settings/hooks/use-editor-settings";
import type { Tweak } from "@/features/tweaks/types/tweak.types";
import { useDownloadTweaks } from "@/features/tweaks/hooks/use-download-tweaks";
import { prepareDownload } from "@/features/tweaks/services/download-handler-service";
import type { profile } from "@/features/auth/types/user.types";

interface UseTweakDownloadParams {
  selectedTweaks: Map<string, Tweak>;
  user: profile | null;
  userLoading: boolean;
}

export function useTweakDownload({
  selectedTweaks,
  user,
  userLoading,
}: UseTweakDownloadParams) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const { settings } = useEditorSettings();
  const { handleDownload: handleDownloadWithWarning, WarningDialog } =
    useDownloadTweaks();

  const handleCopy = useCallback(
    async (activeTweakId: string | null) => {
      if (isCopying) return;

      const activeTweak = activeTweakId
        ? selectedTweaks.get(activeTweakId)
        : null;
      const tweakToCopy =
        activeTweak || Array.from(selectedTweaks.values())[0];
      const codeToCopy = tweakToCopy?.code;

      if (!codeToCopy) {
        toast.error("No code to copy", {
          description: "Select a tweak with code first.",
        });
        return;
      }

      setIsCopying(true);
      try {
        await navigator.clipboard.writeText(codeToCopy);
        toast.success("Code copied to clipboard");
      } catch (error) {
        toast.error("Failed to copy code to clipboard");
        console.error("Copy error:", error);
      } finally {
        setIsCopying(false);
      }
    },
    [selectedTweaks, isCopying]
  );

  const handleDownloadWithSettings = useCallback(async () => {
    const tweaksToDownload = Array.from(selectedTweaks.values());

    if (tweaksToDownload.length === 0) {
      toast.error("No tweaks selected", {
        description: "Please select at least one tweak to download.",
      });
      return;
    }

    setIsLoading(true);

    const safetyTimeout = setTimeout(() => {
      console.warn("Download operation timed out, clearing loading state");
      setIsLoading(false);
    }, 10000);

    try {
      await prepareDownload({
        tweaks: tweaksToDownload,
        user,
        userLoading,
      });

      try {
        handleDownloadWithWarning(
          tweaksToDownload,
          {
            encodingUtf8: settings.encodingUtf8,
            hideSensitive: settings.hideSensitive,
            downloadEachTweak: settings.downloadEachTweak,
            customCode: null,
            autoCreateRestorePoint: settings.autoCreateRestorePoint,
          },
          {
            onDownloadStart: () => {
              clearTimeout(safetyTimeout);
              toast.success("Download started", {
                description: `Downloading ${
                  tweaksToDownload.length
                } tweak${tweaksToDownload.length > 1 ? "s" : ""}`,
              });
              setTimeout(() => setIsLoading(false), 100);
            },
            onDownloadCancel: () => {
              clearTimeout(safetyTimeout);
              setIsLoading(false);
            },
          }
        );

        if (!settings.alwaysShowWarning) {
          clearTimeout(safetyTimeout);
          setTimeout(() => setIsLoading(false), 100);
        }
      } catch (downloadError) {
        clearTimeout(safetyTimeout);
        console.error("Error in download handler:", downloadError);
        toast.error("Error starting download", {
          description: "Please try again.",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Error while preparing download", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again later...",
      });
      setIsLoading(false);
    }
  }, [selectedTweaks, user, userLoading, handleDownloadWithWarning, settings]);

  return {
    isLoading,
    isCopying,
    handleCopy,
    handleDownloadWithSettings,
    WarningDialog,
  };
}


