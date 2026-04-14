import { createClient } from "@/shared/utils/supabase/server";
import type {
  CreateWallpaperInput,
  Wallpaper,
} from "@/features/wallpapers/types/wallpaper.types";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function createWallpaper(
  supabase: ServerSupabaseClient,
  input: CreateWallpaperInput
): Promise<Wallpaper> {
  const { data, error } = await supabase
    .from("wallpapers")
    .insert([
      {
        title: input.title,
        storage_path: input.storagePath,
        public_url: input.publicUrl,
        width: input.width,
        height: input.height,
        file_size_bytes: input.fileSizeBytes,
        tags: input.tags,
        created_by: input.createdBy,
      },
    ])
    .select(
      "id, title, storage_path, public_url, width, height, file_size_bytes, resolution, tags, created_by, created_at, updated_at"
    )
    .single();

  if (error) {
    throw error;
  }

  return data as Wallpaper;
}
