"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { SearchPackagesResultItem } from "@/features/app-installer/search-packages/search-packages-result-item";
import { Spinner } from "@/shared/components/ui/spinner";
import { Empty, EmptyTitle, EmptyDescription } from "@/shared/components/ui/empty";
import type { WingetPackage } from "@/features/app-installer/types/winget-package";

interface SearchPackagesResultsProps {
  packages: WingetPackage[];
  isLoading: boolean;
  selectedIds: string[];
  onToggle: (id: string) => void;
  query: string;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

/**
 * Animated list of search results using Framer Motion.
 * Handles loading, empty, and staggered result animations.
 */
export function SearchPackagesResults({
  packages,
  isLoading,
  selectedIds,
  onToggle,
  query,
}: SearchPackagesResultsProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Spinner className="h-8 w-8 text-primary" />
        <div className="space-y-1 text-center">
          <p className="text-base font-medium text-foreground">Searching winget database...</p>
          <p className="text-xs text-muted-foreground">Query: {query}</p>
        </div>
      </div>
    );
  }

  if (query.trim().length >= 2 && packages.length === 0) {
    return (
      <div className="py-20 flex justify-center w-full">
        <Empty className="max-w-md border-none bg-transparent shadow-none">
          <EmptyTitle>No applications found</EmptyTitle>
          <EmptyDescription>We couldn&apos;t find any packages matching &quot;{query}&quot;. Try searching for Chrome, Steam, or VS Code.</EmptyDescription>
        </Empty>
      </div>
    );
  }

  if (query.trim().length < 2) {
    return (
      <div className="py-16 text-center opacity-60">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-md border border-border/50 bg-secondary/40">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">Type a package name above to start searching</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-2"
    >
      <AnimatePresence>
        {packages.map((pkg) => (
          <motion.div
            key={pkg.Id}
            variants={item}
            layout
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
          >
            <SearchPackagesResultItem
              pkg={pkg}
              isSelected={selectedIds.includes(pkg.Id)}
              onToggle={() => onToggle(pkg.Id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
