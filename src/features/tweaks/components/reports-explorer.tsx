"use client";

import { ReportScopeToggle } from "@/features/tweaks/components/report-scope-toggle";
import { ReportsList } from "@/features/tweaks/components/reports-list";
import { TweakReportDeleteDialog } from "@/features/tweaks/components/tweak-report-delete-dialog";
import { useReportDeletion } from "@/features/tweaks/hooks/use-report-deletion";
import type { Tweak } from "@/features/tweaks/types/tweak.types";
import type { TweakReport } from "@/features/tweaks/types/tweak-report.types";
import { useUser } from "@/shared/hooks/use-user";

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
  const {
    confirmDelete,
    deleteDialogOpen,
    isDeleting,
    openDeleteDialog,
    selectedReport,
    setDeleteDialogOpen,
  } = useReportDeletion({
    onSuccess: onRefresh,
  });

  const reports = scope === "user" ? userReports : allReports;

  return (
    <div className="flex flex-col gap-4">
      <ReportScopeToggle
        scope={scope}
        onScopeChange={onScopeChange}
        allCount={allReports.length}
        userCount={userReports.length}
        canViewUserScope={Boolean(user)}
      />

      <ReportsList
        reports={reports}
        tweaksById={allTweaksMap}
        currentUserId={user?.id}
        isDeletingReportId={isDeleting}
        onDeleteReport={openDeleteDialog}
        onSelectTweak={onTweakToggle}
      />

      <TweakReportDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => {
          void confirmDelete();
        }}
        isDeleting={!!isDeleting}
        reportTitle={selectedReport?.title}
      />
    </div>
  );
}
