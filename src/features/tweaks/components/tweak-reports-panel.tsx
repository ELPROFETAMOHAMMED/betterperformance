"use client";

import { useMemo, useState } from "react";

import {
  ExclamationTriangleIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";

import { TweakReportDeleteDialog } from "@/features/tweaks/components/tweak-report-delete-dialog";
import { useReportDeletion } from "@/features/tweaks/hooks/use-report-deletion";
import type { TweakReport } from "@/features/tweaks/types/tweak-report.types";
import { useUser } from "@/shared/hooks/use-user";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

type TweakReportsPanelProps = {
  activeTweakId: string;
  allReports: TweakReport[];
  userReports: TweakReport[];
};

export function TweakReportsPanel({
  activeTweakId,
  allReports,
  userReports,
}: TweakReportsPanelProps) {
  const [scope, setScope] = useState<"user" | "global">("global");
  const { user } = useUser();
  const {
    confirmDelete,
    deleteDialogOpen,
    isDeleting,
    openDeleteDialog,
    selectedReport,
    setDeleteDialogOpen,
  } = useReportDeletion();

  const filteredReports = useMemo(() => {
    const scopedReports = scope === "user" ? userReports : allReports;
    return scopedReports.filter((report) => report.tweak_id === activeTweakId);
  }, [activeTweakId, allReports, scope, userReports]);

  const globalReportCount = allReports.filter(
    (report) => report.tweak_id === activeTweakId
  ).length;
  const userReportCount = userReports.filter(
    (report) => report.tweak_id === activeTweakId
  ).length;

  return (
    <>
      <ScrollArea className="h-full">
        <div className="mx-auto max-w-4xl space-y-6 px-6 py-6 xl:px-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Reports Management
              </h4>
              <p className="text-xs text-muted-foreground">
                Community feedback for this tweak
              </p>
            </div>
            <div className="flex items-center rounded-lg border border-border/20 bg-muted p-1">
              <Button
                variant={scope === "global" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 gap-1.5 rounded-md px-3"
                onClick={() => setScope("global")}
              >
                <UsersIcon className="h-3 w-3" />
                <span className="text-[11px] font-medium">Global</span>
                <Badge variant="outline" className="h-4 px-1 text-[9px]">
                  {globalReportCount}
                </Badge>
              </Button>
              <Button
                variant={scope === "user" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 gap-1.5 rounded-md px-3"
                onClick={() => setScope("user")}
                disabled={!user}
              >
                <UserIcon className="h-3 w-3" />
                <span className="text-[11px] font-medium">Mine</span>
                <Badge variant="outline" className="h-4 px-1 text-[9px]">
                  {userReportCount}
                </Badge>
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            {filteredReports.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-border/40 bg-muted/5 py-20 text-center">
                <ExclamationTriangleIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                <h5 className="font-medium text-foreground">No reports found</h5>
                <p className="mt-1 text-xs text-muted-foreground">
                  {scope === "user"
                    ? "You haven't reported this tweak yet."
                    : "No community reports for this tweak."}
                </p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="group relative flex flex-col gap-3 rounded-xl border border-border/40 bg-card p-4 shadow-sm transition-all hover:border-primary/40"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "h-4 px-1.5 text-[10px] font-bold uppercase tracking-tighter",
                            report.status === "resolved"
                              ? "border-emerald-500/20 text-emerald-500"
                              : "border-amber-500/20 text-amber-500"
                          )}
                        >
                          {report.status}
                        </Badge>
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
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
                      <h5 className="line-clamp-1 text-sm font-semibold text-foreground">
                        {report.title}
                      </h5>
                    </div>

                    {user?.id === report.user_id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                        onClick={() => openDeleteDialog(report)}
                        disabled={isDeleting === report.id}
                      >
                        {isDeleting === report.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <TrashIcon className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  <p className="rounded-lg border border-border/10 bg-muted/20 p-3 text-xs italic leading-relaxed text-muted-foreground">
                    &quot;{report.description}&quot;
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground">
                    <span>
                      {report.user_id === user?.id
                        ? "Your report"
                        : "Community report"}
                    </span>
                    <span>
                      {formatDistanceToNow(new Date(report.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </ScrollArea>

      <TweakReportDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => {
          void confirmDelete();
        }}
        isDeleting={Boolean(isDeleting)}
        reportTitle={selectedReport?.title}
      />
    </>
  );
}
