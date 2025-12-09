"use client";

import { forwardRef } from "react";
import { tokenClass } from "@/features/tweaks/utils/code-editor";
import type { Token } from "@/features/tweaks/utils/code-editor";

interface CodePreviewProps {
  highlighted: Token[][];
  wrapCode: boolean;
  enableTextColors: boolean;
}

export const CodePreview = forwardRef<HTMLDivElement, CodePreviewProps>(
  function CodePreview({ highlighted, wrapCode, enableTextColors }, ref) {
    return (
      <div className="flex-1">
        <div className="overflow-auto" ref={ref}>
        <div className="leading-5">
          {highlighted.map((tokens, idx) => (
            <div key={idx} className="flex items-start  min-h-[1.25rem]">
              <div className="w-0" />
              <pre
                className={
                  wrapCode
                    ? "m-0 p-0 whitespace-pre-wrap break-words font-mono text-sm leading-5 w-full"
                    : "m-0 p-0 whitespace-pre font-mono text-sm leading-5 w-full"
                }
              >
                {tokens.map((t, ti) => (
                  <span
                    key={ti}
                    className={enableTextColors ? tokenClass(t.type) : undefined}
                  >
                    {t.value}
                  </span>
                ))}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
    );
  }
);

