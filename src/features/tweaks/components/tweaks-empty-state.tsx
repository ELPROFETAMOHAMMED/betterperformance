"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface TweaksEmptyStateProps {
  title: string;
  description?: string;
}

export function TweaksEmptyState({
  title,
  description,
}: TweaksEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
      <div className="relative mb-3 flex items-center justify-center">
        <motion.div
          className="absolute h-20 w-20 rounded-full bg-primary/15 blur-2xl"
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.9, 1.05, 0.9] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          animate={{ rotate: [-4, 4, -4] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/assets/Aplication-logo.png"
            alt="BetterPerformance logo"
            width={56}
            height={56}
            className="relative rounded-[var(--radius-md)] shadow-md"
          />
        </motion.div>
      </div>
      <p className="text-sm">{title}</p>
      {description ? (
        <p className="mt-1 text-xs opacity-60">{description}</p>
      ) : null}
    </div>
  );
}

