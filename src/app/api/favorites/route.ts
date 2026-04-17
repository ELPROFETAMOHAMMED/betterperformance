import { NextResponse } from "next/server";

import type { FavoriteItem } from "@/features/favorites/types/favorite.types";
import type { Tweak } from "@/features/tweaks/types/tweak.types";
import type { Wallpaper } from "@/features/wallpapers/types/wallpaper.types";
import { createClient } from "@/shared/utils/supabase/server";

type FavoriteRow = {
  id: string;
  item_type: "tweak" | "wallpaper";
  created_at: string;
  tweak_id: string | null;
  wallpaper_id: string | null;
};

type FavoriteTweak = Pick<
  Tweak,
  | "id"
  | "title"
  | "description"
  | "code"
  | "category_id"
  | "download_count"
  | "favorite_count"
  | "image"
  | "notes"
  | "is_visible"
  | "tweak_comment"
  | "docs"
>;

type FavoriteWallpaper = Pick<
  Wallpaper,
  | "id"
  | "title"
  | "storage_path"
  | "public_url"
  | "width"
  | "height"
  | "file_size_bytes"
  | "resolution"
  | "tags"
  | "created_by"
  | "created_at"
  | "updated_at"
>;

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("favorites")
      .select("id, item_type, created_at, tweak_id, wallpaper_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const favoriteRows = (data ?? []) as unknown as FavoriteRow[];
    const tweakIds = favoriteRows
      .filter((row) => row.item_type === "tweak" && row.tweak_id)
      .map((row) => row.tweak_id as string);
    const wallpaperIds = favoriteRows
      .filter((row) => row.item_type === "wallpaper" && row.wallpaper_id)
      .map((row) => row.wallpaper_id as string);

    const [{ data: tweakData, error: tweakError }, { data: wallpaperData, error: wallpaperError }] =
      await Promise.all([
        tweakIds.length > 0
          ? supabase
              .from("tweaks")
              .select("id, title, description, code, category_id, download_count, favorite_count, image, notes, is_visible, tweak_comment, docs")
              .in("id", tweakIds)
          : Promise.resolve({ data: [], error: null }),
        wallpaperIds.length > 0
          ? supabase
              .from("wallpapers")
              .select("id, title, storage_path, public_url, width, height, file_size_bytes, resolution, tags, created_by, created_at, updated_at")
              .in("id", wallpaperIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

    if (tweakError) {
      throw tweakError;
    }

    if (wallpaperError) {
      throw wallpaperError;
    }

    const tweaksById = new Map(
      ((tweakData ?? []) as unknown as FavoriteTweak[]).map((tweak) => [tweak.id, tweak])
    );
    const wallpapersById = new Map(
      ((wallpaperData ?? []) as unknown as FavoriteWallpaper[]).map((wallpaper) => [wallpaper.id, wallpaper])
    );

    const favorites: FavoriteItem[] = favoriteRows
      .map((row) => {
        if (row.item_type === "tweak" && row.tweak_id) {
          const tweak = tweaksById.get(row.tweak_id);
          if (!tweak) {
            return null;
          }

          return {
            id: row.id,
            itemType: "tweak",
            tweak,
            wallpaper: null,
            createdAt: row.created_at,
          } satisfies FavoriteItem;
        }

        if (row.item_type === "wallpaper" && row.wallpaper_id) {
          const wallpaper = wallpapersById.get(row.wallpaper_id);
          if (!wallpaper) {
            return null;
          }

          return {
            id: row.id,
            itemType: "wallpaper",
            tweak: null,
            wallpaper,
            createdAt: row.created_at,
          } satisfies FavoriteItem;
        }

        return null;
      })
      .filter((item): item is FavoriteItem => item !== null);

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
  }
}
