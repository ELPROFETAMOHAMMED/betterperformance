"use client";

import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { BreadcrumbNavigator } from "./breadcrumb-navigator";
// Input import removed
import { MagnifyingGlassIcon, QueueListIcon } from "@heroicons/react/24/outline";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useSelection } from "@/features/tweaks/context/selection-context";
import { SelectionSheet } from "@/features/tweaks/components/selection-sheet";
import { Badge } from "@/shared/components/ui/badge";
// cn import removed
import { motion, AnimatePresence } from "framer-motion";
import { TweakSearchOverlay } from "@/features/tweaks/components/search-overlay";

export function MainHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { selectedTweaksArray } = useSelection();
  const [searchValue] = useState(searchParams.get("q") || "");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Update URL search params
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue) {
      params.set("q", searchValue);
    } else {
      params.delete("q");
    }

    // Only update if the query changed
    const currentQ = searchParams.get("q") || "";
    if (currentQ !== searchValue) {
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [searchValue, searchParams, pathname, router]);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border/40 bg-background/60 px-4 backdrop-blur-xl transition-all duration-200">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger className="h-9 w-9 text-muted-foreground hover:bg-accent hover:text-accent-foreground" />
        <div className="h-4 w-px bg-border/40" />
        <div className="hidden sm:block">
          <BreadcrumbNavigator />
        </div>
      </div>

      <div className="flex items-center gap-4 flex-1 justify-end">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="relative w-full max-w-[300px] group outline-none"
        >
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors z-10" />
          <div className="pl-9 h-9 bg-muted/30 border border-border/20 rounded-full flex items-center justify-between pr-3 group-hover:bg-muted/50 group-hover:border-primary/50 transition-all text-sm text-muted-foreground">
            <span>Search tweaks...</span>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </button>

        <TweakSearchOverlay
          open={isSearchOpen}
          onOpenChange={setIsSearchOpen}
        />

        <AnimatePresence>
          {selectedTweaksArray.length > 0 && (
            <SelectionSheet>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center cursor-pointer group"
              >
                <Badge variant="secondary" className="h-9 gap-2 px-3 rounded-full bg-primary/10 text-primary border-primary/20 font-semibold shadow-sm group-hover:bg-primary/20 transition-colors">
                  <QueueListIcon className="h-4 w-4" />
                  <span>{selectedTweaksArray.length}</span>
                </Badge>
              </motion.div>
            </SelectionSheet>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
