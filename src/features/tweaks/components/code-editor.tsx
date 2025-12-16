"use client";

import { useRef, useEffect } from "react";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { Tweak } from "@/features/tweaks/types/tweak.types";
import { LineNumbersGutter } from "./code-editor/line-numbers-gutter";
import { CodePreview } from "./code-editor/code-preview";
import { CodeEditorEdit } from "./code-editor/code-editor-edit";
import { EditModeToggle } from "./code-editor/edit-mode-toggle";
import { useCodeEditor } from "./code-editor/hooks/use-code-editor";
import { useVisualLineCount } from "./code-editor/hooks/use-visual-line-count";
import { useLineVisualMapping } from "./code-editor/hooks/use-line-visual-mapping";

interface CodeEditorProps {
  selectedTweaks?: Tweak[];
  code: string;
  showLineNumbers?: boolean;
  enableTextColors?: boolean;
  hideSensitive?: boolean;
  wrapCode?: boolean;
  onLineCountChange?: (count: number) => void;
  showComments?: boolean;
  enableCodeEditing?: boolean;
  onSaveCode?: (code: string) => void;
  onReady?: () => void;
}

// Skeleton component for code editor loading state
function CodeEditorSkeleton({ lineCount }: { lineCount: number }) {
  // Generate skeleton lines with varying widths to look more realistic
  // Simulate PowerShell code patterns with different line lengths
  const skeletonLines = Array.from({ length: Math.min(lineCount, 200) }, (_, i) => {
    // Create more realistic patterns:
    // - Some short lines (comments, empty-ish)
    // - Some medium lines (commands)
    // - Some long lines (parameters, strings)
    const pattern = i % 7;
    let width: number;
    
    if (pattern === 0 || pattern === 6) {
      // Short lines (comments or short commands) - 20-40%
      width = 20 + (i % 3) * 7;
    } else if (pattern === 1 || pattern === 5) {
      // Medium lines (commands with parameters) - 50-70%
      width = 50 + (i % 4) * 5;
    } else {
      // Long lines (complex commands, strings) - 75-95%
      width = 75 + (i % 5) * 4;
    }
    
    return (
      <div key={i} className="flex items-start min-h-[1.25rem]">
        <div className="w-0" />
        <Skeleton 
          className="h-5 font-mono text-sm" 
          style={{ width: `${width}%` }}
        />
      </div>
    );
  });

  return (
    <div className="flex-1 relative">
      <div className="leading-5">
        {skeletonLines}
      </div>
    </div>
  );
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
  enableCodeEditing: enableCodeEditingProp,
  onSaveCode,
  onReady,
}: CodeEditorProps) {
  // Defaults
  const enableCodeEditing =
    typeof enableCodeEditingProp === "boolean" ? enableCodeEditingProp : true;
  // showLineNumbers is required when enableCodeEditing is true
  const showLineNumbers =
    enableCodeEditing 
      ? true 
      : (typeof showLineNumbersProp === "boolean" ? showLineNumbersProp : true);
  const enableTextColors =
    typeof enableTextColorsProp === "boolean" ? enableTextColorsProp : true;
  const hideSensitive =
    typeof hideSensitiveProp === "boolean" ? hideSensitiveProp : false;
  const wrapCode = typeof wrapCodeProp === "boolean" ? wrapCodeProp : true;

  // Use custom hook for code editor logic
  const {
    isEditMode,
    setIsEditMode,
    editedCode,
    setEditedCode,
    highlighted,
    highlightedEdit,
    hasUnsavedChanges,
    saveChanges,
    discardChanges,
    isPending,
    isEditModeLoading,
    editModeLineCount,
  } = useCodeEditor({
    selectedTweaks,
    code,
    hideSensitive,
    showComments: Boolean(showComments),
    enableCodeEditing,
    onLineCountChange,
  });

  // Ensure we're in preview mode if editing is disabled
  const actualEditMode = enableCodeEditing && isEditMode;

  // Calculate logical line count based on what's actually displayed
  // In preview mode: count only non-empty lines (highlighted.length)
  // In edit mode: count all lines including empty ones (highlightedEdit.length)
  const logicalLineCount = actualEditMode 
    ? highlightedEdit.length 
    : highlighted.length;

  // Refs for measuring visual line count when wordWrap is enabled
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const editContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = actualEditMode ? editContainerRef : previewContainerRef;

  // Calculate visual line count when wordWrap is enabled
  const visualLineCount = useVisualLineCount({
    containerRef: containerRef as React.RefObject<HTMLElement>,
    wrapCode,
    logicalLineCount,
  });

  // Get line number mapping for each visual line when wordWrap is enabled
  // This hook calculates both the mapping and the actual visual line count
  // Only pass visualLineCount when wordWrap is enabled to avoid counting empty lines
  const lineNumberMapping = useLineVisualMapping({
    containerRef: containerRef as React.RefObject<HTMLElement>,
    wrapCode,
    logicalLineCount,
    visualLineCount: wrapCode ? visualLineCount : undefined,
  });

  // Notify parent when CodeEditor is ready (not loading)
  useEffect(() => {
    if (!isPending && onReady) {
      onReady();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  // When wordWrap is enabled and we have line mapping, use its length as the source of truth
  // Otherwise, use the calculated visual line count or logical count
  // When wordWrap is disabled, always use logicalLineCount (which excludes empty lines in preview mode)

  return (
    <div className="relative w-full h-full">
      <ScrollArea className="backdrop-blur-xl rounded-[var(--radius-lg)] w-full h-full">
        <div className="p-3 pb-14">
          <div className="rounded-[var(--radius-lg)] overflow-hidden bg-transparent relative transition-colors duration-200">
            {isPending ? (
              /* Loading state */
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground">Loading code editor...</p>
                </div>
              </div>
            ) : actualEditMode ? (
              /* Edit mode */
              <div className="flex font-mono text-sm text-foreground relative">
                {showLineNumbers && (
                  <LineNumbersGutter 
                    lineCount={wrapCode && lineNumberMapping.length > 0 
                      ? lineNumberMapping.length 
                      : (isEditModeLoading ? editModeLineCount : logicalLineCount)}
                    enabled={showLineNumbers}
                    lineNumbers={wrapCode && lineNumberMapping.length > 0 ? lineNumberMapping : undefined}
                  />
                )}
                {(isEditModeLoading || highlightedEdit.length === 0) && editModeLineCount > 0 ? (
                  <CodeEditorSkeleton lineCount={editModeLineCount} />
                ) : highlightedEdit.length > 0 ? (
                  <CodeEditorEdit
                    key="code-editor-edit"
                    code={editedCode}
                    highlighted={highlightedEdit}
                    wrapCode={wrapCode}
                    enableTextColors={enableTextColors}
                    onCodeChange={setEditedCode}
                    containerRef={editContainerRef}
                    isEditMode={actualEditMode}
                  />
                ) : null}
              </div>
            ) : (
              /* Preview mode */
              <div className="flex font-mono text-sm text-foreground">
                {showLineNumbers && (
                  <LineNumbersGutter 
                    lineCount={wrapCode && lineNumberMapping.length > 0 
                      ? lineNumberMapping.length 
                      : logicalLineCount}
                    enabled={showLineNumbers}
                    lineNumbers={wrapCode && lineNumberMapping.length > 0 ? lineNumberMapping : undefined}
                  />
                )}
                <CodePreview
                  ref={previewContainerRef}
                  highlighted={highlighted}
                  wrapCode={wrapCode}
                  enableTextColors={enableTextColors}
                />
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {enableCodeEditing && (
        <EditModeToggle
          isEditMode={actualEditMode}
          hasUnsavedChanges={hasUnsavedChanges}
          onToggleMode={() => setIsEditMode(!isEditMode)}
          onSaveAndPreview={() => {
            saveChanges();
            onSaveCode?.(editedCode);
            setIsEditMode(false);
          }}
          onDiscardAndPreview={() => {
            discardChanges();
            setIsEditMode(false);
          }}
        />
      )}
    </div>
  );
}
