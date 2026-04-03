"use client";

import { useState, useEffect } from "react";
import type { TweakCategory, Tweak } from "@/features/tweaks/types/tweak.types";
import { CategoryDeleteDialog } from "@/features/tweaks/components/category-delete-dialog";
import { CategoryTweakDeleteDialog } from "@/features/tweaks/components/category-tweak-delete-dialog";
import { CategoryTweaksPanel } from "@/features/tweaks/components/category-tweaks-panel";
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
import { toast } from "sonner";
import DynamicIcon from "@/shared/components/common/dynamic-icon";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: TweakCategory | null;
  onSuccess?: () => void;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [deleteTweakDialogOpen, setDeleteTweakDialogOpen] = useState(false);
  const [tweakToDelete, setTweakToDelete] = useState<Tweak | null>(null);
  const [isDeletingTweak, setIsDeletingTweak] = useState(false);

  // Reset form when dialog opens/closes or category changes
  useEffect(() => {
    if (open && category) {
      setFormData({
        name: category.name || "",
        icon: category.icon || "",
        description: category.description || "",
      });
    } else if (!open) {
      setFormData({
        name: "",
        icon: "",
        description: "",
      });
      setTweakToDelete(null);
    }
  }, [open, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tweaks/categories/${category.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          icon: formData.icon.trim() || null,
          description: formData.description.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update category");
      }

      toast.success("Category updated successfully");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTweak = async () => {
    if (!tweakToDelete) return;

    setIsDeletingTweak(true);
    try {
      const response = await fetch(`/api/tweaks/${tweakToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete tweak");
      }

      toast.success("Tweak deleted successfully");
      onSuccess?.();
      setDeleteTweakDialogOpen(false);
      setTweakToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete tweak");
    } finally {
      setIsDeletingTweak(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!category) return;

    setIsDeletingCategory(true);
    try {
      const response = await fetch(`/api/tweaks/categories/${category.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete category");
      }

      toast.success("Category and all its tweaks deleted successfully");
      onSuccess?.();
      setDeleteCategoryDialogOpen(false);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete category");
    } finally {
      setIsDeletingCategory(false);
    }
  };

  if (!category) return null;

  const tweaks = category.tweaks || [];
  const tweakCount = tweaks.length;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Manage category information and its tweaks.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Category name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-icon">Icon (Heroicons name)</Label>
                <Input
                  id="category-icon"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, icon: e.target.value }))
                  }
                  placeholder="e.g., academic-cap, folder, etc."
                />
                {formData.icon && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">Preview:</span>
                    <DynamicIcon name={formData.icon} className="h-5 w-5" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-description">Description</Label>
                <Textarea
                  id="category-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Category description"
                  rows={3}
                />
              </div>
            </div>

            {/* Tweaks List */}
            <CategoryTweaksPanel
              tweaks={tweaks}
              onDeleteTweak={(tweak) => {
                setTweakToDelete(tweak);
                setDeleteTweakDialogOpen(true);
              }}
            />

            <DialogFooter className="flex items-center justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteCategoryDialogOpen(true)}
                disabled={isSubmitting || isDeletingCategory}
              >
                Delete Category
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting || isDeletingCategory}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isDeletingCategory}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Tweak Confirmation */}
      <CategoryTweakDeleteDialog
        open={deleteTweakDialogOpen}
        onOpenChange={setDeleteTweakDialogOpen}
        onConfirm={handleDeleteTweak}
        isDeleting={isDeletingTweak}
        tweakTitle={tweakToDelete?.title}
      />

      <CategoryDeleteDialog
        open={deleteCategoryDialogOpen}
        onOpenChange={setDeleteCategoryDialogOpen}
        onConfirm={handleDeleteCategory}
        isDeleting={isDeletingCategory}
        categoryName={category.name}
        tweakCount={tweakCount}
      />
    </>
  );
}

