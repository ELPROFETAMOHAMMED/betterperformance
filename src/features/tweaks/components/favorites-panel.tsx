"use client";

import { useRouter } from "next/navigation";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

import { useFavorites } from "@/features/favorites/hooks/use-favorites";
import { TweakItem } from "@/features/tweaks/components/tweak-item";
import { useSelection } from "@/features/tweaks/context/selection-context";
import { WallpaperCard } from "@/features/wallpapers/components/wallpaper-card";
import { downloadWallpaperScript } from "@/features/wallpapers/services/download-wallpaper-script";
import type { Wallpaper } from "@/features/wallpapers/types/wallpaper.types";
import { Card } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { useUser } from "@/shared/hooks/use-user";

export function FavoritesPanel() {
  const router = useRouter();
  const { user } = useUser();
  const { favorites, isLoading } = useFavorites();
  const { selectedTweaksSet, selectedWallpapersSet, toggleTweak, toggleWallpaper } = useSelection();
  const isAdmin = user?.user_metadata.role === "admin";

  const tweaks = favorites
    .filter((favorite) => favorite.itemType === "tweak" && favorite.tweak)
    .map((favorite) => favorite.tweak)
    .filter((tweak): tweak is NonNullable<typeof tweak> => Boolean(tweak));

  const wallpapers = favorites
    .filter((favorite) => favorite.itemType === "wallpaper" && favorite.wallpaper)
    .map((favorite) => favorite.wallpaper)
    .filter((wallpaper): wallpaper is NonNullable<typeof wallpaper> => Boolean(wallpaper));

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

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto p-4 md:p-5 lg:p-6">
        <Card className="border-border/30 bg-muted/20 p-8 text-center">Loading favorites...</Card>
      </div>
    );
  }

  if (tweaks.length === 0 && wallpapers.length === 0) {
    return (
      <div className="h-full overflow-y-auto p-4 md:p-5 lg:p-6">
        <Card className="border-border/30 bg-muted/20 p-12 text-center shadow-sm backdrop-blur-sm">
          <PhotoIcon className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">No favorites yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add tweaks or wallpapers to favorites and they will appear here.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-5 lg:p-6">
      <div className="space-y-6">
        {tweaks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">Tweaks</span>
              <Separator className="flex-1" />
            </div>
            <Card className="border-border/30 bg-card/70 py-2">
              {tweaks.map((tweak) => (
                <TweakItem
                  key={tweak.id}
                  tweak={tweak}
                  selected={selectedTweaksSet.has(tweak.id)}
                  onToggle={() => toggleTweak(tweak)}
                  isAdmin={isAdmin}
                />
              ))}
            </Card>
          </div>
        )}

        {wallpapers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">Wallpapers</span>
              <Separator className="flex-1" />
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {wallpapers.map((wallpaper) => (
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
          </div>
        )}
      </div>
    </div>
  );
}
