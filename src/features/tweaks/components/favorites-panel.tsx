"use client";

import { PhotoIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

import { useFavorites } from "@/features/favorites/hooks/use-favorites";
import { useSelection } from "@/features/tweaks/context/selection-context";
import { downloadSelectionScript } from "@/features/tweaks/services/download-selection-script";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";

export function FavoritesPanel() {
  const { favorites, isLoading } = useFavorites();
  const {
    toggleTweak,
    toggleWallpaper,
    clearSelection,
  } = useSelection();

  const handleApplyFavorite = async (favoriteId: string) => {
    const favorite = favorites.find((item) => item.id === favoriteId);
    if (!favorite) {
      return;
    }

    clearSelection();
    favorite.selection.items.forEach((item) => {
      if (item.type === "tweak") {
        toggleTweak(item.item);
        return;
      }

      toggleWallpaper(item.item);
    });

    try {
      downloadSelectionScript(favorite.selection.items, {
        encodingUtf8: true,
        autoCreateRestorePoint: true,
      });
      toast.success(`Script ready for ${favorite.selection.name}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate script");
    }
  };

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto p-4 md:p-5 lg:p-6">
        <Card className="border-border/30 bg-muted/20 p-8 text-center">Loading favorites...</Card>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="h-full overflow-y-auto p-4 md:p-5 lg:p-6">
        <Card className="border-border/30 bg-muted/20 p-12 text-center shadow-sm backdrop-blur-sm">
          <PhotoIcon className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">No favorites yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Save a selection from history and it will appear here.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-5 lg:p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">Favorites</span>
          <Separator className="flex-1" />
        </div>

        <div className="space-y-3">
          {favorites.map((favorite) => (
            <Card key={favorite.id} className="border-border/30 bg-card/70 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-foreground">
                    {favorite.selection.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {favorite.selection.items.length} item{favorite.selection.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleApplyFavorite(favorite.id)}>
                  Apply
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {favorite.selection.items.slice(0, 6).map((item) => (
                  <Badge key={`${item.type}:${item.id}`} variant="secondary" className="max-w-full truncate text-[11px]">
                    {item.item.title}
                  </Badge>
                ))}
                {favorite.selection.items.length > 6 ? (
                  <Badge variant="outline" className="text-[11px]">
                    +{favorite.selection.items.length - 6} more
                  </Badge>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
