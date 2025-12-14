"use client";

import { useState, useEffect, useMemo, useRef, useTransition } from "react";
import { getCombinedTweaksCode } from "@/features/tweaks/utils/tweak-comments";
import { highlightCode, highlightCodeAsync } from "@/features/tweaks/utils/code-editor";
import type { Token } from "@/features/tweaks/utils/code-editor";
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
  // Track loading state for heavy operations
  const [isPending, startTransition] = useTransition();

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
  // Track the original code when entering edit mode to detect changes
  const [originalCode, setOriginalCode] = useState(() => codeToShow);
  // Track saved code (code that should be shown in preview mode after saving)
  const [savedCode, setSavedCode] = useState<string | null>(null);

  // Check if there are unsaved changes
  const hasUnsavedChanges = editedCode !== originalCode;

  // If code editing is disabled, force preview mode
  useEffect(() => {
    if (!enableCodeEditing && isEditMode) {
      setIsEditMode(false);
    }
  }, [enableCodeEditing, isEditMode]);

  // Track previous codeToShow to detect actual changes (not just mode switches)
  const prevCodeToShowRef = useRef(codeToShow);
  
  // Update edited code when codeToShow changes (when tweaks change)
  // But only if we're NOT in edit mode (to avoid overwriting user edits)
  // Only reset savedCode when codeToShow actually changes, not when switching modes
  useEffect(() => {
    const codeToShowChanged = prevCodeToShowRef.current !== codeToShow;
    
    if (codeToShowChanged) {
      prevCodeToShowRef.current = codeToShow;
      
      if (!isEditMode) {
        // If codeToShow changes externally (e.g., different tweaks selected),
        // reset everything including saved code
        setEditedCode(codeToShow);
        setOriginalCode(codeToShow);
        setSavedCode(null);
      }
      // If in edit mode and codeToShow changes, we don't update to avoid overwriting user edits
    }
  }, [codeToShow, isEditMode]);

  // When toggling to edit mode, ensure editedCode is synced with current code
  const prevEditMode = useRef(isEditMode);
  useEffect(() => {
    const wasInPreview = !prevEditMode.current;
    const nowInEdit = isEditMode;
    
    if (nowInEdit && wasInPreview) {
      // When entering edit mode, use savedCode if it exists, otherwise use codeToShow
      // Use a small timeout to ensure codeToShow is up to date
      const timeoutId = setTimeout(() => {
        const codeToEdit = savedCode ?? codeToShow;
        setEditedCode(codeToEdit);
        setOriginalCode(codeToEdit);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
    
    prevEditMode.current = isEditMode;
  }, [isEditMode, codeToShow, savedCode]);

  // Save changes: save editedCode as the new saved code
  const saveChanges = () => {
    setSavedCode(editedCode);
    setOriginalCode(editedCode);
  };

  // Discard changes: revert editedCode to originalCode
  const discardChanges = () => {
    setEditedCode(originalCode);
  };

  // Use edited code when in edit mode
  // In preview mode, use savedCode if it exists (user has saved changes), otherwise use codeToShow
  const displayCode = isEditMode ? editedCode : (savedCode ?? codeToShow);

  // Generate highlighted code for preview mode (with transition for heavy operations)
  const [highlighted, setHighlighted] = useState<Token[][]>(() => {
    // Initialize with empty to show loading state initially
    return [];
  });
  const [lines, setLines] = useState<string[]>([]);
  
  useEffect(() => {
    let cancelled = false;
    
    // Set loading state immediately
    setHighlighted([]);
    setLines([]);
    
    // Use async highlighting for large code blocks to prevent UI blocking
    const processHighlighting = async () => {
      try {
        // For small code blocks (< 200 lines), use synchronous highlighting
        // For larger blocks, use async to prevent blocking
        const lineCount = displayCode.split(/\r\n|\r|\n/).length;
        const useAsync = lineCount > 200;
        
        let result;
        if (useAsync) {
          result = await highlightCodeAsync(displayCode);
        } else {
          // Use startTransition for small blocks to keep UI responsive
          result = highlightCode(displayCode);
        }
        
        if (cancelled) return;
        
        const displayLines: string[] = [];
        const displayHighlighted: typeof result.highlighted = [];

        // Process lines in chunks to avoid blocking
        for (let idx = 0; idx < result.lines.length; idx++) {
          const tokens = result.highlighted[idx];
          const hasContent = tokens.some((token) => token.value.trim().length > 0);
          if (hasContent) {
            displayLines.push(result.lines[idx]);
            displayHighlighted.push(tokens);
          }
        }

        if (!cancelled) {
          startTransition(() => {
            setLines(displayLines);
            setHighlighted(displayHighlighted);
          });
        }
      } catch (error) {
        console.error("Error highlighting code:", error);
        if (!cancelled) {
          // Fallback to synchronous highlighting on error
          const result = highlightCode(displayCode);
          const displayLines: string[] = [];
          const displayHighlighted: typeof result.highlighted = [];

          for (let idx = 0; idx < result.lines.length; idx++) {
            const tokens = result.highlighted[idx];
            const hasContent = tokens.some((token) => token.value.trim().length > 0);
            if (hasContent) {
              displayLines.push(result.lines[idx]);
              displayHighlighted.push(tokens);
            }
          }

          startTransition(() => {
            setLines(displayLines);
            setHighlighted(displayHighlighted);
          });
        }
      }
    };
    
    processHighlighting();
    
    return () => {
      cancelled = true;
    };
  }, [displayCode, startTransition]);

  // Generate highlighted code for edit mode (all lines, including empty)
  const [highlightedEdit, setHighlightedEdit] = useState<Token[][]>(() => {
    // Initialize with empty to show loading state initially
    return [];
  });
  
  // Track if we're loading edit mode specifically (when switching to edit mode)
  const [isEditModeLoading, setIsEditModeLoading] = useState(false);
  
  // Calculate line count quickly without full highlighting (for skeleton)
  const editModeLineCount = useMemo(() => {
    if (!editedCode) return 0;
    const normalized = editedCode.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    return normalized.split("\n").length;
  }, [editedCode]);
  
  useEffect(() => {
    let cancelled = false;
    
    // Set loading state immediately when code changes
    setHighlightedEdit([]);
    setIsEditModeLoading(true);
    
    // Use async highlighting for large code blocks to prevent UI blocking
    const processEditHighlighting = async () => {
      try {
        // For small code blocks (< 200 lines), use synchronous highlighting
        // For larger blocks, use async to prevent blocking
        const lineCount = editedCode.split(/\r\n|\r|\n/).length;
        const useAsync = lineCount > 200;
        
        let editResult;
        if (useAsync) {
          editResult = await highlightCodeAsync(editedCode);
        } else {
          editResult = highlightCode(editedCode);
        }
        
        if (!cancelled) {
          startTransition(() => {
            setHighlightedEdit(editResult.highlighted);
            setIsEditModeLoading(false);
          });
        }
      } catch (error) {
        console.error("Error highlighting edit code:", error);
        if (!cancelled) {
          // Fallback to synchronous highlighting on error
          const editResult = highlightCode(editedCode);
          startTransition(() => {
            setHighlightedEdit(editResult.highlighted);
            setIsEditModeLoading(false);
          });
        }
      }
    };
    
    processEditHighlighting();
    
    return () => {
      cancelled = true;
    };
  }, [editedCode, startTransition]);

  // Keep external line counter in sync - only if callback is provided
  // Use the same normalization logic as useLineCount for consistency
  useEffect(() => {
    if (typeof onLineCountChange === "function") {
      const codeToCount = isEditMode ? editedCode : (savedCode ?? codeToShow);
      // Normalize line endings: convert CRLF (\r\n) and CR (\r) to LF (\n)
      const normalized = codeToCount.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      // Split by normalized newlines and count
      const lineCount = normalized.split("\n").length;
      onLineCountChange(lineCount);
    }
  }, [isEditMode, editedCode, codeToShow, savedCode, onLineCountChange]);

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
    hasUnsavedChanges,
    saveChanges,
    discardChanges,
    isPending, // Export loading state
    isEditModeLoading, // Export edit mode loading state
    editModeLineCount, // Export line count for skeleton
  };
}

