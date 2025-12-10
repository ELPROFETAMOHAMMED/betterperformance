"use client";

import { useRef, useEffect } from "react";
import { tokenClass } from "@/features/tweaks/utils/code-editor";
import type { Token } from "@/features/tweaks/utils/code-editor";

interface CodeEditorEditProps {
  code: string;
  highlighted: Token[][];
  wrapCode: boolean;
  enableTextColors: boolean;
  onCodeChange: (code: string) => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  isEditMode?: boolean;
}

export function CodeEditorEdit({
  code,
  highlighted,
  wrapCode,
  enableTextColors,
  onCodeChange,
  containerRef,
  isEditMode = true,
}: CodeEditorEditProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  
  // Expose the highlight container ref for line counting
  useEffect(() => {
    if (containerRef && highlightRef.current) {
      if ('current' in containerRef) {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = highlightRef.current;
      }
    }
  }, [containerRef, highlighted]);

  // Sync scroll between textarea and highlight overlay
  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Focus textarea when component mounts (since it's conditionally rendered)
  // Don't reset cursor position on code changes to prevent cursor jumping
  useEffect(() => {
    // Since the component is conditionally rendered and mounts fresh each time,
    // we can simply focus on mount when in edit mode
    if (isEditMode && textareaRef.current) {
      const timeoutId = setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          // Preserve cursor position if possible, otherwise set to end
          const currentPos = textareaRef.current.selectionStart;
          if (currentPos === 0 && textareaRef.current.value.length > 0) {
            const length = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(length, length);
          }
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isEditMode]);

  // Handle click on container to focus textarea
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (textareaRef.current && e.target === e.currentTarget) {
      textareaRef.current.focus();
    }
  };

  return (
    <div 
      className="flex-1 relative"
      onClick={handleContainerClick}
    >
      {/* Syntax highlighted overlay (behind textarea) */}
      <div
        ref={highlightRef}
        className={`absolute inset-0 overflow-auto pointer-events-none font-mono leading-5 p-0 m-0 z-0 ${
          wrapCode ? "whitespace-pre-wrap break-words" : "whitespace-pre"
        }`}
      >
        <div className="leading-5">
          {highlighted.length > 0 ? (
            highlighted.map((tokens, idx) => (
              <div key={idx} className="flex items-start min-h-[1.25rem]">
                <pre
                  className={`m-0 p-0 font-mono text-sm leading-5 w-full ${
                    wrapCode ? "whitespace-pre-wrap break-words" : "whitespace-pre"
                  }`}
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
            ))
          ) : (
            <div className="text-muted-foreground text-xs p-2">
              No code to display
            </div>
          )}
        </div>
      </div>

      {/* Editable textarea (on top, transparent text but visible caret) */}
      <textarea
        ref={textareaRef}
        value={code || ""}
        onChange={(e) => {
          onCodeChange(e.target.value);
          setTimeout(handleScroll, 0);
        }}
        onScroll={handleScroll}
        onFocus={(e) => {
          // Ensure textarea is always on top when focused
          e.currentTarget.style.zIndex = '20';
        }}
        onBlur={(e) => {
          // Keep textarea accessible even when blurred
          e.currentTarget.style.zIndex = '10';
        }}
        onKeyDown={(e) => {
          // Ensure keyboard events are handled
          e.stopPropagation();
        }}
        onKeyUp={(e) => {
          // Ensure keyboard events are handled
          e.stopPropagation();
        }}
        className={`absolute inset-0 w-full h-full font-mono text-sm bg-transparent text-transparent border-none outline-none resize-none p-0 leading-5 ${
          wrapCode ? "whitespace-pre-wrap break-words" : "whitespace-pre"
        }`}
        style={{ 
          pointerEvents: 'auto',
          WebkitUserSelect: 'text',
          userSelect: 'text',
          cursor: 'text',
          zIndex: 10,
          caretColor: 'var(--foreground)',
          color: 'transparent'
        }}
        spellCheck={false}
        autoFocus
        placeholder=""
      />
    </div>
  );
}

