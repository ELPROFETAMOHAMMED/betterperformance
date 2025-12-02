"use client";

import { useMemo } from "react";
import Lottie from "lottie-react";
import { cn } from "@/lib/utils";

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


