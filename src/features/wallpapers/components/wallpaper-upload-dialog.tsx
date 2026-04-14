"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { CloudArrowUpIcon, PhotoIcon } from "@heroicons/react/24/outline";

import { useWallpaperUpload } from "@/features/wallpapers/hooks/use-wallpaper-upload";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

type WallpaperUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function WallpaperUploadDialog({
  open,
  onOpenChange,
}: WallpaperUploadDialogProps) {
  const router = useRouter();
  const {
    file,
    fileSizeBytes,
    height,
    inputRef,
    isSubmitting,
    previewUrl,
    reset,
    setSelectedFile,
    setTagsInput,
    setTitle,
    submit,
    tagsInput,
    title,
    width,
  } = useWallpaperUpload();

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      reset();
    }
  };

  const handleSubmit = async () => {
    const success = await submit();

    if (success) {
      handleOpenChange(false);
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-border/40 bg-card/95 shadow-sm backdrop-blur-md sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload wallpaper</DialogTitle>
          <DialogDescription>
            Add a new Windows wallpaper to the gallery. Image metadata is extracted automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallpaper-title">Title</Label>
              <Input
                id="wallpaper-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Windows 11 Bloom Night"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallpaper-tags">Tags</Label>
              <Input
                id="wallpaper-tags"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder="windows 11, bloom, dark"
              />
            </div>

            <div className="space-y-2">
              <Label>Wallpaper file</Label>
              <Card
                className="flex min-h-52 cursor-pointer flex-col items-center justify-center gap-3 border-dashed border-border/50 bg-muted/20 p-6 text-center transition-all duration-200 hover:border-primary/50 hover:bg-muted/40"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  void setSelectedFile(event.dataTransfer.files[0] || null);
                }}
                onClick={() => inputRef.current?.click()}
              >
                <CloudArrowUpIcon className="h-10 w-10 text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    Drag and drop a wallpaper here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Or use the file picker to upload a PNG, JPG, or WEBP image.
                  </p>
                </div>
                <Button variant="secondary" type="button">
                  Choose file
                </Button>
              </Card>
              <Input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => {
                  void setSelectedFile(event.target.files?.[0] || null);
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Card className="overflow-hidden border-border/40 bg-muted/20 p-0">
              <div className="relative aspect-[4/3] w-full">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt={title || "Wallpaper preview"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted/30">
                    <PhotoIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>
            </Card>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{width && height ? `${width} × ${height}` : "Resolution pending"}</Badge>
              <Badge variant="outline">
                {fileSizeBytes ? `${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB` : "File size pending"}
              </Badge>
              <Badge variant="outline">{file ? file.type : "Image type pending"}</Badge>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={isSubmitting || !file || !title.trim() || !width || !height}>
            {isSubmitting ? "Uploading..." : "Upload wallpaper"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
