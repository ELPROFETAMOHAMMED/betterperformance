import { createClient } from "@/shared/utils/supabase/server";
import type {
  UploadWallpaperInput,
  WallpaperUploadResult,
} from "@/features/wallpapers/types/wallpaper.types";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function uploadWallpaper(
  supabase: ServerSupabaseClient,
  { file, userId }: UploadWallpaperInput
): Promise<WallpaperUploadResult> {
  const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${userId}-${Date.now()}.${fileExtension}`;
  const storagePath = `uploads/${fileName}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage
    .from("wallpapers")
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("wallpapers").getPublicUrl(storagePath);

  return {
    publicUrl,
    storagePath,
  };
}
