"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Edit, Eye, Save, X } from "lucide-react";

interface EditModeToggleProps {
  isEditMode: boolean;
  hasUnsavedChanges: boolean;
  onToggleMode: () => void;
  onSaveAndPreview: () => void;
  onDiscardAndPreview: () => void;
}

export function EditModeToggle({ 
  isEditMode, 
  hasUnsavedChanges,
  onToggleMode, 
  onSaveAndPreview,
  onDiscardAndPreview,
}: EditModeToggleProps) {
  // If in edit mode with unsaved changes, show Save and Discard buttons
  if (isEditMode && hasUnsavedChanges) {
    return (
      <div className="absolute bottom-2 right-2 z-50 flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="icon"
              className="h-9 w-9 rounded-lg shadow-lg bg-primary hover:bg-primary/90"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onSaveAndPreview();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
            >
              <Save className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-xs">Save changes and switch to preview</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              className="h-9 w-9 rounded-lg shadow-lg hover:bg-destructive/90"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDiscardAndPreview();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-xs">Discard changes and switch to preview</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  // Default toggle button (no unsaved changes or in preview mode)
  return (
    <div className="absolute bottom-2 right-2 z-50">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg shadow-lg bg-background border-border/60 hover:bg-accent hover:border-border"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onToggleMode();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            {isEditMode ? (
              <Eye className="h-4 w-4" />
            ) : (
              <Edit className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p className="text-xs">
            {isEditMode ? "Switch to preview mode" : "Switch to edit mode"}
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

