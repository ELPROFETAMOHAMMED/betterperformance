"use client";

import { TrashIcon } from "@heroicons/react/24/outline";

import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import type { Tweak } from "@/features/tweaks/types/tweak.types";

type CategoryTweaksPanelProps = {
  tweaks: Tweak[];
  onDeleteTweak: (tweak: Tweak) => void;
};

export function CategoryTweaksPanel({
  tweaks,
  onDeleteTweak,
}: CategoryTweaksPanelProps) {
  const tweakCount = tweaks.length;

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center justify-between">
        <Label>Tweaks in this category ({tweakCount})</Label>
      </div>
      {tweakCount === 0 ? (
        <p className="text-sm text-muted-foreground">
          No tweaks in this category.
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {tweaks.map((tweak) => (
            <div
              key={tweak.id}
              className="flex items-center justify-between rounded-md border border-border/40 bg-muted/20 p-3 transition-colors hover:bg-muted/40"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{tweak.title}</p>
                {tweak.description && (
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {tweak.description}
                  </p>
                )}
                {!tweak.is_visible && (
                  <span className="mt-1 inline-block text-[10px] text-muted-foreground/70">
                    (Disabled)
                  </span>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onDeleteTweak(tweak)}
                title="Delete tweak"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
