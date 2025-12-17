"use client";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { FunnelIcon } from "@heroicons/react/24/outline";
import type { SortOption } from "@/features/tweaks/utils/filter-tweaks";

interface VisualTreeSortMenuProps {
  sortOption: SortOption;
  onSortChange: (value: SortOption) => void;
  onSelectAllVisible: () => void;
}

export function VisualTreeSortMenu({
  sortOption,
  onSortChange,
  onSelectAllVisible,
}: VisualTreeSortMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
          <FunnelIcon className="h-3 w-3" />
          Sort &amp; Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={sortOption}
          onValueChange={(v) => onSortChange(v as SortOption)}
        >
          <DropdownMenuRadioItem value="alphabetical">
            Alphabetical
          </DropdownMenuRadioItem>
          <DropdownMenuSeparator />
          <DropdownMenuRadioItem value="downloads-desc">
            Most Downloads
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="favorites-desc">
            Most Favorites
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="reports-desc">
            Most Reported
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSelectAllVisible}>
          Select All Visible
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


