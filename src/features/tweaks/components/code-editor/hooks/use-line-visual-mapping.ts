"use client";

import { useState, useEffect, RefObject } from "react";

interface UseLineVisualMappingProps {
  containerRef: RefObject<HTMLElement>;
  wrapCode: boolean;
  logicalLineCount: number;
  visualLineCount?: number; // Optional: total visual line count for validation
}

const LINE_HEIGHT = 20; // 1.25rem = 20px (leading-5)

export function useLineVisualMapping({
  containerRef,
  wrapCode,
  logicalLineCount,
  visualLineCount,
}: UseLineVisualMappingProps) {
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);

  useEffect(() => {
    if (!wrapCode) {
      // When word wrap is disabled, each logical line = one visual line
      // Use logicalLineCount directly (which already excludes empty lines in preview mode)
      setLineNumbers(Array.from({ length: logicalLineCount }, (_, i) => i + 1));
      return;
    }

    // When word wrap is enabled, measure each logical line
    const measureLines = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const innerContent = container.querySelector('div.leading-5') as HTMLElement;
      if (!innerContent) return;

      // Get all line elements - they are direct children divs of the leading-5 container
      // Each line is a div with class "flex items-start" and "min-h-[1.25rem]"
      const lineElements = Array.from(innerContent.children).filter(
        (child) => child instanceof HTMLElement && child.classList.contains('flex')
      ) as HTMLElement[];
      
      if (lineElements.length === 0) {
        // Fallback: use scrollHeight calculation
        const scrollHeight = innerContent.scrollHeight;
        const calculatedLines = Math.ceil(scrollHeight / LINE_HEIGHT);
        // Generate sequential line numbers (1, 2, 3, 4, ...)
        const targetCount = visualLineCount && visualLineCount > 0 ? visualLineCount : calculatedLines;
        setLineNumbers(Array.from({ length: targetCount }, (_, i) => i + 1));
        return;
      }

      // Count total visual lines by measuring each logical line
      let totalVisualLines = 0;
      lineElements.forEach((lineElement) => {
        const lineHeight = lineElement.getBoundingClientRect().height;
        const visualLinesForThisLogical = Math.max(1, Math.ceil(lineHeight / LINE_HEIGHT));
        totalVisualLines += visualLinesForThisLogical;
      });

      // Generate sequential line numbers (1, 2, 3, 4, ...) for each visual line
      // Use visualLineCount if provided, otherwise use calculated total
      const targetCount = visualLineCount && visualLineCount > 0 ? visualLineCount : totalVisualLines;
      const newLineNumbers = Array.from({ length: targetCount }, (_, i) => i + 1);

      setLineNumbers(newLineNumbers);
    };

    // Measure after a delay to ensure DOM is updated
    // Use requestAnimationFrame to ensure layout is complete
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(measureLines);
      });
    }, 100);

    // Also measure when content changes
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(measureLines);
      });
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    const innerContent = containerRef.current?.querySelector('div.leading-5');
    if (innerContent) {
      resizeObserver.observe(innerContent);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [containerRef, wrapCode, logicalLineCount, visualLineCount]);

  return lineNumbers;
}

