import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  FolderOpenIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import DynamicIcon from "@/shared/components/common/dynamic-icon";
import type { Tweak } from "@/features/tweaks/types/tweak.types";
import React from "react";

interface CategoryRowProps {
  name: string;
  description?: string;
  icon?: string | React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  tweaks: Tweak[];
  isAdmin: boolean;
  selectedTweaks: Set<string>;
  onSelectGroup?: (tweaks: Tweak[], e: React.MouseEvent) => void;
  actions?: React.ReactNode;
  className?: string;
  selectionCount?: {
    selected: number;
    total: number;
  };
  hideSelectGroupButton?: boolean;
}

export function CategoryRow({
  name,
  description,
  icon,
  isExpanded,
  onToggle,
  tweaks,
  isAdmin,
  selectedTweaks,
  onSelectGroup,
  actions,
  className,
  selectionCount,
  hideSelectGroupButton = false,
}: CategoryRowProps) {
  const selectableTweaks = selectionCount
    ? tweaks
    : isAdmin
      ? tweaks
      : tweaks.filter((t) => t.is_visible);
  const selectedCount = selectionCount
    ? selectionCount.selected
    : selectableTweaks.filter((t) => selectedTweaks.has(t.id)).length;
  const totalCount = selectionCount ? selectionCount.total : selectableTweaks.length;
  const allSelected = totalCount > 0 && selectedCount === totalCount;
  const someSelected = selectedCount > 0 && !allSelected;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors",
        isExpanded ? "bg-secondary/20 text-foreground font-medium" : "hover:bg-secondary/40 text-muted-foreground",
        className
      )}
      onClick={onToggle}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground"
      >
        {isExpanded ? (
          <ChevronDownIcon className="h-3.5 w-3.5" />
        ) : (
          <ChevronRightIcon className="h-3.5 w-3.5" />
        )}
      </Button>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        {typeof icon === "string" ? (
          <DynamicIcon name={icon} className={isExpanded ? "text-primary/70" : "text-muted-foreground"} />
        ) : icon ? (
          icon
        ) : isExpanded ? (
          <FolderOpenIcon className="h-4 w-4 text-primary/70" />
        ) : (
          <FolderIcon className="h-4 w-4 text-muted-foreground" />
        )}
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium truncate select-none block">{name}</span>
          {description && (
            <p className="text-[11px] text-muted-foreground line-clamp-1 leading-relaxed mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground font-mono">
          {selectedCount}/{totalCount}
        </span>
        {actions}
        {!hideSelectGroupButton && onSelectGroup && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-6 w-6 rounded-full",
              allSelected
                ? "text-primary hover:text-primary/80"
                : someSelected
                  ? "text-primary/70 hover:text-primary"
                  : "text-muted-foreground hover:text-foreground"
            )}
            onClick={(e: React.MouseEvent) => onSelectGroup(tweaks, e)}
          >
            {allSelected ? <CheckCircleIconSolid className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}
