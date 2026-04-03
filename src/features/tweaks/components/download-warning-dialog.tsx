"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

interface DownloadWarningDialogProps {
  open: boolean;
  onContinue: () => void;
  onCancel: () => void;
}

export function DownloadWarningDialog({
  open,
  onContinue,
  onCancel,
}: DownloadWarningDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        onCancel();
      }
    }}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Important Warning - Read Before Downloading</AlertDialogTitle>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3">
              <p className="font-semibold text-yellow-600 dark:text-yellow-500 mb-2">
                ⚠️ Experimental Feature - Use at Your Own Risk
              </p>
              <p>
                This platform is currently in experimental phase. We take no responsibility for any damage, data loss, or system instability that may occur from using these tweaks.
              </p>
            </div>

            <div>
              <p className="font-medium text-foreground mb-2">
                Before downloading and applying tweaks, please ensure you:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Have reviewed and understand each tweak you&apos;re about to apply</li>
                <li>Have created a system restore point (strongly recommended)</li>
                <li>Are aware that some tweaks may require administrator privileges</li>
                <li>Have backed up all important data</li>
                <li>Understand that combining incompatible tweaks may break your system</li>
                <li>Know what you&apos;re doing or are willing to accept the risks</li>
              </ul>
            </div>

            <div className="rounded-md border border-red-500/50 bg-red-500/10 p-3">
              <p className="font-semibold text-red-600 dark:text-red-500 mb-1">
                ⚠️ Compatibility Warning
              </p>
              <p className="text-xs">
                Some tweaks may not be compatible with each other or with your specific system configuration. Applying incompatible tweaks together can cause system instability, crashes, or require a system restore. Always test tweaks individually when possible.
              </p>
            </div>

            <p className="text-xs text-muted-foreground italic">
              By clicking &quot;Continue Download&quot;, you acknowledge that you understand these risks and that BetterPerformance is not responsible for any consequences resulting from the use of these tweaks.
            </p>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onContinue}>
            I Understand - Continue Download
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
