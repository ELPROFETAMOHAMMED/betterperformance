"use client";

import { useState, useEffect, Suspense } from "react";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { BreadcrumbNavigator } from "@/shared/components/layout/breadcrumb-navigator";
import { MagnifyingGlassIcon, QueueListIcon } from "@heroicons/react/24/outline";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useSelection } from "@/features/tweaks/context/selection-context";
import { SelectionSheet } from "@/features/tweaks/components/selection-sheet";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { TweakSearchOverlay } from "@/features/tweaks/components/tweak-search-overlay";

function MainHeaderInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { selectedItemsArray } = useSelection();
  const [searchValue] = useState(searchParams.get("q") || "");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue) {
      params.set("q", searchValue);
    } else {
      params.delete("q");
    }

    const currentQ = searchParams.get("q") || "";
    if (currentQ !== searchValue) {
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [searchValue, searchParams, pathname, router]);

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
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsSearchOpen(true)}
          className="group relative h-9 w-full max-w-xs justify-start rounded-[var(--radius-md)] border-border/20 bg-muted/30 px-0 text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
        >
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors z-10" />
          <div className="flex h-9 items-center justify-between pr-3 pl-9 text-sm text-muted-foreground">
            <span>Search tweaks...</span>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </Button>

        <TweakSearchOverlay
          open={isSearchOpen}
          onOpenChange={setIsSearchOpen}
        />

        <AnimatePresence>
          {selectedItemsArray.length > 0 && (
            <SelectionSheet>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center"
              >
                <Button variant="ghost" className="h-8 rounded-[var(--radius-md)] px-2 hover:bg-primary/10">
                  <Badge variant="secondary" className="h-8 gap-2 rounded-[var(--radius-md)] border border-primary/20 bg-primary/10 px-3 font-semibold text-primary">
                    <QueueListIcon className="h-4 w-4" />
                    <span>{selectedItemsArray.length}</span>
                  </Badge>
                </Button>
              </motion.div>
            </SelectionSheet>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export function MainHeader() {
  return (
    <Suspense fallback={<div className="h-14 w-full border-b border-border/40 bg-background/60" />}>
      <MainHeaderInner />
    </Suspense>
  );
}
