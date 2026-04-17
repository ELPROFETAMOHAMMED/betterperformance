"use client";

import { useState } from "react";
import { PhotoIcon, PlusIcon } from "@heroicons/react/24/outline";

import { WallpaperUploadDialog } from "@/features/wallpapers/components/wallpaper-upload-dialog";
import { useUser } from "@/shared/hooks/use-user";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";

type WallpapersHeaderProps = {
  total: number;
  className?: string;
};

export function WallpapersHeader({ total, className }: WallpapersHeaderProps) {
  const { user } = useUser();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const isAdmin = user?.user_metadata.role === "admin";

  return (
    <>
      <div className={`sticky top-0 w-full z-20 flex h-14 items-center justify-between border-b border-border/20 bg-background/50 px-3 backdrop-blur-xl ${className}`}>
        <div className="flex items-center gap-2 p-4">
          <PhotoIcon className="h-4 w-4 text-primary" />
          <h1 className="text-base font-semibold tracking-tight text-foreground">Wallpapers Gallery</h1>
          <Badge variant="secondary" className="h-6 rounded-[var(--radius-md)] px-2 text-xs font-medium">
            {total}
          </Badge>
        </div>

        {isAdmin ? (
          <Button className="h-8" size="sm" onClick={() => setUploadDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Upload
          </Button>
        ) : null}
      </div>

      <WallpaperUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </>
  );
}
