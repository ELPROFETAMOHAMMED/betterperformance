"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import {
  ArrowDownTrayIcon,
  PhotoIcon,
  StarIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";

import { deleteWallpaperAction } from "@/features/wallpapers/actions/delete-wallpaper";
import { useFavorites } from "@/features/favorites/hooks/use-favorites";
import type { Wallpaper } from "@/features/wallpapers/types/wallpaper.types";
import { AspectRatio } from "@/shared/components/ui/aspect-ratio";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { cn } from "@/shared/lib/cn";
import { toast } from "sonner";

function formatFileSize(fileSizeBytes: number | null) {
  if (!fileSizeBytes) {
    return "Unknown size";
  }

  const units = ["B", "KB", "MB", "GB"];
  let value = fileSizeBytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

type WallpaperCardProps = {
  isAdmin: boolean;
  isSelected: boolean;
  wallpaper: Wallpaper;
  onDeleted: () => void;
  onDownload: (wallpaper: Wallpaper) => void;
  onToggleSelected: (wallpaper: Wallpaper) => void;
};

export function WallpaperCard({
  isAdmin,
  isSelected,
  wallpaper,
  onDeleted,
  onDownload,
  onToggleSelected,
}: WallpaperCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isTogglingFavorite, startFavoriteTransition] = useTransition();
  const { favoriteWallpaperIds, toggleFavorite } = useFavorites();
  const isFavorite = favoriteWallpaperIds.has(wallpaper.id);

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteWallpaperAction(wallpaper.id);

      if (!result.success) {
        toast.error(result.error || "Failed to delete wallpaper");
        return;
      }

      toast.success("Wallpaper deleted successfully");
      setDeleteDialogOpen(false);
      onDeleted();
    });
  };

  const handleToggleFavorite = () => {
    startFavoriteTransition(async () => {
      try {
        const result = await toggleFavorite({
          itemType: "wallpaper",
          itemId: wallpaper.id,
        });

        toast.success(result.isFavorite ? "Added to favorites" : "Removed from favorites");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update favorite");
      }
    });
  };

  return (
    <>
      <Card
        className={cn(
          "group overflow-hidden border-border/30 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-primary/50 hover:bg-muted/30",
          isSelected && "border-primary/60 ring-1 ring-primary/20"
        )}
        onClick={() => onToggleSelected(wallpaper)}
      >
        <div className="relative">
          <AspectRatio ratio={16 / 10}>
            <Image
              src={wallpaper.public_url}
              alt={wallpaper.title}
              fill
              className="object-cover"
              unoptimized
            />
          </AspectRatio>

          <div className="absolute left-3 top-3 flex items-center gap-2">
            <div className="rounded-full border border-border/40 bg-background/80 p-1.5 backdrop-blur-sm">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelected(wallpaper)}
                aria-label={`Select ${wallpaper.title}`}
                onClick={(event) => event.stopPropagation()}
              />
            </div>
          </div>

          <div className="absolute right-3 top-3 flex items-center gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
            <Button
              variant="secondary"
              size="icon"
              className="backdrop-blur-sm"
              disabled={isTogglingFavorite}
              onClick={(event) => {
                event.stopPropagation();
                handleToggleFavorite();
              }}
            >
              {isFavorite ? <StarSolidIcon className="h-4 w-4 text-yellow-500" /> : <StarIcon className="h-4 w-4" />}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="backdrop-blur-sm"
              onClick={(event) => {
                event.stopPropagation();
                onDownload(wallpaper);
              }}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </Button>
            {isAdmin && (
              <Button
                variant="secondary"
                size="icon"
                className="text-destructive backdrop-blur-sm"
                onClick={(event) => {
                  event.stopPropagation();
                  setDeleteDialogOpen(true);
                }}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3 p-4">
          <div className="space-y-1">
            <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
              {wallpaper.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {wallpaper.resolution} · {formatFileSize(wallpaper.file_size_bytes)}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="outline">
              <PhotoIcon className="mr-1 h-3.5 w-3.5" />
              Wallpaper
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onToggleSelected(wallpaper);
              }}
            >
              {isSelected ? "Selected" : "Select"}
            </Button>
          </div>
        </div>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete wallpaper</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{wallpaper.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              asChild
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Button onClick={handleDelete}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
