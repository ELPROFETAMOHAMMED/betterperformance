"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { 
  CommandLineIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { useSelection } from "@/features/tweaks/context/selection-context";
import { getSearchSuggestions } from "@/features/tweaks/actions/get-search-tweaks";
import type { Tweak, TweakCategory } from "@/features/tweaks/types/tweak.types";
import { Badge } from "@/shared/components/ui/badge";
import { useSearchPackages } from "@/features/app-installer/search-packages/use-search-packages";
import { CubeIcon } from "@heroicons/react/24/outline";

export function TweakSearchOverlay({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void 
}) {
  const router = useRouter();
  const { setActiveTweakId, toggleTweak, selectedTweaksSet } = useSelection();
  const [categories, setCategories] = useState<TweakCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  const isWingetSearch = search.toLowerCase().startsWith("@winget");
  const wingetQuery = isWingetSearch ? search.substring(7).trim() : "";
  const { packages: wingetPackages, isLoading: isWingetLoading } = useSearchPackages(wingetQuery);

  // Flatten all tweaks for "Top Matches"
  const allTweaks = React.useMemo(() => {
    return categories.flatMap(cat => 
      (cat.tweaks || []).map(t => ({ ...t, categoryName: cat.name }))
    );
  }, [categories]);

  // Filter tweaks for "Top Matches" based on current search
  const topMatches = React.useMemo(() => {
    if (!search.trim() || isWingetSearch) return [];
    const normalized = search.toLowerCase();
    return allTweaks
      .filter(t => 
        t.title.toLowerCase().includes(normalized) || 
        t.description?.toLowerCase().includes(normalized)
      )
      .slice(0, 5);
  }, [allTweaks, search]);

  // Fetch tweaks for suggestions
  useEffect(() => {
    if (open && categories.length === 0) {
      const load = async () => {
        setIsLoading(true);
        try {
          const data = await getSearchSuggestions();
          setCategories(data);
        } catch (e) {
          console.error("Search fetch error", e);
        } finally {
          setIsLoading(false);
        }
      };
      load();
    }
  }, [open, categories.length]);

  const handleSelect = useCallback((tweak: Tweak) => {
    onOpenChange(false);
    
    // Add to selection if not already there
    if (!selectedTweaksSet.has(tweak.id)) {
      toggleTweak(tweak);
    }
    
    setActiveTweakId(tweak.id);
    
    // Route to library to show the selected/active tweak
    router.push("/tweaks/library");
  }, [onOpenChange, toggleTweak, selectedTweaksSet, setActiveTweakId, router]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Type to search tweaks or winget applications..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className="max-h-[450px] overflow-y-auto backdrop-blur-xl">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border/20 bg-muted/5">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2 opacity-50" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {!isWingetSearch && <CommandEmpty>No results found for &quot;{search}&quot;.</CommandEmpty>}
            
            {topMatches.length > 0 && (
              <CommandGroup heading="Top Matches">
                {topMatches.map((tweak) => (
                  <CommandItem
                    key={`top-${tweak.id}`}
                    onSelect={() => handleSelect(tweak)}
                    className="flex items-center justify-between gap-3 p-3.5 cursor-pointer group rounded-xl mx-2 my-1 border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <SparklesIcon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm truncate">{tweak.title}</span>
                        <span className="text-[11px] text-muted-foreground truncate opacity-70">
                          {tweak.categoryName} • {tweak.description || "System Optimization"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="text-[10px] bg-muted/50 border-none px-2 h-5">
                        {tweak.download_count} DLs
                      </Badge>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Regular categories below */}
            {!isWingetSearch && categories.map((category) => (
              <CommandGroup key={category.id} heading={category.name}>
                {category.tweaks?.map((tweak) => (
                  <CommandItem
                    key={tweak.id}
                    onSelect={() => handleSelect(tweak)}
                    className="flex items-center justify-between gap-3 p-3 cursor-pointer group rounded-lg mx-1 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <CommandLineIcon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-sm truncate">{tweak.title}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] opacity-40 group-hover:opacity-100 transition-opacity">
                      {category.name}
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}

            {/* Winget Packages below */}
            {isWingetSearch && (wingetPackages.length > 0 || isWingetLoading || wingetQuery.length >= 2) && (
              <CommandGroup heading="Winget Applications">
                {isWingetLoading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <CommandItem key={`winget-skel-${i}`} value={`skel-${i} ${search}`} disabled className="flex items-center gap-3 p-3 rounded-xl border border-border/20 bg-muted/5 mx-2 my-1">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-3 w-1/2 opacity-50" />
                        </div>
                      </CommandItem>
                    ))}
                  </>
                ) : wingetPackages.length === 0 && wingetQuery.length >= 2 ? (
                  <CommandItem value={`empty ${search}`} disabled className="p-8 w-full justify-center text-center text-sm text-muted-foreground aria-disabled:opacity-100">
                    No winget applications found for &quot;{wingetQuery}&quot;
                  </CommandItem>
                ) : (
                  wingetPackages.map((pkg) => (
                    <CommandItem
                      key={pkg.Id}
                      value={`${pkg.Id} ${pkg.Latest?.Name || ""} ${search}`}
                      onSelect={() => {
                        onOpenChange(false);
                        router.push(`/tweaks/apps`);
                      }}
                      className="flex items-center justify-between gap-3 p-3.5 cursor-pointer group rounded-xl mx-2 my-1 border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                          <CubeIcon className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-sm truncate">{pkg.Latest?.Name || pkg.Id}</span>
                          <span className="text-[11px] text-muted-foreground truncate opacity-70">
                            {pkg.Latest?.Publisher || "Unknown"} • {pkg.Id}
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-none px-2 h-5">
                        Winget
                      </Badge>
                    </CommandItem>
                  ))
                )}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
