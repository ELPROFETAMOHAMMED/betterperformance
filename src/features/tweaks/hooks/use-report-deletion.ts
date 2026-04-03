"use client";

import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { deleteTweakReport } from "@/features/tweaks/actions/delete-report";
import type { TweakReport } from "@/features/tweaks/types/tweak-report.types";

type UseReportDeletionOptions = {
  onSuccess?: () => void;
};

export function useReportDeletion(options?: UseReportDeletionOptions) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<TweakReport | null>(null);

  const openDeleteDialog = (report: TweakReport) => {
    setSelectedReport(report);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedReport(null);
  };

  const confirmDelete = async () => {
    if (!selectedReport) {
      return { success: false, error: "No report selected" };
    }

    setIsDeleting(selectedReport.id);

    try {
      const result = await deleteTweakReport(selectedReport.id);

      if (result.success) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["all-reports-with-descriptions"],
          }),
          queryClient.invalidateQueries({ queryKey: ["user-reports"] }),
        ]);
        options?.onSuccess?.();
        closeDeleteDialog();
      }

      return result;
    } finally {
      setIsDeleting(null);
    }
  };

  return {
    isDeleting,
    deleteDialogOpen,
    selectedReport,
    setDeleteDialogOpen,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
  };
}
