import { createClient } from "@/shared/utils/supabase/server";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

type WallpaperStorageRow = {
  storage_path: string;
};

export async function deleteWallpaperById(
  supabase: ServerSupabaseClient,
  wallpaperId: string
) {
  const { data: wallpaper, error: fetchError } = await supabase
    .from("wallpapers")
    .select("storage_path")
    .eq("id", wallpaperId)
    .single<WallpaperStorageRow>();

  if (fetchError) {
    throw fetchError;
  }

  const { error: deleteRowError } = await supabase
    .from("wallpapers")
    .delete()
    .eq("id", wallpaperId);

  if (deleteRowError) {
    throw deleteRowError;
  }

  if (wallpaper.storage_path) {
    const { error: deleteStorageError } = await supabase.storage
      .from("wallpapers")
      .remove([wallpaper.storage_path]);

    if (deleteStorageError) {
      console.error("Failed to delete wallpaper file:", deleteStorageError);
    }
  }
}
