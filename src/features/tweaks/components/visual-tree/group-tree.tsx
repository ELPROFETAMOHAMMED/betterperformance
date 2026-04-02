import { motion, AnimatePresence } from "framer-motion";
import type { Tweak } from "@/features/tweaks/types/tweak.types";
import { CategoryRow } from "./category-row";
import { TweakItem } from "../tweak-item";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { EllipsisHorizontalIcon, PencilIcon, StarIcon, TrashIcon } from "@heroicons/react/24/outline";
import { GroupSelectionItem } from "./hooks/use-group-selections";
import { TweaksEmptyState } from "../tweaks-empty-state";

interface GroupTreeProps {
  groups: GroupSelectionItem[];
  expandedCategories: Set<string>;
  toggleCategory: (id: string) => void;
  isAdmin: boolean;
  selectedTweaks: Set<string>;
  onTweakToggle: (tweak: Tweak) => void;
  handleSelectGroup: (tweaks: Tweak[], e: React.MouseEvent) => void;
  onRenameSelection?: (id: string, currentName: string) => void;
  onSaveAsFavorite?: (tweaks: Tweak[], defaultName: string) => void;
  onDeleteSelection?: (id: string) => void;
}

export function GroupTree({
  groups,
  expandedCategories,
  toggleCategory,
  isAdmin,
  selectedTweaks,
  onTweakToggle,
  handleSelectGroup,
  onRenameSelection,
  onSaveAsFavorite,
  onDeleteSelection,
}: GroupTreeProps) {
  if (groups.length === 0) {
    return <TweaksEmptyState title="No items found" />;
  }

  return (
    <>
      {groups.map((group) => {
        const isExpanded = expandedCategories.has(group.id);
        const tweaks = group.tweaks;

        return (
          <div key={group.id} className="mb-2 last:mb-0">
            <CategoryRow
              id={group.id}
              name={group.title}
              icon={group.icon}
              isExpanded={isExpanded}
              onToggle={() => toggleCategory(group.id)}
              tweaks={tweaks}
              isAdmin={isAdmin}
              selectedTweaks={selectedTweaks}
              onSelectGroup={handleSelectGroup}
              className="mx-2 rounded-md"
              actions={
                group.isUserSelection && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={(event: React.MouseEvent) => event.stopPropagation()}
                      >
                        <EllipsisHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(event: React.MouseEvent) => {
                          event.stopPropagation();
                          onRenameSelection?.(group.id, group.title);
                        }}
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      {group.isHistoryItem && (
                        <DropdownMenuItem
                          onClick={(event: React.MouseEvent) => {
                            event.stopPropagation();
                            onSaveAsFavorite?.(group.tweaks, group.title);
                          }}
                        >
                          <StarIcon className="h-4 w-4 mr-2" />
                          Save to Favorites
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(event: React.MouseEvent) => {
                          event.stopPropagation();
                          onDeleteSelection?.(group.id);
                        }}
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              }
            />

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="pl-9 pr-2 py-1 space-y-0.5 border-t border-border/20 bg-muted/10">
                    {tweaks.map((tweak) => (
                      <TweakItem
                        key={tweak.id}
                        tweak={tweak}
                        selected={selectedTweaks.has(tweak.id)}
                        onToggle={() => onTweakToggle(tweak)}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </>
  );
}
