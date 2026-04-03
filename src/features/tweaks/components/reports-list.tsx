"use client";

import { ExclamationTriangleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

import type { Tweak } from "@/features/tweaks/types/tweak.types";
import type { TweakReport } from "@/features/tweaks/types/tweak-report.types";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/cn";

type ReportsListProps = {
  currentUserId?: string;
  isDeletingReportId: string | null;
  reports: TweakReport[];
  tweaksById: Map<string, Tweak>;
  onDeleteReport: (report: TweakReport) => void;
  onSelectTweak: (tweak: Tweak) => void;
};

export function ReportsList({
  currentUserId,
  isDeletingReportId,
  reports,
  tweaksById,
  onDeleteReport,
  onSelectTweak,
}: ReportsListProps) {
  if (reports.length === 0) {
    return (
      <div className="py-10 text-center opacity-40 mix-blend-luminosity">
        <ExclamationTriangleIcon className="mx-auto mb-2 h-8 w-8" />
        <p className="text-xs font-medium">No reports found</p>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-3">
      {reports.map((report) => {
        const tweak = tweaksById.get(report.tweak_id);

        if (!tweak) {
          return null;
        }

        return (
          <motion.div
            key={report.id}
            className="group relative flex cursor-pointer flex-col gap-2 rounded-xl border border-border/40 bg-card p-3 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => onSelectTweak(tweak)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-1.5">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      report.status === "resolved"
                        ? "bg-emerald-500"
                        : report.risk_level === "high"
                          ? "bg-red-500"
                          : report.risk_level === "medium"
                            ? "bg-amber-500"
                            : "bg-blue-500"
                    )}
                  />
                  <span className="truncate text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                    {tweak.title}
                  </span>
                </div>
                <h5 className="mb-0.5 line-clamp-1 text-xs font-semibold leading-tight text-foreground">
                  {report.title}
                </h5>
                <p className="line-clamp-2 text-[11px] italic leading-relaxed text-muted-foreground">
                  &quot;{report.description}&quot;
                </p>
              </div>

              {currentUserId === report.user_id && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteReport(report);
                  }}
                  disabled={isDeletingReportId === report.id}
                >
                  {isDeletingReportId === report.id ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <TrashIcon className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
            </div>

            <div className="mt-1 flex items-center justify-between border-t border-border/10 pt-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "h-3.5 px-1 text-[9px] font-normal lowercase",
                    report.status === "resolved"
                      ? "border-emerald-500/20 text-emerald-500"
                      : "border-amber-500/20 text-amber-500"
                  )}
                >
                  {report.status}
                </Badge>
                <span
                  className={cn(
                    "text-[9px] font-medium",
                    report.risk_level === "high"
                      ? "text-red-500"
                      : report.risk_level === "medium"
                        ? "text-amber-500"
                        : "text-emerald-500"
                  )}
                >
                  {report.risk_level} risk
                </span>
              </div>
              <span className="text-[9px] text-muted-foreground opacity-60">
                {formatDistanceToNow(new Date(report.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
