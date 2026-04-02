import { motion, AnimatePresence } from "framer-motion";
import type { TweakCategory, Tweak } from "@/features/tweaks/types/tweak.types";
import { CategoryRow } from "./category-row";
import { TweakItem } from "../tweak-item";
import { Button } from "@/shared/components/ui/button";
import { PencilIcon } from "@heroicons/react/24/outline";
import { TweaksEmptyState } from "../tweaks-empty-state";

interface PopularTreeProps {
  categories: TweakCategory[];
  expandedCategories: Set<string>;
  toggleCategory: (id: string) => void;
  isAdmin: boolean;
  selectedTweaks: Set<string>;
  onTweakToggle: (tweak: Tweak) => void;
  onEditCategory?: (category: TweakCategory) => void;
  handleSelectGroup: (tweaks: Tweak[], e: React.MouseEvent) => void;
}

export function PopularTree({
  categories,
  expandedCategories,
  toggleCategory,
  isAdmin,
  selectedTweaks,
  onTweakToggle,
  onEditCategory,
  handleSelectGroup,
}: PopularTreeProps) {
  if (categories.length === 0) {
    return (
      <TweaksEmptyState
        title="No popular tweaks found"
        description="No tweaks with downloads found"
      />
    );
  }

  return (
    <>
      {categories.map((category) => {
        const isExpanded = expandedCategories.has(category.id);
        const tweaks = category.tweaks || [];

        return (
          <div key={category.id} className="overflow-hidden border-b border-border/10 last:border-0 transition-colors">
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
              className="bg-transparent" // overriden in CategoryRow but we keep it flat here
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
                  <div className="flex flex-col border-t border-border/10">
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
