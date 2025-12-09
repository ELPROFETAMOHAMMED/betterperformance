"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { cn } from "@/shared/lib/utils";
import type { TweakCategory, Tweak } from "@/features/tweaks/types/tweak.types";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

interface VisualTreeProps {
  categories: TweakCategory[];
  selectedTweaks: Set<string>;
  onTweakToggle: (tweak: Tweak) => void;
}

export default function VisualTree({
  categories,
  selectedTweaks,
  onTweakToggle,
}: VisualTreeProps) {
  return (
    <ScrollArea className="flex h-[650px] w-full flex-col rounded-[var(--radius-md)] p-3 text-muted-foreground ">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Tweak categories
        </div>
        <div className="text-[11px] text-muted-foreground/80">
          {categories.length} groups
        </div>
      </div>
      <div className="flex-1 overflow-y-auto rounded-sm mx-2">
        <Accordion
          type="multiple"
          className="h-full w-full space-y-1"
          defaultValue={[]}
        >
          {categories.map((category) => {
            const tweaksInCategory = category.tweaks || [];
            const selectedCount = tweaksInCategory.filter((tweak) =>
              selectedTweaks.has(tweak.id)
            ).length;
            const allSelected =
              tweaksInCategory.length > 0 &&
              selectedCount === tweaksInCategory.length;
            const someSelected =
              selectedCount > 0 && !allSelected && tweaksInCategory.length > 0;

            const handleCategoryToggle = () => {
              if (allSelected) {
                // Unselect all tweaks in this category
                tweaksInCategory.forEach((tweak) => {
                  if (selectedTweaks.has(tweak.id)) {
                    onTweakToggle(tweak);
                  }
                });
              } else {
                // Select all tweaks in this category
                tweaksInCategory.forEach((tweak) => {
                  if (!selectedTweaks.has(tweak.id)) {
                    onTweakToggle(tweak);
                  }
                });
              }
            };

            return (
              <AccordionItem
                key={category.id}
                value={category.id}
                className="overflow-hidden rounded-sm border border-border/30 bg-background/70  px-1  hover:bg-accent/5 mb-2"
              >
                <div className="flex items-center justify-between  gap-3 px-2 py-2 ">
                  <div
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                      }
                    }}
                    role="none"
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      checked={
                        allSelected ? true : someSelected ? "indeterminate" : false
                      }
                      onCheckedChange={handleCategoryToggle}
                      className="h-3.5 w-3.5 flex-shrink-0"
                    />
                     <span className="text-xs font-medium uppercase tracking-[0.12em] text-foreground">
                      {category.name}
                    </span>
                    
                  </div>
                  <AccordionTrigger className="flex-1 hover:no-underline py-0 justify-between">
                   
                    <div className="flex items-center gap-2 justify-between">
                      <span className="text-[11px] text-muted-foreground">
                        {tweaksInCategory.length} tweaks
                      </span>
                    </div>
                  </AccordionTrigger>
                </div>
                <AccordionContent className="px-0 pb-2 pt-1">
                  <div className="space-y-1.5">
                    {category.tweaks.map((tweak) => {
                      const isSelected = selectedTweaks.has(tweak.id);
                      return (
                        <div
                          key={tweak.id}
                          className={cn(
                            "group relative px-3 mx-2 flex cursor-pointer items-center gap-2 rounded-xs py-2 text-xs transition-colors",
                            "hover:bg-accent/50",
                            isSelected &&
                              "bg-primary/10 text-foreground ring-1 ring-primary/40"
                          )}
                          onClick={() => onTweakToggle(tweak)}
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => onTweakToggle(tweak)}
                              onClick={(e) => e.stopPropagation()}
                              className="h-3.5 w-3.5 flex-shrink-0"
                            />
                            <span className="truncate text-[13px] text-foreground">
                              {tweak.title}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </ScrollArea>
  );
}



