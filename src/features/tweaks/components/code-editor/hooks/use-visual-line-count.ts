"use client";

import { useState, useEffect, useRef, RefObject } from "react";

interface UseVisualLineCountProps {
  containerRef: RefObject<HTMLElement>;
  wrapCode: boolean;
  logicalLineCount: number;
}

const LINE_HEIGHT = 20; // 1.25rem = 20px (leading-5)

export function useVisualLineCount({
  containerRef,
  wrapCode,
  logicalLineCount,
}: UseVisualLineCountProps) {
  const [visualLineCount, setVisualLineCount] = useState(logicalLineCount);

  useEffect(() => {
    if (!wrapCode) {
      // When word wrap is disabled, visual lines = logical lines
      setVisualLineCount(logicalLineCount);
      return;
    }

    // When word wrap is enabled, measure the actual rendered height
    const measureVisualLines = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      
      // Try to find the inner content container (div with leading-5 class)
      const innerContent = container.querySelector('div.leading-5') as HTMLElement;
      if (!innerContent) return;
      
      // Count visual lines by measuring each logical line element
      const lineElements = Array.from(innerContent.children).filter(
        (child) => child instanceof HTMLElement && child.classList.contains('flex')
      ) as HTMLElement[];
      
      if (lineElements.length === 0) {
        // Fallback: use scrollHeight calculation
        const scrollHeight = innerContent.scrollHeight;
        const calculatedLines = Math.ceil(scrollHeight / LINE_HEIGHT);
        setVisualLineCount(Math.max(calculatedLines, logicalLineCount));
        return;
      }
      
      // Calculate total visual lines by summing up visual lines from each logical line
      let totalVisualLines = 0;
      lineElements.forEach((lineElement) => {
        const lineHeight = lineElement.getBoundingClientRect().height;
        const visualLinesForThisLogical = Math.max(1, Math.ceil(lineHeight / LINE_HEIGHT));
        totalVisualLines += visualLinesForThisLogical;
      });
      
      // Ensure we have at least the logical line count
      const finalCount = Math.max(totalVisualLines, logicalLineCount);
      
      setVisualLineCount(finalCount);
    };

    // Measure after a delay to ensure DOM is updated
    // Use requestAnimationFrame to ensure layout is complete
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(measureVisualLines);
      });
    }, 50);

    // Also measure when window is resized or content changes
    const resizeObserver = new ResizeObserver(() => {
      // Use requestAnimationFrame to ensure layout is complete
      requestAnimationFrame(() => {
        requestAnimationFrame(measureVisualLines);
      });
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Also observe the inner content if it exists
    const innerContent = containerRef.current?.querySelector('div.leading-5');
    if (innerContent) {
      resizeObserver.observe(innerContent);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [containerRef, wrapCode, logicalLineCount]);

  return visualLineCount;
}

