"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { TweakCategory, Tweak } from "@/types/tweak.types";
import { ScrollArea } from "@/components/ui/scroll-area";
import DynamicIcon from "@/components/common/dynamic-icon";

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
    <ScrollArea className="flex h-[650px] w-full flex-col rounded-[var(--radius-md)] bg-background/40 p-3 text-muted-foreground backdrop-blur">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Tweak categories
        </div>
        <div className="text-[11px] text-muted-foreground/80">
          {categories.length} groups
        </div>
      </div>
      <div className="flex-1 overflow-y-auto rounded-md bg-background/40 p-1">
        <Accordion
          type="multiple"
          className="h-full w-full space-y-1"
          defaultValue={[]}
        >
          {categories.map((category) => {
            return (
              <AccordionItem
                key={category.id}
                value={category.id}
                className="overflow-hidden rounded-md border border-border/30 bg-background/70 px-1"
              >
                <AccordionTrigger className="px-2 py-2 hover:bg-accent/40 hover:no-underline">
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <DynamicIcon
                        name={category.icon}
                        className="h-4 w-4 flex-shrink-0 text-primary"
                      />
                      <span className="text-xs font-medium uppercase tracking-[0.12em] text-foreground">
                        {category.name}
                      </span>
                    </div>
                    <span className="rounded-full bg-secondary/70 px-2 py-0.5 text-[11px] text-secondary-foreground">
                      {category.tweaks.length} tweaks
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-1 pt-0.5">
                  <div className="space-y-0.5">
                    {category.tweaks.map((tweak) => {
                      const isSelected = selectedTweaks.has(tweak.id);
                      return (
                        <div
                          key={tweak.id}
                          className={cn(
                            "group relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                            "hover:bg-accent/50",
                            isSelected &&
                              "bg-primary/10 text-foreground ring-1 ring-primary/40"
                          )}
                          onClick={() => onTweakToggle(tweak)}
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2 pl-1">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => onTweakToggle(tweak)}
                              onClick={(e) => e.stopPropagation()}
                              className="h-3.5 w-3.5 flex-shrink-0"
                            />
                            <DynamicIcon
                              name={tweak.icon}
                              className="h-3.5 w-3.5 flex-shrink-0 text-foreground group-hover:text-primary"
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
