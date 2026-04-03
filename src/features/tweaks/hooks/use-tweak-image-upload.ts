"use client";

import { useEffect, useRef, useState } from "react";

import { toast } from "sonner";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function useTweakImageUpload(
  open: boolean,
  initialImagePreview: string | null | undefined
) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setImageFile(null);
    setImagePreview(initialImagePreview || null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [initialImagePreview, open]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setImageFile(file);

    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      if (typeof fileReader.result === "string") {
        setImagePreview(fileReader.result);
      }
    };
    fileReader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (existingImageUrl?: string | null) => {
    if (!imageFile) {
      return existingImageUrl || null;
    }

    const formData = new FormData();
    formData.append("file", imageFile);

    const response = await fetch("/api/tweaks/upload-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload image");
    }

    const payload = await response.json();
    return (payload.url as string | undefined) || null;
  };

  return {
    fileInputRef,
    imageFile,
    imagePreview,
    setImagePreview,
    handleImageSelect,
    handleRemoveImage,
    uploadImage,
  };
}
