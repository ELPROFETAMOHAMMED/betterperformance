"use client";

import React, { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getTweakCommentBlock,
  getCombinedTweaksCode,
} from "@/utils/helpers/tweak-comments";
import { highlightCode, tokenClass } from "@/utils/helpers/code-editor";
import type { Tweak } from "@/types/tweak.types";
import { redactSensitive } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "../ui/button";

interface CodeEditorProps {
  selectedTweaks?: Tweak[];
  code: string;
  showLineNumbers?: boolean;
  enableTextColors?: boolean;
  hideSensitive?: boolean;
}

export default function CodeEditor({
  selectedTweaks,
  code,
  showLineNumbers: showLineNumbersProp,
  enableTextColors: enableTextColorsProp,
  hideSensitive: hideSensitiveProp,
}: CodeEditorProps) {
  // defaults: show line numbers and colors
  const showLineNumbers =
    typeof showLineNumbersProp === "boolean" ? showLineNumbersProp : true;
  const enableTextColors =
    typeof enableTextColorsProp === "boolean" ? enableTextColorsProp : true;
  const hideSensitive =
    typeof hideSensitiveProp === "boolean" ? hideSensitiveProp : false;

  // Compose code with comments for each tweak
  let codeToShow = "";
  if (selectedTweaks && selectedTweaks.length > 0) {
    codeToShow = getCombinedTweaksCode(selectedTweaks, hideSensitive);
  } else {
    codeToShow = hideSensitive ? redactSensitive(code || "") : code || "";
  }

  const { lines, highlighted } = useMemo(
    () => highlightCode(codeToShow),
    [codeToShow]
  );

  return (
    <ScrollArea className="backdrop-blur-xl rounded-lg  max-w-full min-w-full max-h-full min-h-full h-full">
      <div className="p-3">
        {selectedTweaks && selectedTweaks.length > 0 && (
          <div className="mb-2 cursor-pointer text-xs flex items-center text-muted-foreground font-mono bg-background sticky top-0">
            {/* Show tweak title and icon if needed */}
            <span className="font-semibold text-foreground ">
              {selectedTweaks[0].title}
            </span>
            <Button
              variant={"link"}
              className="text-[11px] underline cursor-pointer"
              size={"sm"}
            >
              (show details)
            </Button>
          </div>
        )}

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
                <div className="whitespace-pre leading-5">
                  {highlighted.map((tokens, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className="w-0" />
                      <pre className="m-0 p-0 whitespace-pre font-mono break-words w-full">
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
                        {/* ensure empty lines still take height */}
                        {tokens.length === 0 && <span />}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
