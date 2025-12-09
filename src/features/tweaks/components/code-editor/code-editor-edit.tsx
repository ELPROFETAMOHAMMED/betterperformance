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
}

export function CodeEditorEdit({
  code,
  highlighted,
  wrapCode,
  enableTextColors,
  onCodeChange,
  containerRef,
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

  // Focus textarea on mount and when code changes (to handle mode switching)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        // Ensure cursor is at the end
        const length = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(length, length);
      }
    }, 150);
    return () => clearTimeout(timeoutId);
  }, [code]);

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
        className={`absolute inset-0 overflow-auto pointer-events-none font-mono leading-5 p-0 m-0 z-[1] ${
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
          e.currentTarget.classList.remove("z-10");
          e.currentTarget.classList.add("z-20");
        }}
        onBlur={(e) => {
          e.currentTarget.classList.remove("z-20");
          e.currentTarget.classList.add("z-10");
        }}
        onKeyDown={(e) => {
          // Ensure keyboard events are handled
          e.stopPropagation();
        }}
        onKeyUp={(e) => {
          // Ensure keyboard events are handled
          e.stopPropagation();
        }}
        className={`absolute inset-0 w-full h-full font-mono text-sm bg-transparent text-transparent caret-foreground border-none outline-none resize-none p-0 leading-5 z-10 ${
          wrapCode ? "whitespace-pre-wrap break-words" : "whitespace-pre"
        }`}
        style={{ 
          pointerEvents: 'auto',
          WebkitUserSelect: 'text',
          userSelect: 'text',
          cursor: 'text'
        }}
        spellCheck={false}
        autoFocus
        placeholder=""
      />
    </div>
  );
}

