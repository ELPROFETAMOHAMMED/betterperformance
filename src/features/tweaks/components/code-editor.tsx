"use client";

import React, { useMemo } from "react";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  getTweakCommentBlock,
  getCombinedTweaksCode,
} from "@/features/tweaks/utils/tweak-comments";
import { highlightCode, tokenClass } from "@/features/tweaks/utils/code-editor";
import type { Tweak } from "@/features/tweaks/types/tweak.types";
import { redactSensitive } from "@/shared/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Button } from "@/shared/components/ui/button";

interface CodeEditorProps {
  selectedTweaks?: Tweak[];
  code: string;
  showLineNumbers?: boolean;
  enableTextColors?: boolean;
  hideSensitive?: boolean;
  wrapCode?: boolean;
  onLineCountChange?: (count: number) => void;
  showComments?: boolean;
}

export default function CodeEditor({
  selectedTweaks,
  code,
  showLineNumbers: showLineNumbersProp,
  enableTextColors: enableTextColorsProp,
  hideSensitive: hideSensitiveProp,
  wrapCode: wrapCodeProp,
  onLineCountChange,
  showComments,
}: CodeEditorProps) {
  // defaults: show line numbers and colors
  const showLineNumbers =
    typeof showLineNumbersProp === "boolean" ? showLineNumbersProp : true;
  const enableTextColors =
    typeof enableTextColorsProp === "boolean" ? enableTextColorsProp : true;
  const hideSensitive =
    typeof hideSensitiveProp === "boolean" ? hideSensitiveProp : false;
  const wrapCode = typeof wrapCodeProp === "boolean" ? wrapCodeProp : true;

  // Compose code with comments for each tweak
  let codeToShow = "";
  if (selectedTweaks && selectedTweaks.length > 0) {
    codeToShow = getCombinedTweaksCode(
      selectedTweaks,
      hideSensitive,
      Boolean(showComments)
    );
  } else {
    codeToShow = hideSensitive ? redactSensitive(code || "") : code || "";
  }
  
  // Remove all empty lines from the code string
  codeToShow = codeToShow
    .split("\n")
    .filter(line => line.trim().length > 0)
    .join("\n");

  const { lines, highlighted } = useMemo(() => {
    const result = highlightCode(codeToShow);
    // Filter out empty lines (lines with no tokens or only whitespace)
    const nonEmptyLines: string[] = [];
    const nonEmptyHighlighted: typeof highlighted = [];
    
    result.lines.forEach((line, idx) => {
      const tokens = result.highlighted[idx];
      // Check if line has actual content (not just whitespace)
      const hasContent = tokens.some(token => token.value.trim().length > 0);
      if (hasContent) {
        nonEmptyLines.push(line);
        nonEmptyHighlighted.push(tokens);
      }
    });
    
    return {
      lines: nonEmptyLines,
      highlighted: nonEmptyHighlighted,
    };
  }, [codeToShow]);

  // Keep external line counter in sync with the actual rendered content
  React.useEffect(() => {
    if (typeof onLineCountChange === "function") {
      onLineCountChange(lines.length);
    }
  }, [lines.length, onLineCountChange]);

  return (
    <ScrollArea className="backdrop-blur-xl rounded-lg  max-w-full min-w-full max-h-full min-h-full h-full">
      <div className="p-3">
        <div className="rounded-lg overflow-hidden bg-transparent">
          {/* Editor container: two columns inside the same scroll area so they scroll together */}
          <div className="flex font-mono text-sm text-foreground">
            {/* Gutter */}
            {showLineNumbers && (
              <div
                className="select-none pr-4 text-right text-muted-foreground"
                style={{ width: 56 }}
              >
                {lines.map((_, i) => (
                  <div
                    key={i}
                    className="px-1 py-0.5 leading-5 text-xs text-muted-foreground"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            )}

            {/* Code area */}
            <div className="flex-1">
              <div className="overflow-auto">
                {/* Use a <pre> per line to preserve spacing but render spans for tokens */}
                <div className="leading-5">
                  {highlighted.map((tokens, idx) => {
                    // Skip rendering if line is empty (no tokens or only whitespace)
                    const hasContent = tokens.some(token => token.value.trim().length > 0);
                    if (!hasContent) return null;
                    
                    return (
                      <div key={idx} className="flex items-start">
                        <div className="w-0" />
                        <pre
                          className={
                            wrapCode
                              ? "m-0 p-0 whitespace-pre-wrap break-words font-mono w-full"
                              : "m-0 p-0 whitespace-pre font-mono w-full"
                          }
                        >
                          {tokens.map((t, ti) => (
                            <span
                              key={ti}
                              className={
                                enableTextColors ? tokenClass(t.type) : undefined
                              }
                            >
                              {t.value}
                            </span>
                          ))}
                        </pre>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}



