"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import type { Tweak } from "@/features/tweaks/types/tweak.types";
import type { TweakReport } from "@/features/tweaks/types/tweak-report.types";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  ExclamationTriangleIcon,
  TrashIcon,
  UsersIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/shared/hooks/use-user";
import { useQueryClient } from "@tanstack/react-query";
import { deleteTweakReport } from "../actions/delete-report";
import { TweakReportDeleteDialog } from "./tweak-report-delete-dialog";

interface ReportsExplorerProps {
  allReports: TweakReport[];
  userReports: TweakReport[];
  scope: "user" | "global";
  onScopeChange: (scope: "user" | "global") => void;
  allTweaksMap: Map<string, Tweak>;
  onTweakToggle: (tweak: Tweak) => void;
  onRefresh?: () => void;
}

export function ReportsExplorer({
  allReports,
  userReports,
  scope,
  onScopeChange,
  allTweaksMap,
  onTweakToggle,
  onRefresh,
}: ReportsExplorerProps) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<TweakReport | null>(null);

  const reports = scope === "user" ? userReports : allReports;

  const handleDeleteClick = (report: TweakReport) => {
    setSelectedReport(report);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedReport) return;

    setIsDeleting(selectedReport.id);
    try {
      const result = await deleteTweakReport(selectedReport.id);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["all-reports-with-descriptions"] });
        queryClient.invalidateQueries({ queryKey: ["user-reports"] });
        if (onRefresh) onRefresh();
        setDeleteDialogOpen(false);
      } else {
        alert(result.error || "Failed to delete report");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(null);
      setSelectedReport(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 p-1">
        <Button
          variant={scope === "global" ? "secondary" : "ghost"}
          size="sm"
          className="justify-start gap-2 h-9 px-3 rounded-lg"
          onClick={() => onScopeChange("global")}
        >
          <UsersIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Global Reports</span>
          <Badge variant="outline" className="ml-auto text-[10px] h-4 px-1">{allReports.length}</Badge>
        </Button>
        <Button
          variant={scope === "user" ? "secondary" : "ghost"}
          size="sm"
          className="justify-start gap-2 h-9 px-3 rounded-lg"
          onClick={() => onScopeChange("user")}
          disabled={!user}
        >
          <UserIcon className="h-4 w-4" />
          <span className="text-sm font-medium">My Reports</span>
          <Badge variant="outline" className="ml-auto text-[10px] h-4 px-1">{userReports.length}</Badge>
        </Button>
      </div>

      <div className="space-y-3 mt-2">
        {reports.length === 0 ? (
          <div className="py-10 text-center opacity-40 mix-blend-luminosity">
            <ExclamationTriangleIcon className="h-8 w-8 mx-auto mb-2" />
            <p className="text-xs font-medium">No reports found</p>
          </div>
        ) : (
          reports.map((report) => {
            const tweak = allTweaksMap.get(report.tweak_id);
            if (!tweak) return null;

            return (
              <motion.div
                key={report.id}
                className="group relative flex flex-col gap-2 p-3 rounded-xl bg-card border border-border/40 hover:border-primary/30 transition-all cursor-pointer shadow-sm hover:shadow-md"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => onTweakToggle(tweak)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        report.status === "resolved" ? "bg-emerald-500" :
                        report.risk_level === "high" ? "bg-red-500" :
                        report.risk_level === "medium" ? "bg-amber-500" :
                        "bg-blue-500"
                      )} />
                      <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground truncate">
                        {tweak.title}
                      </span>
                    </div>
                    <h5 className="text-xs font-semibold text-foreground line-clamp-1 leading-tight mb-0.5">
                      {report.title}
                    </h5>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed italic">
                      &quot;{report.description}&quot;
                    </p>
                  </div>

                  {user?.id === report.user_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(report);
                      }}
                      disabled={isDeleting === report.id}
                    >
                      {isDeleting === report.id ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <TrashIcon className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/10">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn(
                      "text-[9px] h-3.5 px-1 font-normal lowercase",
                      report.status === "resolved" ? "text-emerald-500 border-emerald-500/20" : "text-amber-500 border-amber-500/20"
                    )}>
                      {report.status}
                    </Badge>
                    <span className={cn(
                      "text-[9px] font-medium",
                      report.risk_level === "high" ? "text-red-500" :
                      report.risk_level === "medium" ? "text-amber-500" : "text-emerald-500"
                    )}>
                      {report.risk_level} risk
                    </span>
                  </div>
                  <span className="text-[9px] text-muted-foreground opacity-60">
                    {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <TweakReportDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        isDeleting={!!isDeleting}
        reportTitle={selectedReport?.title}
      />
    </div>
  );
}
