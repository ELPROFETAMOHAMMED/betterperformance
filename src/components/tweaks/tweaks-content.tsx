"use client";

import { useState, useCallback, useMemo } from "react";
import { useEditorSettings } from "@/hooks/useEditorSettings";
import VisualTree from "./visual-tree";
import CodeEditor from "./code-editor";
import EditorActions from "./editor-actions";
import { redactSensitive } from "@/lib/utils";
import { downloadTweaks } from "@/services/download-tweaks";
import {
  saveTweakHistory,
  incrementTweakDownloads,
} from "@/services/tweak-history";
import type { TweakCategory, Tweak } from "@/types/tweak.types";
import { useUser } from "@/hooks/use-user";
import { format } from "date-fns";

interface TweaksContentProps {
  categories: TweakCategory[];
}

export default function TweaksContent({ categories }: TweaksContentProps) {
  const { user } = useUser();
  const [selectedTweaks, setSelectedTweaks] = useState<Map<string, Tweak>>(
    new Map()
  );
  const {
    settings,
    setShowLineNumbers,
    setEnableTextColors,
    setEncodingUtf8,
    setHideSensitive,
    setDownloadEachTweak,
    setAlwaysShowWarning,
  } = useEditorSettings();

  const code = useMemo(() => {
    const selectedTweaksArray = Array.from(selectedTweaks.values());
    const combinedCode = selectedTweaksArray
      .map(
        (tweak) => tweak.code || `# ${tweak.title}\n# ${tweak.description}\n`
      )
      .join("\n\n");
    return (
      combinedCode ||
      "# Your PowerShell script will appear here\n# Select tweaks from the left panel to add them"
    );
  }, [selectedTweaks]);

  const handleTweakToggle = useCallback((tweak: Tweak) => {
    setSelectedTweaks((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(tweak.id)) {
        newMap.delete(tweak.id);
      } else {
        newMap.set(tweak.id, tweak);
      }
      return newMap;
    });
  }, []);

  const handleTweakRemove = useCallback((tweakId: string) => {
    setSelectedTweaks((prev) => {
      const newMap = new Map(prev);
      newMap.delete(tweakId);
      return newMap;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedTweaks(new Map());
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
  }, [code]);

  // Settings now come from TanStack Query/localStorage
  const {
    showLineNumbers,
    enableTextColors,
    encodingUtf8,
    hideSensitive,
    downloadEachTweak,
    alwaysShowWarning,
  } = settings;

  // enhanced download handler that respects settings (encoding, per-tweak, redaction)
  const handleDownloadWithSettings = useCallback(async () => {
    const tweaksToDownload = Array.from(selectedTweaks.values());
    if (tweaksToDownload.length === 0 || !user) return;

    // 1. Increment downloads for each tweak
    await incrementTweakDownloads(tweaksToDownload.map((t) => t.id));

    // 2. Save tweak history with formatted date as name
    const now = new Date();
    const formattedDate = format(now, "dd/MM/yyyy");
    const historyName = `Last Tweak Applied - ${formattedDate}`;
    await saveTweakHistory({
      userId: user.id,
      tweaks: tweaksToDownload,
      name: historyName,
    });

    // 3. Download tweaks
    downloadTweaks({
      tweaks: tweaksToDownload,
      options: {
        encodingUtf8,
        hideSensitive,
        downloadEachTweak,
      },
    });
  }, [selectedTweaks, encodingUtf8, hideSensitive, downloadEachTweak, user]);

  const selectedTweaksSet = new Set(selectedTweaks.keys());
  const selectedTweaksArray = Array.from(selectedTweaks.values());

  return (
    <div className="flex items-center justify-center w-full h-full">
      {/* Combined panel: header (EditorActions) + content (VisualTree | Editor) */}
      <div className="rounded-lg border border-secondary/10 overflow-visible bg-transparent">
        <EditorActions
          code={code}
          hasContent={selectedTweaks.size > 0}
          selectedTweaks={selectedTweaksArray}
          onRemoveTweak={handleTweakRemove}
          onCopy={handleCopy}
          onDownload={handleDownloadWithSettings}
          onClearAll={handleClearAll}
          showLineNumbers={showLineNumbers}
          setShowLineNumbers={setShowLineNumbers}
          enableTextColors={enableTextColors}
          setEnableTextColors={setEnableTextColors}
          encodingUtf8={encodingUtf8}
          setEncodingUtf8={setEncodingUtf8}
          hideSensitive={hideSensitive}
          setHideSensitive={setHideSensitive}
          downloadEachTweak={downloadEachTweak}
          setDownloadEachTweak={setDownloadEachTweak}
          alwaysShowWarning={alwaysShowWarning}
          setAlwaysShowWarning={setAlwaysShowWarning}
        />

        <div className="flex items-center p-4">
          {/* Left Side - Visual Tree */}
          <VisualTree
            categories={categories}
            selectedTweaks={selectedTweaksSet}
            onTweakToggle={handleTweakToggle}
          />

          {/* Separator */}
          <div className="h-[650px] w-px bg-secondary/50 mx-4" />

          {/* Right Side - Code Editor */}
          <div className="w-[750px] h-[650px]">
            <CodeEditor
              selectedTweaks={selectedTweaksArray}
              code={code}
              showLineNumbers={showLineNumbers}
              enableTextColors={enableTextColors}
              hideSensitive={hideSensitive}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
