import { createClient } from "@/shared/utils/supabase/server";
import type {
  GetWallpapersInput,
  Wallpaper,
  WallpapersPageData,
} from "@/features/wallpapers/types/wallpaper.types";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 50;

export async function getWallpapers(
  input: GetWallpapersInput = {}
): Promise<WallpapersPageData> {
  const page = Math.max(input.page ?? DEFAULT_PAGE, 1);
  const pageSize = Math.min(Math.max(input.pageSize ?? DEFAULT_PAGE_SIZE, 1), 100);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const supabase = await createClient();

  const { count, data, error } = await supabase
    .from("wallpapers")
    .select(
      "id, title, storage_path, public_url, width, height, file_size_bytes, resolution, tags, created_by, created_at, updated_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return {
    items: (data ?? []) as Wallpaper[],
    page,
    pageSize,
    total: count ?? 0,
  };
}
