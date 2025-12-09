"use client";

import { useMemo } from "react";

interface UseLineCountProps {
  code: string;
  enabled: boolean;
}

export function useLineCount({ code, enabled }: UseLineCountProps) {
  // Calculate line count - robust calculation for PS1 files
  // Normalizes all line endings (CRLF, LF, CR) and counts accurately
  const lineCount = useMemo(() => {
    if (!enabled || !code) return 0;
    
    // Normalize line endings: convert CRLF (\r\n) and CR (\r) to LF (\n)
    const normalized = code.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    
    // Split by normalized newlines
    const lines = normalized.split("\n");
    
    // Count all lines including empty ones
    // This ensures we count exactly what's in the file, regardless of PowerShell syntax
    return lines.length;
  }, [code, enabled]);

  return lineCount;
}

