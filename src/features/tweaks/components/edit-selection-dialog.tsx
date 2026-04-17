"use client";

import { useEffect, useMemo, useState } from "react";

import type { Tweak } from "@/features/tweaks/types/tweak.types";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

type EditSelectionDialogProps = {
  open: boolean;
  tweaks: Tweak[];
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (tweaks: Tweak[]) => void;
};

export function EditSelectionDialog({
  open,
  tweaks,
  isSaving,
  onOpenChange,
  onConfirm,
}: EditSelectionDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setSelectedIds(new Set(tweaks.map((tweak) => tweak.id)));
    }
  }, [open, tweaks]);

  const selectedTweaks = useMemo(
    () => tweaks.filter((tweak) => selectedIds.has(tweak.id)),
    [selectedIds, tweaks]
  );

  const handleToggle = (id: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit tweaks</DialogTitle>
          <DialogDescription>
            Keep the tweaks you want in this selection.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-72">
          <div className="space-y-2 pr-2">
            {tweaks.map((tweak) => (
              <Button
                asChild
                key={tweak.id}
                variant="ghost"
                className="h-auto w-full justify-start rounded-md border border-border px-3 py-2 text-left hover:bg-secondary/40"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleToggle(tweak.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleToggle(tweak.id);
                    }
                  }}
                >
                  <Checkbox checked={selectedIds.has(tweak.id)} className="mt-0.5" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {tweak.title}
                    </p>
                    {tweak.description ? (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {tweak.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(selectedTweaks)}
            disabled={isSaving || selectedTweaks.length === 0}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
