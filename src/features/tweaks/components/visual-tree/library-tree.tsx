import { motion, AnimatePresence } from "framer-motion";
import type { TweakCategory, Tweak } from "@/features/tweaks/types/tweak.types";
import { CategoryRow } from "./category-row";
import { TweakItem } from "../tweak-item";
import { Button } from "@/shared/components/ui/button";
import { PencilIcon } from "@heroicons/react/24/outline";

interface LibraryTreeProps {
  categories: TweakCategory[];
  expandedCategories: Set<string>;
  toggleCategory: (id: string) => void;
  isAdmin: boolean;
  selectedTweaks: Set<string>;
  onTweakToggle: (tweak: Tweak) => void;
  onEditCategory?: (category: TweakCategory) => void;
  handleSelectGroup: (tweaks: Tweak[], e: React.MouseEvent) => void;
}

export function LibraryTree({
  categories,
  expandedCategories,
  toggleCategory,
  isAdmin,
  selectedTweaks,
  onTweakToggle,
  onEditCategory,
  handleSelectGroup,
}: LibraryTreeProps) {
  return (
    <>
      {categories.map((category) => {
        const isExpanded = expandedCategories.has(category.id);
        const tweaks = category.tweaks || [];

        return (
          <div key={category.id} className="mb-2 last:mb-0">
            <CategoryRow
              id={category.id}
              name={category.name}
              description={category.description}
              icon={category.icon}
              isExpanded={isExpanded}
              onToggle={() => toggleCategory(category.id)}
              tweaks={tweaks}
              isAdmin={isAdmin}
              selectedTweaks={selectedTweaks}
              onSelectGroup={handleSelectGroup}
              className="mx-2 rounded-md"
              actions={
                isAdmin && onEditCategory ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onEditCategory(category);
                    }}
                    title="Edit category"
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                  </Button>
                ) : null
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
                  <div className="flex flex-col mt-1">
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
