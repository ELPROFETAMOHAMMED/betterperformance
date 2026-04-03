"use client";

import Image from "next/image";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";

import type { TweakCategory } from "@/features/tweaks/types/tweak.types";
import type { TweakFormValues } from "@/features/tweaks/hooks/use-tweak-form";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/cn";

type TweakFormFieldsProps = {
  categories: TweakCategory[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  formData: TweakFormValues;
  imageFile: File | null;
  imagePreview: string | null;
  onImageRemove: () => void;
  onImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onInputChange: <TField extends keyof TweakFormValues>(
    field: TField,
    value: TweakFormValues[TField]
  ) => void;
};

export function TweakFormFields({
  categories,
  fileInputRef,
  formData,
  imageFile,
  imagePreview,
  onImageRemove,
  onImageSelect,
  onInputChange,
}: TweakFormFieldsProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(event) => onInputChange("title", event.target.value)}
          placeholder="Enter tweak title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(event) =>
            onInputChange("description", event.target.value)
          }
          placeholder="Enter tweak description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">
          PowerShell Code <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="code"
          value={formData.code}
          onChange={(event) => onInputChange("code", event.target.value)}
          placeholder="Enter PowerShell code"
          rows={8}
          className="font-mono text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="create_new_category"
            checked={formData.create_new_category}
            onCheckedChange={(checked) =>
              onInputChange("create_new_category", checked === true)
            }
          />
          <Label
            htmlFor="create_new_category"
            className="cursor-pointer font-normal"
          >
            Create new category
          </Label>
        </div>

        {formData.create_new_category ? (
          <div className="space-y-3 border-l-2 border-border pl-6">
            <div className="space-y-2">
              <Label htmlFor="category_name">
                Category Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="category_name"
                value={formData.category_name}
                onChange={(event) =>
                  onInputChange("category_name", event.target.value)
                }
                placeholder="Enter category name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_icon">Category Icon</Label>
              <Input
                id="category_icon"
                value={formData.category_icon}
                onChange={(event) =>
                  onInputChange("category_icon", event.target.value)
                }
                placeholder="Enter icon name or URL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_description">Category Description</Label>
              <Textarea
                id="category_description"
                value={formData.category_description}
                onChange={(event) =>
                  onInputChange("category_description", event.target.value)
                }
                placeholder="Enter category description"
                rows={2}
              />
            </div>
          </div>
        ) : (
          <Select
            value={formData.category_id}
            onValueChange={(value) => onInputChange("category_id", value)}
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

      <div className="space-y-2">
        <Label>Image</Label>
        <div className="space-y-2">
          {imagePreview ? (
            <div className="relative h-48 w-full overflow-hidden rounded-lg border border-border bg-muted/30">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-contain"
                unoptimized
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8"
                onClick={onImageRemove}
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              className={cn(
                "cursor-pointer rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50",
                !imageFile && "bg-muted/30"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <PhotoIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload an image
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Max 5MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onImageSelect}
            className="hidden"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(event) => onInputChange("notes", event.target.value)}
          placeholder="Enter additional notes"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tweak_comment">Author Notes</Label>
        <Textarea
          id="tweak_comment"
          value={formData.tweak_comment}
          onChange={(event) =>
            onInputChange("tweak_comment", event.target.value)
          }
          placeholder="Enter author notes"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="docs">Documentation</Label>
        <Textarea
          id="docs"
          value={formData.docs}
          onChange={(event) => onInputChange("docs", event.target.value)}
          placeholder="Enter documentation URL or content"
          rows={2}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_visible"
          checked={formData.is_visible}
          onCheckedChange={(checked) =>
            onInputChange("is_visible", checked === true)
          }
        />
        <Label htmlFor="is_visible" className="cursor-pointer font-normal">
          Enabled (users can see and use this tweak)
        </Label>
      </div>
    </div>
  );
}
