"use client";

import { CubeIcon } from "@heroicons/react/24/outline";

import { Badge } from "@/shared/components/ui/badge";
import {
  CommandGroup,
  CommandItem,
} from "@/shared/components/ui/command";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { WingetPackage } from "@/features/app-installer/types/winget-package";

type WingetSearchResultsProps = {
  isLoading: boolean;
  isWingetSearch: boolean;
  packages: WingetPackage[];
  search: string;
  wingetQuery: string;
  onSelectPackage: (pkg: WingetPackage) => void;
};

export function WingetSearchResults({
  isLoading,
  isWingetSearch,
  packages,
  search,
  wingetQuery,
  onSelectPackage,
}: WingetSearchResultsProps) {
  if (!isWingetSearch || wingetQuery.length < 2) {
    return null;
  }

  return (
    <CommandGroup heading="Winget Applications">
      {isLoading ? (
        <>
          {[1, 2, 3].map((index) => (
            <CommandItem
              key={`winget-skeleton-${index}`}
              value={`skeleton-${index} ${search}`}
              disabled
              className="mx-2 my-1 flex items-center gap-3 rounded-xl border border-border/20 bg-muted/5 p-3"
            >
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2 opacity-50" />
              </div>
            </CommandItem>
          ))}
        </>
      ) : packages.length === 0 ? (
        <CommandItem
          value={`empty ${search}`}
          disabled
          className="w-full justify-center p-8 text-center text-sm text-muted-foreground aria-disabled:opacity-100"
        >
          No winget applications found for &quot;{wingetQuery}&quot;
        </CommandItem>
      ) : (
        packages.map((pkg) => (
          <CommandItem
            key={pkg.Id}
            value={`${pkg.Id} ${pkg.Latest?.Name || ""} ${search}`}
            onSelect={() => onSelectPackage(pkg)}
            className="mx-2 my-1 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-transparent p-3.5 transition-all hover:border-emerald-500/20 hover:bg-emerald-500/5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500 shadow-sm transition-all group-hover:bg-emerald-500 group-hover:text-white">
                <CubeIcon className="h-4 w-4" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">
                  {pkg.Latest?.Name || pkg.Id}
                </span>
                <span className="truncate text-[11px] text-muted-foreground opacity-70">
                  {pkg.Latest?.Publisher || "Unknown"} • {pkg.Id}
                </span>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="h-5 border-none bg-emerald-500/10 px-2 text-[10px] text-emerald-600"
            >
              Winget
            </Badge>
          </CommandItem>
        ))
      )}
    </CommandGroup>
  );
}
