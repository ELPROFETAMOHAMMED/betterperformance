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
  SparklesIcon,
  ShoppingCartIcon as ShoppingCart
} from "@heroicons/react/24/outline";
import { useSelection } from "@/features/tweaks/context/selection-context";
import { getSearchSuggestions } from "@/features/tweaks/actions/get-search-tweaks";
import type { Tweak, TweakCategory } from "@/features/tweaks/types/tweak.types";
import { Badge } from "@/shared/components/ui/badge";
import { useSearchPackages } from "@/features/app-installer/search-packages/use-search-packages";
import { CubeIcon } from "@heroicons/react/24/outline";
import { mapPkgToTweak } from "@/features/app-installer/utils/map-pkg-to-tweak";
import type { WingetPackage } from "@/features/app-installer/types/winget-package";
import { toast } from "sonner";

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
  const { packages: wingetPackages = [], isLoading: isWingetLoading } = useSearchPackages(
    isWingetSearch ? wingetQuery : ""
  );

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
      <div className="relative group/input">
        <CommandInput 
          placeholder="Type to search tweaks or winget applications..." 
          value={search}
          onValueChange={setSearch}
          className="pr-12"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-600 uppercase tracking-widest animate-pulse">
            <CubeIcon className="h-3 w-3" />
            <span>@winget ready</span>
          </div>
        </div>
      </div>
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
            {/* Persistent Discovery Hint */}
            {!isWingetSearch && !search && (
              <div className="p-4 mx-2 my-2 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-4 transition-all hover:bg-emerald-500/10">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-600 shrink-0">
                  <CubeIcon className="h-6 w-6 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-emerald-700">Did you know?</h4>
                  <p className="text-xs text-emerald-600/80 leading-relaxed">
                    You can search and install over <span className="font-bold underline">10,000+ official Windows apps</span> directly from this search bar. 
                    Just type <code className="px-1.5 py-0.5 rounded bg-emerald-500/20 font-mono text-emerald-700 font-bold">@winget</code> followed by the app name.
                  </p>
                </div>
              </div>
            )}

            {!isWingetSearch && search && <CommandEmpty>
              <div className="flex flex-col items-center justify-center p-4">
                <span>No results found for &quot;{search}&quot;.</span>
                <button 
                  onClick={() => setSearch(`@winget ${search}`)}
                  className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all text-xs font-semibold"
                >
                  <CubeIcon className="h-4 w-4" />
                  Search for &quot;{search}&quot; as an application
                </button>
              </div>
            </CommandEmpty>}

            {/* Discovery Hint for Winget */}
            {!isWingetSearch && search.length >= 2 && (
               <CommandGroup heading="Discovery">
                 <CommandItem
                   onSelect={() => setSearch(`@winget ${search}`)}
                   className="flex items-center gap-3 p-3 cursor-pointer group rounded-xl mx-2 my-1 border border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all"
                 >
                   <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600">
                     <CubeIcon className="h-4 w-4" />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-sm font-semibold text-emerald-700">Search for &quot;{search}&quot; as an app</span>
                     <span className="text-[10px] text-emerald-600/70 italic">Tip: Use @winget prefix to find official Windows applications</span>
                   </div>
                 </CommandItem>
               </CommandGroup>
            )}
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
            {isWingetSearch && wingetQuery.length >= 2 && (
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
                ) : !isWingetLoading && Array.isArray(wingetPackages) && wingetPackages.length === 0 ? (
                  <CommandItem value={`empty ${search}`} disabled className="p-8 w-full justify-center text-center text-sm text-muted-foreground aria-disabled:opacity-100">
                    No winget applications found for &quot;{wingetQuery}&quot;
                  </CommandItem>
                ) : (
                    Array.isArray(wingetPackages) && wingetPackages.map((pkg: WingetPackage) => (
                      <CommandItem
                        key={pkg.Id}
                        value={`${pkg.Id} ${pkg.Latest?.Name || ""} ${search}`}
                        onSelect={() => {
                          const tweak = mapPkgToTweak(pkg);
                          if (!selectedTweaksSet.has(tweak.id)) {
                            toggleTweak(tweak);
                            toast.success(`Added ${tweak.title} to selection`, {
                              description: "You can find it in your Tweak Cart.",
                              icon: <ShoppingCart className="h-4 w-4" />,
                            });
                          } else {
                            toast.info(`${tweak.title} is already selected`);
                          }
                          onOpenChange(false);
                          router.push("/tweaks/library");
                        }}
                        className="flex items-center justify-between gap-3 p-3.5 cursor-pointer group rounded-xl mx-2 my-1 border border-transparent hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all"
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
