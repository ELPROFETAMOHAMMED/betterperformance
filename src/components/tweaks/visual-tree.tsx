"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { getIcon } from "../../utils/icon-map";
import type { TweakCategory, Tweak } from "@/types/tweak.types";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <ScrollArea className="flex flex-col w-[400px] h-[650px]  backdrop-blur-4xl rounded-lg overflow-hidden p-2 text-muted-foreground">
      <div className="flex-1 overflow-y-auto">
        <Accordion
          type="multiple"
          className="w-full max-h-full min-h-full h-full"
          defaultValue={[]}
        >
          {categories.map((category, categoryIndex) => {
            const CategoryIcon = getIcon(category.icon);
            const isLastCategory = categoryIndex === categories.length - 1;
            return (
              <AccordionItem
                key={category.id}
                value={category.id}
                className="border-none"
              >
                <AccordionTrigger className="px-3 py-1.5 hover:no-underline hover:bg-transparent">
                  <div className="flex items-center gap-2 w-full">
                    <CategoryIcon className="h-4 w-4 text-foreground flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground">
                      {category.name}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-0">
                  <div className="space-y-0">
                    {category.tweaks.map((tweak, tweakIndex) => {
                      const TweakIcon = getIcon(tweak.icon);
                      const isSelected = selectedTweaks.has(tweak.id);
                      const isLastTweak =
                        tweakIndex === category.tweaks.length - 1;
                      return (
                        <div
                          key={tweak.id}
                          className={cn(
                            "relative flex items-center gap-2 py-1.5 cursor-pointer transition-colors group",
                            "hover:bg-accent/30",
                            isSelected && "bg-secondary/5"
                          )}
                          onClick={() => onTweakToggle(tweak)}
                        >
                          {/* Tree lines
                          <div className="absolute left-0 top-0 bottom-0 w-6 flex items-start justify-center">
                            <div className="relative w-full h-full">
                             -- Vertical
                              {!isLastTweak && (
                                <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
                              )}
                              -- horizontal
                              <div className="absolute left-3 top-[11px] w-3 h-px bg-border" />
                              -- Corner connected
                              {isLastTweak && (
                                <div className="absolute left-3 top-[11px] w-3 h-px bg-border" />
                              )}
                            </div>
                          </div> */}

                          <div className="flex items-center gap-2 pl-8 flex-1 min-w-0">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => onTweakToggle(tweak)}
                              onClick={(e) => e.stopPropagation()}
                              className="h-3.5 w-3.5 flex-shrink-0"
                            />
                            <TweakIcon className="h-4 w-4 text-foreground flex-shrink-0" />
                            <span className="text-sm text-foreground truncate">
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
