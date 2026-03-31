"use client";

import { motion, AnimatePresence } from "framer-motion";
import { SearchPackagesResultItem } from "./search-packages-result-item";
import { Spinner } from "@/shared/components/ui/spinner";
import { Empty } from "@/shared/components/ui/empty";
import type { WingetPackage } from "../types/winget-package";

interface SearchPackagesResultsProps {
  packages: WingetPackage[];
  isLoading: boolean;
  selectedIds: string[];
  onToggle: (id: string) => void;
  query: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  show: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
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
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="relative">
          <Spinner className="h-12 w-12 text-primary" />
          <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse rounded-full" />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-xl font-semibold tracking-tight text-foreground">Searching winget database...</p>
          <p className="text-sm text-muted-foreground animate-pulse font-mono uppercase tracking-widest bg-muted/30 px-3 py-1 rounded-full">
            Query: {query}
          </p>
        </div>
      </div>
    );
  }

  if (query.trim().length >= 2 && packages.length === 0) {
    return (
      <div className="py-20 flex justify-center w-full">
        <Empty
          title="No applications found"
          description={`We couldn't find any packages matching "${query}". Try searching for Chrome, Steam, or VS Code.`}
          className="max-w-md border-none bg-transparent shadow-none"
        />
      </div>
    );
  }

  if (query.trim().length < 2) {
    return (
      <div className="py-24 text-center opacity-40">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary/50 mb-6 group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:scale-110 transition-transform duration-500"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <p className="text-xl font-medium tracking-tight text-muted-foreground">Type a package name above to start searching</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
    >
      <AnimatePresence>
        {packages.map((pkg) => (
          <motion.div
            key={pkg.Id}
            variants={item}
            layout
            exit={{ opacity: 0, scale: 0.9, filter: "blur(8px)", transition: { duration: 0.2 } }}
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
