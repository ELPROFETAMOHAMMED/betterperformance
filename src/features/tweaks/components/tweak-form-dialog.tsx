"use client";

import { useState } from "react";
import { TweakFormFields } from "@/features/tweaks/components/tweak-form-fields";
import { useTweakForm } from "@/features/tweaks/hooks/use-tweak-form";
import { useTweakImageUpload } from "@/features/tweaks/hooks/use-tweak-image-upload";
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
import { toast } from "sonner";
import { TrashIcon } from "@heroicons/react/24/outline";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { formData, handleInputChange } = useTweakForm(open, tweak, categories);
  const {
    fileInputRef,
    imageFile,
    imagePreview,
    handleImageSelect,
    handleRemoveImage,
    uploadImage,
  } = useTweakImageUpload(open, tweak?.image || null);

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
      const imageUrl = await uploadImage(tweak?.image || null);

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

        <TweakFormFields
          categories={categories}
          formData={formData}
          onInputChange={handleInputChange}
          fileInputRef={fileInputRef}
          imageFile={imageFile}
          imagePreview={imagePreview}
          onImageSelect={handleImageSelect}
          onImageRemove={handleRemoveImage}
        />

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

