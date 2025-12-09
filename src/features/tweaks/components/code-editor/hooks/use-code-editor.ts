"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { getCombinedTweaksCode } from "@/features/tweaks/utils/tweak-comments";
import { highlightCode } from "@/features/tweaks/utils/code-editor";
import { redactSensitive } from "@/shared/lib/utils";
import type { Tweak } from "@/features/tweaks/types/tweak.types";

interface UseCodeEditorProps {
  selectedTweaks?: Tweak[];
  code: string;
  hideSensitive: boolean;
  showComments: boolean;
  enableCodeEditing: boolean;
  onLineCountChange?: (count: number) => void;
}

export function useCodeEditor({
  selectedTweaks,
  code,
  hideSensitive,
  showComments,
  enableCodeEditing,
  onLineCountChange,
}: UseCodeEditorProps) {
  // Local state for toggling edit/preview mode - always start in preview mode
  const [isEditMode, setIsEditMode] = useState(false);

  // Compose code with comments for each tweak
  const codeToShow = useMemo(() => {
    if (selectedTweaks && selectedTweaks.length > 0) {
      return getCombinedTweaksCode(
        selectedTweaks,
        hideSensitive,
        Boolean(showComments)
      );
    }
    return hideSensitive ? redactSensitive(code || "") : code || "";
  }, [selectedTweaks, hideSensitive, showComments, code]);

  // State for edited code when in edit mode - initialize with codeToShow
  const [editedCode, setEditedCode] = useState(() => codeToShow);

  // If code editing is disabled, force preview mode
  useEffect(() => {
    if (!enableCodeEditing && isEditMode) {
      setIsEditMode(false);
    }
  }, [enableCodeEditing, isEditMode]);

  // Update edited code when codeToShow changes (when tweaks change)
  // But only if we're NOT in edit mode (to avoid overwriting user edits)
  useEffect(() => {
    if (!isEditMode) {
      setEditedCode(codeToShow);
    }
  }, [codeToShow, isEditMode]);

  // When toggling to edit mode, ensure editedCode is synced with current code
  const prevEditMode = useRef(isEditMode);
  useEffect(() => {
    const wasInPreview = !prevEditMode.current;
    const nowInEdit = isEditMode;
    
    if (nowInEdit && wasInPreview) {
      // Force sync when entering edit mode - this ensures we have the latest code
      // Use a small timeout to ensure codeToShow is up to date
      const timeoutId = setTimeout(() => {
        setEditedCode(codeToShow);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
    
    prevEditMode.current = isEditMode;
  }, [isEditMode, codeToShow]);

  // Use edited code when in edit mode, otherwise use the generated code
  const displayCode = isEditMode ? editedCode : codeToShow;

  // Generate highlighted code for preview mode
  const { lines, highlighted } = useMemo(() => {
    const result = highlightCode(displayCode);
    const displayLines: string[] = [];
    const displayHighlighted: typeof result.highlighted = [];

    result.lines.forEach((line, idx) => {
      const tokens = result.highlighted[idx];
      const hasContent = tokens.some((token) => token.value.trim().length > 0);
      if (hasContent) {
        displayLines.push(line);
        displayHighlighted.push(tokens);
      }
    });

    return {
      lines: displayLines,
      highlighted: displayHighlighted,
    };
  }, [displayCode]);

  // Generate highlighted code for edit mode (all lines, including empty)
  const highlightedEdit = useMemo(() => {
    const editResult = highlightCode(editedCode);
    return editResult.highlighted;
  }, [editedCode]);

  // Keep external line counter in sync - only if callback is provided
  // Use the same normalization logic as useLineCount for consistency
  useEffect(() => {
    if (typeof onLineCountChange === "function") {
      const codeToCount = isEditMode ? editedCode : codeToShow;
      // Normalize line endings: convert CRLF (\r\n) and CR (\r) to LF (\n)
      const normalized = codeToCount.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      // Split by normalized newlines and count
      const lineCount = normalized.split("\n").length;
      onLineCountChange(lineCount);
    }
  }, [isEditMode, editedCode, codeToShow, onLineCountChange]);

  return {
    isEditMode,
    setIsEditMode,
    codeToShow,
    editedCode,
    setEditedCode,
    displayCode,
    lines,
    highlighted,
    highlightedEdit,
  };
}

