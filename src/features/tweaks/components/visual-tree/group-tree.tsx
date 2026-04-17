import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { EllipsisHorizontalIcon, PencilIcon, PencilSquareIcon, StarIcon, TrashIcon } from "@heroicons/react/24/outline";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { TweaksEmptyState } from "@/features/tweaks/components/tweaks-empty-state";
import type { GroupSelectionItem } from "@/features/tweaks/components/visual-tree/hooks/use-group-selections";
import type { SelectedItem } from "@/shared/types/selection.types";

interface GroupTreeProps {
  groups: GroupSelectionItem[];
  expandedCategories: Set<string>;
  toggleCategory: (id: string) => void;
  selectedItems: Map<string, SelectedItem>;
  onItemToggle: (item: SelectedItem) => void;
  handleSelectGroup: (items: SelectedItem[], e: React.MouseEvent) => void;
  onRenameSelection?: (id: string, currentName: string) => void;
  onEditSelection?: (id: string, items: SelectedItem[]) => void;
  onSaveAsFavorite?: (items: SelectedItem[], defaultName: string) => void;
  onDeleteSelection?: (id: string) => void;
}

export function GroupTree({
  groups,
  expandedCategories,
  toggleCategory,
  selectedItems,
  onItemToggle,
  handleSelectGroup,
  onRenameSelection,
  onEditSelection,
  onSaveAsFavorite,
  onDeleteSelection,
}: GroupTreeProps) {
  if (groups.length === 0) {
    return <TweaksEmptyState title="No items found" />;
  }

  return (
    <div className="space-y-2 p-2">
      {groups.map((group) => {
        const isExpanded = expandedCategories.has(group.id);
        const allSelected = group.items.length > 0 && group.items.every((item) => selectedItems.has(`${item.type}:${item.id}`));

        return (
          <Card key={group.id} className="border-border/20 bg-card/60 overflow-hidden">
            <div
              className={cn(
                "flex w-full items-center justify-between gap-3 px-3 py-2 text-left",
                isExpanded ? "bg-secondary/20" : "hover:bg-secondary/30"
              )}
              role="button"
              tabIndex={0}
              onClick={() => toggleCategory(group.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggleCategory(group.id);
                }
              }}
            >
              <div className="flex min-w-0 items-center gap-2">
                {group.icon}
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">{group.title}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {group.items.length} item{group.items.length === 1 ? "" : "s"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground">
                  {group.items.filter((item) => selectedItems.has(`${item.type}:${item.id}`)).length}/{group.items.length}
                </span>
                {group.isUserSelection && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-7 w-7 rounded-full",
                      allSelected ? "text-primary" : "text-muted-foreground"
                    )}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleSelectGroup(group.items, event);
                    }}
                  >
                    <StarIcon className="h-4 w-4" />
                  </Button>
                )}
                {group.isUserSelection && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <EllipsisHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(event) => {
                          event.stopPropagation();
                          onRenameSelection?.(group.id, group.title);
                        }}
                      >
                        <PencilIcon className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(event) => {
                          event.stopPropagation();
                          onEditSelection?.(group.id, group.items);
                        }}
                      >
                        <PencilSquareIcon className="mr-2 h-4 w-4" />
                        Edit items
                      </DropdownMenuItem>
                      {group.isHistoryItem && (
                        <DropdownMenuItem
                          onClick={(event) => {
                            event.stopPropagation();
                            onSaveAsFavorite?.(group.items, group.title);
                          }}
                        >
                          <StarIcon className="mr-2 h-4 w-4" />
                          Save to Favorites
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteSelection?.(group.id);
                        }}
                      >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="space-y-1 border-t border-border/20 bg-muted/10 p-3">
                    {group.items.map((item) => {
                      const key = `${item.type}:${item.id}`;
                      const isSelected = selectedItems.has(key);

                      return (
                        <button
                          key={key}
                          type="button"
                          className={cn(
                            "flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-colors",
                            isSelected
                              ? "border-primary/40 bg-primary/10"
                              : "border-border/20 bg-background/40 hover:bg-secondary/20"
                          )}
                          onClick={() => onItemToggle(item)}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-foreground">{item.item.title}</div>
                            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              {item.type}
                            </div>
                          </div>
                          <Badge variant="outline" className="ml-3 text-[10px] uppercase">
                            {item.type}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        );
      })}
    </div>
  );
}
