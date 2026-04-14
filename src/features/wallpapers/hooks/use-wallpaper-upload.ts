"use client";

import { useEffect, useRef, useState } from "react";

import { toast } from "sonner";

const MAX_WALLPAPER_SIZE_BYTES = 25 * 1024 * 1024;

type WallpaperMetadata = {
  fileSizeBytes: number;
  height: number;
  previewUrl: string;
  width: number;
};

async function readWallpaperMetadata(file: File): Promise<WallpaperMetadata> {
  const previewUrl = URL.createObjectURL(file);

  const dimensions = await new Promise<{ width: number; height: number }>(
    (resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        resolve({ width: image.width, height: image.height });
      };
      image.onerror = () => {
        reject(new Error("Failed to read wallpaper dimensions"));
      };
      image.src = previewUrl;
    }
  );

  return {
    fileSizeBytes: file.size,
    height: dimensions.height,
    previewUrl,
    width: dimensions.width,
  };
}

export function useWallpaperUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileSizeBytes, setFileSizeBytes] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [title, setTitle] = useState("");
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const reset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(null);
    setFileSizeBytes(null);
    setHeight(null);
    setPreviewUrl(null);
    setTagsInput("");
    setTitle("");
    setWidth(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const setSelectedFile = async (nextFile: File | null) => {
    if (!nextFile) {
      return;
    }

    if (!nextFile.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (nextFile.size > MAX_WALLPAPER_SIZE_BYTES) {
      toast.error("Wallpaper file size must be 25MB or less");
      return;
    }

    try {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const metadata = await readWallpaperMetadata(nextFile);
      setFile(nextFile);
      setFileSizeBytes(metadata.fileSizeBytes);
      setHeight(metadata.height);
      setPreviewUrl(metadata.previewUrl);
      setWidth(metadata.width);

      if (!title.trim()) {
        const inferredTitle = nextFile.name.replace(/\.[^/.]+$/, "");
        setTitle(inferredTitle);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to read wallpaper"
      );
    }
  };

  const submit = async () => {
    if (!file || !title.trim() || !width || !height || !fileSizeBytes) {
      toast.error("Wallpaper title and file metadata are required");
      return false;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("file", file);
      formData.append("width", String(width));
      formData.append("height", String(height));
      formData.append("file_size_bytes", String(fileSizeBytes));
      formData.append("tags", tagsInput);

      const response = await fetch("/api/wallpapers", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to upload wallpaper");
      }

      toast.success("Wallpaper uploaded successfully");
      reset();
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload wallpaper"
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
}
