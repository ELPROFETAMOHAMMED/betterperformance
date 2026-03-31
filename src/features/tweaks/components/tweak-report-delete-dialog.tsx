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
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface TweakReportDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
  reportTitle?: string;
}

export function TweakReportDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
  reportTitle,
}: TweakReportDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[400px] border-destructive/20 bg-background/95 backdrop-blur-xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ExclamationTriangleIcon className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="text-xl">Retract Report</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to retract {reportTitle ? <span>your report <strong>"{reportTitle}"</strong></span> : "this report"}? 
            <br /><br />
            This action will remove your feedback from the community and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={isDeleting} className="rounded-xl border-border/50">
            Keep Report
          </AlertDialogCancel>
          <AlertDialogAction
            asChild
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl px-6"
          >
            <Button onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}>
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Retracting...</span>
                </div>
              ) : (
                "Retract Report"
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
