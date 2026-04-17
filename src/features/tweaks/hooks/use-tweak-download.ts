 "use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useEditorSettings } from "@/features/settings/hooks/use-editor-settings";
import type { Tweak } from "@/features/tweaks/types/tweak.types";
import { prepareDownload } from "@/features/tweaks/services/prepare-download.service";
import type { profile } from "@/features/auth/types/user.types";
import type { SelectedItem } from "@/shared/types/selection.types";
import { downloadSelectionScript } from "@/features/tweaks/services/download-selection-script";

interface UseTweakDownloadParams {
  selectedItems?: SelectedItem[];
  selectedTweaks: Map<string, Tweak>;
  user: profile | null;
  userLoading: boolean;
  onCountersUpdated?: (tweakIds: string[], type: "download" | "favorite") => void;
}

export function useTweakDownload({
  selectedItems,
  selectedTweaks,
  user,
  userLoading,
  onCountersUpdated,
}: UseTweakDownloadParams) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const { settings } = useEditorSettings();

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
    const itemsToDownload = selectedItems ?? [];
    const tweaksToDownload = Array.from(selectedTweaks.values());

    if (itemsToDownload.length === 0) {
      toast.error("No tweaks selected", {
        description: "Please select at least one item to download.",
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
        selectedItems: itemsToDownload,
        tweaks: tweaksToDownload,
        user,
        userLoading,
      });

      downloadSelectionScript(itemsToDownload, {
        encodingUtf8: settings.encodingUtf8,
        autoCreateRestorePoint: settings.autoCreateRestorePoint,
      });

      clearTimeout(safetyTimeout);
      const tweakIds = tweaksToDownload.map((t) => t.id);
      onCountersUpdated?.(tweakIds, "download");
      toast.success("Download started", {
        description: `Downloading ${itemsToDownload.length} item${itemsToDownload.length > 1 ? "s" : ""}`,
      });
      setTimeout(() => setIsLoading(false), 100);
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
  }, [selectedItems, selectedTweaks, user, userLoading, settings, onCountersUpdated]);

  return {
    isLoading,
    isCopying,
    handleCopy,
    handleDownloadWithSettings,
  };
}


