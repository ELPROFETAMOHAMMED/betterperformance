"use client";

import { useRef } from "react";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
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
  enableLineCount?: boolean;
  onSaveCode?: (code: string) => void;
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
  enableLineCount: enableLineCountProp,
  onSaveCode,
}: CodeEditorProps) {
  // Defaults
  const showLineNumbers =
    typeof showLineNumbersProp === "boolean" ? showLineNumbersProp : true;
  const enableTextColors =
    typeof enableTextColorsProp === "boolean" ? enableTextColorsProp : true;
  const hideSensitive =
    typeof hideSensitiveProp === "boolean" ? hideSensitiveProp : false;
  const wrapCode = typeof wrapCodeProp === "boolean" ? wrapCodeProp : true;
  const enableCodeEditing =
    typeof enableCodeEditingProp === "boolean" ? enableCodeEditingProp : true;
  const enableLineCount =
    typeof enableLineCountProp === "boolean" ? enableLineCountProp : true;

  // Use custom hook for code editor logic
  const {
    isEditMode,
    setIsEditMode,
    codeToShow,
    editedCode,
    setEditedCode,
    highlighted,
    highlightedEdit,
    hasUnsavedChanges,
    saveChanges,
    discardChanges,
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

  // When wordWrap is enabled and we have line mapping, use its length as the source of truth
  // Otherwise, use the calculated visual line count or logical count
  // When wordWrap is disabled, always use logicalLineCount (which excludes empty lines in preview mode)
  const displayedLineCount = wrapCode 
    ? (lineNumberMapping.length > 0 ? lineNumberMapping.length : visualLineCount)
    : logicalLineCount;

  return (
    <div className="relative w-full h-full">
      <ScrollArea className="backdrop-blur-xl rounded-lg w-full h-full">
        <div className="p-3 pb-14">
          <div className="rounded-lg overflow-hidden bg-transparent relative">
            {actualEditMode ? (
              /* Edit mode */
              <div className="flex font-mono text-sm text-foreground relative">
                {showLineNumbers && enableLineCount && (
                  <LineNumbersGutter 
                    lineCount={wrapCode && lineNumberMapping.length > 0 
                      ? lineNumberMapping.length 
                      : logicalLineCount}
                    enabled={enableLineCount}
                    lineNumbers={wrapCode && lineNumberMapping.length > 0 ? lineNumberMapping : undefined}
                  />
                )}
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
              </div>
            ) : (
              /* Preview mode */
              <div className="flex font-mono text-sm text-foreground">
                {showLineNumbers && enableLineCount && (
                  <LineNumbersGutter 
                    lineCount={wrapCode && lineNumberMapping.length > 0 
                      ? lineNumberMapping.length 
                      : logicalLineCount}
                    enabled={enableLineCount}
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
