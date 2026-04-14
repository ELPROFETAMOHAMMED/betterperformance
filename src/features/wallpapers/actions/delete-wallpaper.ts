"use server";

import { requireAdmin } from "@/shared/auth/require-admin";
import { createClient } from "@/shared/utils/supabase/server";
import { deleteWallpaperById } from "@/features/wallpapers/services/delete-wallpaper-by-id";

export async function deleteWallpaperAction(wallpaperId: string) {
  try {
    const supabase = await createClient();
    const adminCheck = await requireAdmin(supabase);

    if (adminCheck.response) {
      return {
        success: false,
        error: adminCheck.response.status === 401 ? "Unauthorized" : "Forbidden",
      };
    }

    await deleteWallpaperById(supabase, wallpaperId);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete wallpaper",
    };
  }
}
