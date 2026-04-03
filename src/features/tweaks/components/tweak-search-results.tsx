"use client";

import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/shared/components/ui/command";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import type { Tweak, TweakCategory } from "@/features/tweaks/types/tweak.types";
import {
  CommandLineIcon,
  CubeIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

type SearchableTweak = Tweak & { categoryName: string };

type TweakSearchResultsProps = {
  categories: TweakCategory[];
  isWingetSearch: boolean;
  search: string;
  topMatches: SearchableTweak[];
  onSearchChange: (value: string) => void;
  onSelectTweak: (tweak: Tweak) => void;
};

export function TweakSearchResults({
  categories,
  isWingetSearch,
  search,
  topMatches,
  onSearchChange,
  onSelectTweak,
}: TweakSearchResultsProps) {
  if (isWingetSearch) {
    return null;
  }

  return (
    <>
      {!search && (
        <div className="mx-2 my-2 flex items-start gap-4 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4 transition-all hover:bg-emerald-500/10">
          <div className="shrink-0 rounded-xl bg-emerald-500/20 p-3 text-emerald-600">
            <CubeIcon className="h-6 w-6 animate-bounce" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-emerald-700">Did you know?</h4>
            <p className="text-xs leading-relaxed text-emerald-600/80">
              You can search and install over <span className="font-bold underline">10,000+ official Windows apps</span> directly from this search bar.
              Just type <code className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono font-bold text-emerald-700">@winget</code> followed by the app name.
            </p>
          </div>
        </div>
      )}

      {search && (
        <CommandEmpty>
          <div className="flex flex-col items-center justify-center p-4">
            <span>No results found for &quot;{search}&quot;.</span>
            <Button
              onClick={() => onSearchChange(`@winget ${search}`)}
              variant="ghost"
              className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-500 transition-all hover:bg-emerald-500/20 hover:text-emerald-500"
            >
              <CubeIcon className="h-4 w-4" />
              Search for &quot;{search}&quot; as an application
            </Button>
          </div>
        </CommandEmpty>
      )}

      {search.length >= 2 && (
        <CommandGroup heading="Discovery">
          <CommandItem
            onSelect={() => onSearchChange(`@winget ${search}`)}
            className="mx-2 my-1 flex cursor-pointer items-center gap-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-3 transition-all hover:bg-emerald-500/10"
          >
            <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-600">
              <CubeIcon className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-emerald-700">
                Search for &quot;{search}&quot; as an app
              </span>
              <span className="text-[10px] italic text-emerald-600/70">
                Tip: Use @winget prefix to find official Windows applications
              </span>
            </div>
          </CommandItem>
        </CommandGroup>
      )}

      {topMatches.length > 0 && (
        <CommandGroup heading="Top Matches">
          {topMatches.map((tweak) => (
            <CommandItem
              key={`top-${tweak.id}`}
              onSelect={() => onSelectTweak(tweak)}
              className="mx-2 my-1 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-transparent p-3.5 transition-all hover:border-primary/20 hover:bg-primary/5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary shadow-sm transition-all group-hover:bg-primary group-hover:text-white">
                  <SparklesIcon className="h-4 w-4" />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold">{tweak.title}</span>
                  <span className="truncate text-[11px] text-muted-foreground opacity-70">
                    {tweak.categoryName} • {tweak.description || "System Optimization"}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="secondary" className="h-5 border-none bg-muted/50 px-2 text-[10px]">
                  {tweak.download_count} DLs
                </Badge>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {categories.map((category) => (
        <CommandGroup key={category.id} heading={category.name}>
          {category.tweaks?.map((tweak) => (
            <CommandItem
              key={tweak.id}
              onSelect={() => onSelectTweak(tweak)}
              className="mx-1 flex cursor-pointer items-center justify-between gap-3 rounded-lg p-3 transition-all"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-lg bg-muted p-1.5 text-muted-foreground transition-all group-hover:bg-primary/10 group-hover:text-primary">
                  <CommandLineIcon className="h-4 w-4" />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{tweak.title}</span>
                </div>
              </div>
              <Badge variant="outline" className="text-[9px] opacity-40 transition-opacity group-hover:opacity-100">
                {category.name}
              </Badge>
            </CommandItem>
          ))}
        </CommandGroup>
      ))}
    </>
  );
}
