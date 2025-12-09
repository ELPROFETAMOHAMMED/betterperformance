"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Edit, Eye } from "lucide-react";

interface EditModeToggleProps {
  isEditMode: boolean;
  onToggle: () => void;
}

export function EditModeToggle({ isEditMode, onToggle }: EditModeToggleProps) {
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
              onToggle();
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

