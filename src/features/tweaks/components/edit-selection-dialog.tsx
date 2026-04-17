"use client";

import { useEffect, useMemo, useState } from "react";

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
import type { SelectedItem } from "@/shared/types/selection.types";

type EditSelectionDialogProps = {
  open: boolean;
  items: SelectedItem[];
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (items: SelectedItem[]) => void;
};

export function EditSelectionDialog({
  open,
  items,
  isSaving,
  onOpenChange,
  onConfirm,
}: EditSelectionDialogProps) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setSelectedKeys(new Set(items.map((item) => `${item.type}:${item.id}`)));
    }
  }, [open, items]);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedKeys.has(`${item.type}:${item.id}`)),
    [selectedKeys, items]
  );

  const handleToggle = (item: SelectedItem) => {
    const key = `${item.type}:${item.id}`;

    setSelectedKeys((previous) => {
      const next = new Set(previous);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit selection</DialogTitle>
          <DialogDescription>
            Keep the items you want in this list.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-72">
          <div className="space-y-2 pr-2">
            {items.map((item) => {
              const key = `${item.type}:${item.id}`;

              return (
                <Button
                  asChild
                  key={key}
                  variant="ghost"
                  className="h-auto w-full justify-start rounded-md border border-border px-3 py-2 text-left hover:bg-secondary/40"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleToggle(item)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleToggle(item);
                      }
                    }}
                  >
                    <Checkbox checked={selectedKeys.has(key)} className="mt-0.5" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.item.title}
                      </p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {item.type}
                      </p>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(selectedItems)} disabled={isSaving || selectedItems.length === 0}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
