"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Tweak, TweakCategory } from "@/features/tweaks/types/tweak.types";

export function useAdminTweakActions() {
  const router = useRouter();
  const [tweakFormDialogOpen, setTweakFormDialogOpen] = useState(false);
  const [editingTweak, setEditingTweak] = useState<Tweak | null>(null);
  const [categoryFormDialogOpen, setCategoryFormDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TweakCategory | null>(
    null
  );

  const handleCreateTweak = () => {
    setEditingTweak(null);
    setTweakFormDialogOpen(true);
  };

  const handleEditTweak = (tweak: Tweak) => {
    setEditingTweak(tweak);
    setTweakFormDialogOpen(true);
  };

  const handleEditCategory = (category: TweakCategory) => {
    setEditingCategory(category);
    setCategoryFormDialogOpen(true);
  };

  const handleTweakFormSuccess = () => {
    router.refresh();
  };

  const handleCategoryFormSuccess = () => {
    router.refresh();
  };

  return {
    tweakFormDialogOpen,
    setTweakFormDialogOpen,
    editingTweak,
    categoryFormDialogOpen,
    setCategoryFormDialogOpen,
    editingCategory,
    handleCreateTweak,
    handleEditTweak,
    handleEditCategory,
    handleTweakFormSuccess,
    handleCategoryFormSuccess,
  };
}
