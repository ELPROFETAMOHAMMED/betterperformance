"use client";

import { useMemo } from "react";

interface LineNumbersGutterProps {
  lineCount: number;
  enabled: boolean;
  lineNumbers?: number[]; // Optional: array of line numbers (for word wrap support)
}

export function LineNumbersGutter({ 
  lineCount, 
  enabled, 
  lineNumbers: providedLineNumbers 
}: LineNumbersGutterProps) {
  // Use provided line numbers if available, otherwise generate sequential numbers
  const lineNumbers = useMemo(() => {
    if (!enabled || lineCount === 0) return [];
    if (providedLineNumbers && providedLineNumbers.length > 0) {
      return providedLineNumbers;
    }
    return Array.from({ length: lineCount }, (_, i) => i + 1);
  }, [lineCount, enabled, providedLineNumbers]);

  if (!enabled || lineCount === 0) {
    return null;
  }

  return (
    <div className="select-none pr-4 text-right text-muted-foreground flex-shrink-0 w-14 min-h-full font-mono">
      <div className="leading-5">
        {lineNumbers.map((lineNum, index) => (
          <div
            key={`${lineNum}-${index}`}
            className="flex items-start min-h-[1.25rem] "
          >
            <div className="w-0" />
            <div className="w-full text-right text-sm leading-5 font-mono m-0 p-0">
              {lineNum}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
