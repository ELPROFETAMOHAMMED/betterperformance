"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { cn } from "@/shared/lib/utils";
import type { TweakCategory, Tweak } from "@/features/tweaks/types/tweak.types";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import { Check } from "lucide-react";

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
    <ScrollArea className="flex h-[650px] w-full flex-col rounded-[var(--radius-md)] p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Tweak categories
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground/90">
          <span className="h-1.5 w-1.5 rounded-full bg-primary/80" />
          {categories.length} groups
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Accordion
          type="multiple"
          className="h-full w-full space-y-1.5"
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

            const handleCategoryToggle = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (allSelected) {
                tweaksInCategory.forEach((tweak) => {
                  if (selectedTweaks.has(tweak.id)) {
                    onTweakToggle(tweak);
                  }
                });
              } else {
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
                className="rounded-none bg-transparent transition-colors hover:bg-accent/10"
              >
                <div className="flex items-center gap-3 px-2.5 py-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleCategoryToggle}
                    className={cn(
                      "relative h-5 w-5 shrink-0 rounded-sm border border-border/60 bg-background p-0 transition-all duration-150",
                      allSelected
                        ? "border-primary bg-primary"
                        : someSelected
                        ? "border-primary/60 bg-primary/10"
                        : "hover:border-border",
                    )}
                    aria-label={
                      allSelected
                        ? "Deselect all"
                        : "Select all"
                    }
                  >
                    {allSelected && (
                      <Check className="h-2.5 w-2.5 text-primary-foreground" />
                    )}
                    {someSelected && !allSelected && (
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </Button>
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {category.name}
                    </span>
                    <AccordionTrigger className="flex items-center gap-2 text-right text-xs text-muted-foreground hover:no-underline">
                      <span className="rounded-full  items-center font-medium text-foreground/80">
                        
                      {selectedCount}/{tweaksInCategory.length}
                      </span>
                      <span className="flex items-center ">
                        {tweaksInCategory.length === 1 ? "tweak" : "tweaks"}
                      </span>
                    </AccordionTrigger>
                  </div>
                </div>
                <AccordionContent className="px-0 pb-2 pt-0.5">
                  <div className="space-y-0.5 pl-2.5">
                    {category.tweaks.map((tweak) => {
                      const isSelected = selectedTweaks.has(tweak.id);
                      return (
                        <Button
                          key={tweak.id}
                          type="button"
                          variant="ghost"
                          onClick={() => onTweakToggle(tweak)}
                          className={cn(
                            "group relative flex w-full h-auto items-start justify-start gap-3 rounded-md px-3 py-2 text-left text-foreground/90 transition-all duration-150",
                            "hover:bg-accent/20",
                            isSelected && "bg-primary/5 text-foreground"
                          )}
                        >
                          <div
                            className={cn(
                              "relative flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-all duration-150",
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-border/50 bg-background group-hover:border-primary/40"
                            )}
                          >
                            {isSelected && (
                              <Check className="h-2.5 w-2.5 text-primary-foreground" />
                            )}
                          </div>
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <span className="truncate text-sm text-foreground">
                              {tweak.title}
                            </span>
                            {tweak.description && (
                              <span className="line-clamp-2 text-[11px] leading-4 text-muted-foreground">
                                {tweak.description}
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
                          )}
                        </Button>
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



