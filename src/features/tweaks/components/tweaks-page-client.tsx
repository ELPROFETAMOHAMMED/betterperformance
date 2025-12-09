"use client";

import TweaksContent from "./tweaks-content";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import type { TweakCategory } from "@/features/tweaks/types/tweak.types";

interface TweaksPageClientProps {
  categories: TweakCategory[];
}

export default function TweaksPageClient({ categories }: TweaksPageClientProps) {
  if (!categories || categories.length === 0) {
    return (
      <ScrollArea className="h-full w-full">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">No tweaks available</p>
          </div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full w-full">
      <TweaksContent categories={categories} />
    </ScrollArea>
  );
}



