"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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
  const [saveTooltipOpen, setSaveTooltipOpen] = useState(false);
  const [discardTooltipOpen, setDiscardTooltipOpen] = useState(false);
  const [toggleTooltipOpen, setToggleTooltipOpen] = useState(false);

  // If in edit mode with unsaved changes, show Save and Discard buttons
  if (isEditMode && hasUnsavedChanges) {
    return (
      <div className="absolute bottom-2 right-2 z-50 flex gap-2">
        <TooltipProvider delayDuration={500} skipDelayDuration={0}>
          <Tooltip open={saveTooltipOpen} onOpenChange={setSaveTooltipOpen}>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="icon"
                className="h-9 w-9 rounded-lg shadow-lg bg-primary hover:bg-primary/90"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setSaveTooltipOpen(false);
                  onSaveAndPreview();
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                onMouseEnter={() => setSaveTooltipOpen(true)}
                onMouseLeave={() => setSaveTooltipOpen(false)}
              >
                <Save className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="text-xs">Save changes and switch to preview</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip open={discardTooltipOpen} onOpenChange={setDiscardTooltipOpen}>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="h-9 w-9 rounded-lg shadow-lg hover:bg-destructive/90"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setDiscardTooltipOpen(false);
                  onDiscardAndPreview();
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                onMouseEnter={() => setDiscardTooltipOpen(true)}
                onMouseLeave={() => setDiscardTooltipOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="text-xs">Discard changes and switch to preview</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  // Default toggle button (no unsaved changes or in preview mode)
  return (
    <div className="absolute bottom-2 right-2 z-50">
      <TooltipProvider delayDuration={500} skipDelayDuration={0}>
        <Tooltip open={toggleTooltipOpen} onOpenChange={setToggleTooltipOpen}>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg shadow-lg bg-background border-border/60 hover:bg-accent hover:border-border"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setToggleTooltipOpen(false);
                onToggleMode();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onMouseEnter={() => setToggleTooltipOpen(true)}
              onMouseLeave={() => setToggleTooltipOpen(false)}
              onFocus={() => setToggleTooltipOpen(false)}
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
      </TooltipProvider>
    </div>
  );
}

