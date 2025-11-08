"use client";

import { useState, useCallback, useMemo } from "react";
import VisualTree from "./visual-tree";
import CodeEditor from "./code-editor";
import EditorActions from "./editor-actions";
import type { TweakCategory, Tweak } from "@/types/tweak.types";

interface TweaksContentProps {
  categories: TweakCategory[];
}

export default function TweaksContent({ categories }: TweaksContentProps) {
  const [selectedTweaks, setSelectedTweaks] = useState<Map<string, Tweak>>(
    new Map()
  );

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

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tweaks.ps1";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [code]);

  const selectedTweaksSet = new Set(selectedTweaks.keys());
  const selectedTweaksArray = Array.from(selectedTweaks.values());

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Floating Actions */}
      <EditorActions
        code={code}
        hasContent={selectedTweaks.size > 0}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onClearAll={handleClearAll}
      />

      <div className="flex items-center">
        {/* Left Side - Visual Tree */}
        <VisualTree
          categories={categories}
          selectedTweaks={selectedTweaksSet}
          onTweakToggle={handleTweakToggle}
        />

        {/* Separator */}
        <div className="h-[650px] w-px bg-secondary/50" />

        {/* Right Side - Code Editor */}
        <div className="w-[750px] h-[650px]">
          <CodeEditor selectedTweaks={selectedTweaksArray} code={code} />
        </div>
      </div>
    </div>
  );
}
