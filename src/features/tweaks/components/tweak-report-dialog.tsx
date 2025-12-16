"use client";

import { useState } from "react";
import type { Tweak } from "@/features/tweaks/types/tweak.types";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/shared/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { toast } from "sonner";

interface TweakReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tweak: Tweak | null;
}

export function TweakReportDialog({
  open,
  onOpenChange,
  tweak,
}: TweakReportDialogProps) {
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportRisk, setReportRisk] = useState<"low" | "medium" | "high" | "">(
    ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setReportTitle("");
      setReportDescription("");
      setReportRisk("");
    }
  };

  const handleSubmit = async () => {
    if (!tweak) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/tweaks/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tweakId: tweak.id,
          title: reportTitle,
          description: reportDescription,
          riskLevel: reportRisk,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit report");
      }

      toast.success("Report submitted successfully");
      handleOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit report"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report tweak</DialogTitle>
          <DialogDescription>
            Use this form to describe issues with{" "}
            <span className="font-medium text-foreground">
              {tweak?.title ?? "this tweak"}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Tweak ID</p>
            <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-dashed border-border/60 bg-muted/40 px-3 py-2">
              <span className="font-mono text-xs break-all">
                {tweak?.id ?? "—"}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Report title
            </p>
            <Input
              placeholder="e.g. Script fails on Windows 11 24H2"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              What&apos;s wrong with this tweak?
            </p>
            <Textarea
              rows={4}
              placeholder="Describe behaviour, errors, or unexpected changes after running this tweak."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Risk level
            </p>
            <RadioGroup
              value={reportRisk}
              onValueChange={(value) =>
                setReportRisk(value as "low" | "medium" | "high" | "")
              }
              className="flex gap-4 pt-1"
            >
              <TooltipProvider delayDuration={150}>
                <div className="flex items-center space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <RadioGroupItem value="low" id="risk-low" className="text-emerald-500 border-emerald-500" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="max-w-xs text-[11px]">
                        Minor or cosmetic issue. Unlikely to affect system
                        stability.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Label htmlFor="risk-low" className="text-xs font-medium cursor-pointer">Low</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <RadioGroupItem value="medium" id="risk-medium" className="text-amber-500 border-amber-500" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="max-w-xs text-[11px]">
                        Features broken or settings reversed, but OS remains
                        usable.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Label htmlFor="risk-medium" className="text-xs font-medium cursor-pointer">Medium</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <RadioGroupItem value="high" id="risk-high" className="text-destructive border-destructive" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="max-w-xs text-[11px]">
                        Severe impact such as boot issues, data loss risk, or
                        system instability.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Label htmlFor="risk-high" className="text-xs font-medium cursor-pointer">High</Label>
                </div>
              </TooltipProvider>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Close
            </Button>
          </DialogClose>
          <Button
            type="button"
            size="sm"
            disabled={
              !reportTitle.trim() ||
              !reportDescription.trim() ||
              !reportRisk ||
              isSubmitting
            }
            onClick={handleSubmit}
          >
            {isSubmitting ? "Submitting..." : "Submit report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


