"use client";

import { useState } from "react";
import { PhotoIcon, PlusIcon } from "@heroicons/react/24/outline";

import { WallpaperUploadDialog } from "@/features/wallpapers/components/wallpaper-upload-dialog";
import { useUser } from "@/shared/hooks/use-user";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

type WallpapersHeaderProps = {
  total: number;
};

export function WallpapersHeader({ total }: WallpapersHeaderProps) {
  const { user } = useUser();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const isAdmin = user?.user_metadata.role === "admin";

  return (
    <>
      <Card className="border-border/40 bg-card/80 p-6 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <PhotoIcon className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Windows Wallpapers Gallery
              </h1>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              Explore curated Windows wallpapers, select multiple backgrounds for batch download, and generate a PowerShell script that applies the last selected wallpaper automatically.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="h-8 rounded-full px-3 text-xs font-semibold">
              {total} wallpapers
            </Badge>
            {isAdmin && (
              <Button onClick={() => setUploadDialogOpen(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Upload wallpaper
              </Button>
            )}
          </div>
        </div>
      </Card>

      <WallpaperUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </>
  );
}
