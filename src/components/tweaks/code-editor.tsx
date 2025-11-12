"use client";

import React, { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { highlightCode, tokenClass } from "@/utils/helpers/code-editor";
import type { Tweak } from "@/types/tweak.types";
import { redactSensitive } from "@/lib/utils";

interface CodeEditorProps {
  selectedTweaks?: Tweak[];
  code: string;
  showLineNumbers?: boolean;
  enableTextColors?: boolean;
  hideSensitive?: boolean;
}

export default function CodeEditor({ selectedTweaks, code }: CodeEditorProps) {
  // defaults: show line numbers and colors
  const showLineNumbers =
    typeof (arguments[0] as any)?.showLineNumbers === "boolean"
      ? (arguments[0] as any).showLineNumbers
      : true;
  const enableTextColors =
    typeof (arguments[0] as any)?.enableTextColors === "boolean"
      ? (arguments[0] as any).enableTextColors
      : true;
  const hideSensitive =
    typeof (arguments[0] as any)?.hideSensitive === "boolean"
      ? (arguments[0] as any).hideSensitive
      : false;

  const normalizedCode = hideSensitive
    ? redactSensitive(code || "")
    : code || "";

  const { lines, highlighted } = useMemo(
    () => highlightCode(normalizedCode),
    [normalizedCode]
  );

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
