 "use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateTweakHistory, deleteTweakHistory } from "@/features/history-tweaks/utils/tweak-history-client";

export function useHistoryDialogs() {
  const queryClient = useQueryClient();

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openRenameDialog = useCallback((id: string, currentName: string) => {
    setRenameId(id);
    setRenameValue(currentName);
    setRenameDialogOpen(true);
  }, []);

  const closeRenameDialog = useCallback(() => {
    setRenameDialogOpen(false);
    setRenameId(null);
    setRenameValue("");
  }, []);

  const confirmRename = useCallback(async () => {
    if (!renameId || !renameValue.trim()) return;
    try {
      setIsRenaming(true);
      await updateTweakHistory(renameId, { name: renameValue.trim() });
      await queryClient.invalidateQueries({ queryKey: ["history-tweaks"] });
      toast.success("Renamed successfully");
      closeRenameDialog();
    } catch (error) {
      console.error(error);
      toast.error("Failed to rename selection");
    } finally {
      setIsRenaming(false);
    }
  }, [renameId, renameValue, queryClient, closeRenameDialog]);

  const openDeleteDialog = useCallback((id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setDeleteId(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await deleteTweakHistory(deleteId);
      await queryClient.invalidateQueries({ queryKey: ["history-tweaks"] });
      toast.success("Selection deleted");
      closeDeleteDialog();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete selection");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteId, queryClient, closeDeleteDialog]);

  return {
    // rename state
    renameDialogOpen,
    renameValue,
    isRenaming,
    setRenameDialogOpen,
    setRenameValue,
    openRenameDialog,
    confirmRename,
    // delete state
    deleteDialogOpen,
    isDeleting,
    setDeleteDialogOpen,
    openDeleteDialog,
    confirmDelete,
  };
}


