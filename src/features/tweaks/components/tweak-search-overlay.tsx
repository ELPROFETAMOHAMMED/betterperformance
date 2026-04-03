"use client";

import { CubeIcon } from "@heroicons/react/24/outline";

import { TweakSearchResults } from "@/features/tweaks/components/tweak-search-results";
import { WingetSearchResults } from "@/features/tweaks/components/winget-search-results";
import { useOverlaySearch } from "@/features/tweaks/hooks/use-overlay-search";
import {
  CommandDialog,
  CommandInput,
  CommandList,
} from "@/shared/components/ui/command";
import { Skeleton } from "@/shared/components/ui/skeleton";

type TweakSearchOverlayProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TweakSearchOverlay({
  open,
  onOpenChange,
}: TweakSearchOverlayProps) {
  const {
    categories,
    handleSelectTweak,
    handleSelectWingetPackage,
    isLoading,
    isWingetLoading,
    isWingetSearch,
    search,
    setSearch,
    topMatches,
    wingetPackages,
    wingetQuery,
  } = useOverlaySearch(open, onOpenChange);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="group/input relative">
        <CommandInput
          placeholder="Type to search tweaks or winget applications..."
          value={search}
          onValueChange={setSearch}
          className="pr-12"
        />
        <div className="pointer-events-none absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 animate-pulse">
            <CubeIcon className="h-3 w-3" />
            <span>@winget ready</span>
          </div>
        </div>
      </div>
      <CommandList className="max-h-[450px] overflow-y-auto backdrop-blur-xl">
        {isLoading ? (
          <div className="space-y-4 p-4">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-xl border border-border/20 bg-muted/5 p-3"
              >
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
            <TweakSearchResults
              categories={categories}
              isWingetSearch={isWingetSearch}
              search={search}
              topMatches={topMatches}
              onSearchChange={setSearch}
              onSelectTweak={handleSelectTweak}
            />
            <WingetSearchResults
              isLoading={isWingetLoading}
              isWingetSearch={isWingetSearch}
              packages={wingetPackages}
              search={search}
              wingetQuery={wingetQuery}
              onSelectPackage={handleSelectWingetPackage}
            />
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
