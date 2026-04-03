"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface SaveFavoriteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  favoriteName: string;
  onFavoriteNameChange: (name: string) => void;
  isSaving: boolean;
  onConfirm: () => void;
  tweaksCount?: number;
}

export function SaveFavoriteDialog({
  open,
  onOpenChange,
  favoriteName,
  onFavoriteNameChange,
  isSaving,
  onConfirm,
  tweaksCount = 0,
}: SaveFavoriteDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
      }}
    >
      <AlertDialogContent className="bg-card/95 backdrop-blur-2xl border-border/40 rounded-3xl shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-black tracking-tight">Save selection as favorite</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground/80">
            Give this combination of tweaks a descriptive name.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="mt-4 space-y-4">
          <Input
            autoFocus
            value={favoriteName}
            onChange={(e) => onFavoriteNameChange(e.target.value)}
            placeholder="e.g. Gaming preset..."
            className="h-12 rounded-xl bg-muted/20 border-border/40 focus-visible:ring-primary/20"
          />
          {tweaksCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 text-primary text-xs font-semibold w-fit border border-primary/10">
              Contains {tweaksCount} tweak{tweaksCount === 1 ? "" : "s"}.
            </div>
          )}
        </div>

        <AlertDialogFooter className="mt-6 flex gap-3 sm:flex-row flex-col">
          <AlertDialogCancel 
            disabled={isSaving}
            className="flex-1 h-12 rounded-xl border-border/40 hover:bg-muted font-bold transition-all"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction asChild disabled={isSaving || !favoriteName.trim()}>
            <Button 
              className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all"
              onClick={onConfirm}
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                   <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                   <span>Saving…</span>
                </div>
              ) : "Save favorite"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
