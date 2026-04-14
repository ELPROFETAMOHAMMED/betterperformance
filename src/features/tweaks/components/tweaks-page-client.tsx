"use client";

import dynamic from "next/dynamic";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import type { TweakCategory } from "@/features/tweaks/types/tweak.types";
import type { WallpapersPageData } from "@/features/wallpapers/types/wallpaper.types";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface TweaksPageClientProps {
  categories: TweakCategory[];
  activeTab?: string;
  wallpapersPageData?: WallpapersPageData | null;
}

const TweaksContent = dynamic(() => import("./tweaks-content"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center py-8">
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-6 w-40 rounded-[var(--radius-md)]" />
        <Skeleton className="h-4 w-64 rounded-[var(--radius-md)]" />
      </div>
    </div>
  ),
});

export default function TweaksPageClient({
  categories,
  activeTab,
  wallpapersPageData,
}: TweaksPageClientProps) {
  if (!categories || categories.length === 0) {
    return (
      <ScrollArea className="h-full w-full">
        <div className="flex flex-col h-full items-center justify-center py-12 gap-4">
          <div className="text-center">
            <p className="text-muted-foreground">No tweaks available in this category</p>
          </div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <TweaksContent categories={categories} activeTab={activeTab} wallpapersPageData={wallpapersPageData} />
  );
}
