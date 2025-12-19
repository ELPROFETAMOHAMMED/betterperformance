"use client";

import { useState, useEffect, useRef } from "react";
import type { Tweak, TweakCategory } from "@/features/tweaks/types/tweak.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { toast } from "sonner";
import { PhotoIcon, XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { cn } from "@/shared/lib/utils";
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

interface TweakFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: TweakCategory[];
  tweak?: Tweak | null;
  onSuccess?: () => void;
}

export function TweakFormDialog({
  open,
  onOpenChange,
  categories,
  tweak,
  onSuccess,
}: TweakFormDialogProps) {
  const isEditMode = !!tweak;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    code: "",
    category_id: "",
    category_name: "",
    category_icon: "",
    category_description: "",
    notes: "",
    tweak_comment: "",
    docs: "",
    is_visible: true,
    create_new_category: false,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset form when dialog opens/closes or tweak changes
  useEffect(() => {
    if (open) {
      if (tweak) {
        // Edit mode: populate with existing tweak data
        const category = categories.find((c) => c.id === tweak.category_id);
        setFormData({
          title: tweak.title || "",
          description: tweak.description || "",
          code: tweak.code || "",
          category_id: tweak.category_id || "",
          category_name: category?.name || "",
          category_icon: category?.icon || "",
          category_description: category?.description || "",
          notes: tweak.notes || "",
          tweak_comment: tweak.tweak_comment || "",
          docs: tweak.docs || "",
          is_visible: tweak.is_visible ?? true,
          create_new_category: false,
        });
        setImagePreview(tweak.image || null);
        setImageFile(null);
      } else {
        // Create mode: reset form
        setFormData({
          title: "",
          description: "",
          code: "",
          category_id: "",
          category_name: "",
          category_icon: "",
          category_description: "",
          notes: "",
          tweak_comment: "",
          docs: "",
          is_visible: true,
          create_new_category: false,
        });
        setImagePreview(null);
        setImageFile(null);
      }
    }
  }, [open, tweak, categories]);

  const handleInputChange = (
    field: string,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!tweak) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/tweaks/${tweak.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete tweak");
      }

      toast.success("Tweak deleted successfully");
      setDeleteDialogOpen(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while deleting the tweak"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.code.trim()) {
      toast.error("PowerShell code is required");
      return;
    }

    if (!formData.create_new_category && !formData.category_id) {
      toast.error("Please select a category or create a new one");
      return;
    }

    if (formData.create_new_category && !formData.category_name.trim()) {
      toast.error("Category name is required when creating a new category");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl: string | null = null;

      // Upload image if a new file is selected
      if (imageFile) {
        const formDataImage = new FormData();
        formDataImage.append("file", imageFile);

        const uploadResponse = await fetch("/api/tweaks/upload-image", {
          method: "POST",
          body: formDataImage,
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.error || "Failed to upload image");
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      } else if (tweak?.image && !imageFile) {
        // Keep existing image if no new file is selected
        imageUrl = tweak.image;
      }

      type TweakPayload = {
        title: string;
        description: string | null;
        code: string;
        notes: string | null;
        tweak_comment: string | null;
        docs: string | null;
        is_visible: boolean;
        image: string | null;
        category_id?: string;
        category_name?: string;
        category_icon?: string | null;
        category_description?: string | null;
      };

      const payload: TweakPayload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        code: formData.code.trim(),
        notes: formData.notes.trim() || null,
        tweak_comment: formData.tweak_comment.trim() || null,
        docs: formData.docs.trim() || null,
        is_visible: formData.is_visible,
        image: imageUrl,
      };

      if (formData.create_new_category) {
        payload.category_name = formData.category_name.trim();
        payload.category_icon = formData.category_icon.trim() || null;
        payload.category_description =
          formData.category_description.trim() || null;
      } else {
        payload.category_id = formData.category_id;
      }

      const url = isEditMode
        ? `/api/tweaks/${tweak.id}`
        : "/api/tweaks";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save tweak");
      }

      toast.success(
        isEditMode
          ? "Tweak updated successfully"
          : "Tweak created successfully"
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while saving the tweak"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Tweak" : "Create New Tweak"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the tweak information below."
              : "Fill in the information below to create a new tweak."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter tweak title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                handleInputChange("description", e.target.value)
              }
              placeholder="Enter tweak description"
              rows={3}
            />
          </div>

          {/* PowerShell Code */}
          <div className="space-y-2">
            <Label htmlFor="code">
              PowerShell Code <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="code"
              value={formData.code}
              onChange={(e) => handleInputChange("code", e.target.value)}
              placeholder="Enter PowerShell code"
              rows={8}
              className="font-mono text-xs"
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="create_new_category"
                checked={formData.create_new_category}
                onCheckedChange={(checked) =>
                  handleInputChange("create_new_category", checked === true)
                }
              />
              <Label
                htmlFor="create_new_category"
                className="font-normal cursor-pointer"
              >
                Create new category
              </Label>
            </div>

            {formData.create_new_category ? (
              <div className="space-y-3 pl-6 border-l-2 border-border">
                <div className="space-y-2">
                  <Label htmlFor="category_name">
                    Category Name{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="category_name"
                    value={formData.category_name}
                    onChange={(e) =>
                      handleInputChange("category_name", e.target.value)
                    }
                    placeholder="Enter category name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category_icon">Category Icon</Label>
                  <Input
                    id="category_icon"
                    value={formData.category_icon}
                    onChange={(e) =>
                      handleInputChange("category_icon", e.target.value)
                    }
                    placeholder="Enter icon name or URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category_description">
                    Category Description
                  </Label>
                  <Textarea
                    id="category_description"
                    value={formData.category_description}
                    onChange={(e) =>
                      handleInputChange(
                        "category_description",
                        e.target.value
                      )
                    }
                    placeholder="Enter category description"
                    rows={2}
                  />
                </div>
              </div>
            ) : (
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  handleInputChange("category_id", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Image</Label>
            <div className="space-y-2">
              {imagePreview ? (
                <div className="relative w-full h-48 border border-border rounded-lg overflow-hidden bg-muted/30">
                  {imagePreview.startsWith("data:") ? (
                    // Use img tag for data URLs (Next.js Image doesn't support data URLs well)
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    // Use Next Image for URLs
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={handleRemoveImage}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className={cn(
                    "border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors",
                    !imageFile && "bg-muted/30"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <PhotoIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload an image
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max 5MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Enter additional notes"
              rows={2}
            />
          </div>

          {/* Tweak Comment */}
          <div className="space-y-2">
            <Label htmlFor="tweak_comment">Author Notes</Label>
            <Textarea
              id="tweak_comment"
              value={formData.tweak_comment}
              onChange={(e) =>
                handleInputChange("tweak_comment", e.target.value)
              }
              placeholder="Enter author notes"
              rows={2}
            />
          </div>

          {/* Docs */}
          <div className="space-y-2">
            <Label htmlFor="docs">Documentation</Label>
            <Textarea
              id="docs"
              value={formData.docs}
              onChange={(e) => handleInputChange("docs", e.target.value)}
              placeholder="Enter documentation URL or content"
              rows={2}
            />
          </div>

          {/* Visibility */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_visible"
              checked={formData.is_visible}
              onCheckedChange={(checked) =>
                handleInputChange("is_visible", checked === true)
              }
            />
            <Label htmlFor="is_visible" className="font-normal cursor-pointer">
              Enabled (users can see and use this tweak)
            </Label>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div>
            {isEditMode && (
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isSubmitting || isDeleting}
                className="mr-auto"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isDeleting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || isDeleting}>
              {isSubmitting
                ? "Saving..."
                : isEditMode
                  ? "Update Tweak"
                  : "Create Tweak"}
            </Button>
          </div>
        </DialogFooter>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Tweak</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{tweak?.title}&quot;? This action
                cannot be undone and will permanently remove the tweak from the
                system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                asChild
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                <Button onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}

