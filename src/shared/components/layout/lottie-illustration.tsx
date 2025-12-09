"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { cn } from "@/shared/lib/utils";

// Dynamically import Lottie with no SSR to prevent bundling
const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
  loading: () => null,
});

interface LottieIllustrationProps {
  animationData: object;
  className?: string;
  loop?: boolean;
}

export default function LottieIllustration({
  animationData,
  className,
  loop = true,
}: LottieIllustrationProps) {
  const memoised = useMemo(() => animationData, [animationData]);

  return (
    <div className={cn("pointer-events-none select-none", className)}>
      <Lottie animationData={memoised} loop={loop} autoplay />
    </div>
  );
}





