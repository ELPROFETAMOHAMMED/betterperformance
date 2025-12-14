"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";

interface AnimatedHeroProps {
  className?: string;
  loop?: boolean;
}

export default function AnimatedHero({
  className,
  loop = true,
}: AnimatedHeroProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use Intersection Observer to only animate when visible
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      // Fallback: animate after a delay
      const timer = setTimeout(() => setShouldAnimate(true), 500);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !shouldAnimate) {
          setShouldAnimate(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" } // Start animating before it's fully visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [shouldAnimate]);

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none select-none", className)}
    >
      {shouldAnimate && (
        <motion.div
          className="relative h-full w-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [0.8, 1, 0.8],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: loop ? Infinity : 0,
            ease: "easeInOut",
          }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-2xl" />
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/15 to-transparent"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: loop ? Infinity : 0,
              ease: "linear",
            }}
          />
        </motion.div>
      )}
    </div>
  );
}
