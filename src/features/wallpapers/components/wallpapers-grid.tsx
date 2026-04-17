"use client";

import { useRouter } from "next/navigation";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

import { WallpaperCard } from "@/features/wallpapers/components/wallpaper-card";
import { downloadWallpaperScript } from "@/features/wallpapers/services/download-wallpaper-script";
import type { Wallpaper, WallpapersPageData } from "@/features/wallpapers/types/wallpaper.types";
import { useSelection } from "@/features/tweaks/context/selection-context";
import { Card } from "@/shared/components/ui/card";
import { useUser } from "@/shared/hooks/use-user";

type WallpapersGridProps = {
  pageData: WallpapersPageData;
};

export function WallpapersGrid({ pageData }: WallpapersGridProps) {
  const router = useRouter();
  const { user } = useUser();
  const isAdmin = user?.user_metadata.role === "admin";
  const { selectedWallpapersSet, toggleWallpaper } = useSelection();

  const handleDownloadSingle = async (wallpaper: Wallpaper) => {
    try {
      await downloadWallpaperScript({
        wallpaperIds: [wallpaper.id],
        lastSelectedId: wallpaper.id,
      });
      toast.success(`Script ready for ${wallpaper.title}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to download wallpaper script");
    }
  };

  if (pageData.items.length === 0) {
    return (
      <Card className="rounded-[var(--radius-md)] border border-border/20 bg-card/60 p-10 text-center">
        <PhotoIcon className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">No wallpapers yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload the first wallpaper to start building the gallery.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 m-12">
      {pageData.items.map((wallpaper) => (
        <WallpaperCard
          key={wallpaper.id}
          wallpaper={wallpaper}
          isAdmin={isAdmin}
          isSelected={selectedWallpapersSet.has(wallpaper.id)}
          onDeleted={() => router.refresh()}
          onDownload={handleDownloadSingle}
          onToggleSelected={toggleWallpaper}
        />
      ))}
    </div>
  );
}
