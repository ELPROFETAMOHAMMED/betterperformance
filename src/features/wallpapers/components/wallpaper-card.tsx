"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import {
  ArrowDownTrayIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

import { deleteWallpaperAction } from "@/features/wallpapers/actions/delete-wallpaper";
import type { Wallpaper } from "@/features/wallpapers/types/wallpaper.types";
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

  return (
    <>
      <Card
        className={cn(
          "group overflow-hidden rounded-[var(--radius-md)] border border-border/20 bg-card/60 transition-colors hover:bg-card/80",
          isSelected && "border-primary/40 ring-2 ring-primary/60"
        )}
        onClick={() => onToggleSelected(wallpaper)}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <Image
            src={wallpaper.public_url}
            alt={wallpaper.title}
            fill
            className="object-cover"
            unoptimized
          />

          <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity group-hover:opacity-100" />

          <div className="absolute left-2 top-2 z-10">
            <div className="rounded-[var(--radius-md)] border border-border/30 bg-background/80 p-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelected(wallpaper)}
                aria-label={`Select ${wallpaper.title}`}
                onClick={(event) => event.stopPropagation()}
              />
            </div>
          </div>

          <div className="absolute right-2 top-2 z-10 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-[var(--radius-md)]"
              onClick={(event) => {
                event.stopPropagation();
                onDownload(wallpaper);
              }}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </Button>
            {isAdmin ? (
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-[var(--radius-md)] text-destructive"
                onClick={(event) => {
                  event.stopPropagation();
                  setDeleteDialogOpen(true);
                }}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/20 bg-background/60 px-2.5 py-2">
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{wallpaper.title}</p>
          <Badge variant="secondary" className="h-6 rounded-[var(--radius-md)] px-2 text-xs font-medium">
            {wallpaper.resolution}
          </Badge>
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
