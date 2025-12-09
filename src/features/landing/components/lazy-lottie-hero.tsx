"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/shared/lib/utils";

// Dynamically import Lottie with no SSR to prevent bundling
const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => null,
});

interface LazyLottieHeroProps {
  className?: string;
  loop?: boolean;
}

export default function LazyLottieHero({
  className,
  loop = true,
}: LazyLottieHeroProps) {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use Intersection Observer to only load when visible
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      // Fallback: load after a delay
      const timer = setTimeout(() => setShouldLoad(true), 500);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !shouldLoad) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" } // Start loading before it's fully visible
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
  }, [shouldLoad]);

  // Load animation data only when component should load
  useEffect(() => {
    if (!shouldLoad) return;

    // Dynamically import the animation data to avoid bundling it
    import("@/data/lottie/hero-loop.json")
      .then((module) => {
        setAnimationData(module.default);
      })
      .catch((error) => {
        console.error("Failed to load Lottie animation:", error);
      });
  }, [shouldLoad]);

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none select-none", className)}
    >
      {animationData && shouldLoad ? (
        <Lottie animationData={animationData} loop={loop} autoplay />
      ) : null}
    </div>
  );
}




