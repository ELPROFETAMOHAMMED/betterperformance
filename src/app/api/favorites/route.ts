import { NextResponse } from "next/server";

import type { FavoriteItem } from "@/features/favorites/types/favorite.types";
import type { Tweak } from "@/features/tweaks/types/tweak.types";
import type { Wallpaper } from "@/features/wallpapers/types/wallpaper.types";
import { createClient } from "@/shared/utils/supabase/server";

type FavoriteRow = {
  id: string;
  item_type: "tweak" | "wallpaper";
  created_at: string;
  tweak: Tweak[] | null;
  wallpaper: Wallpaper[] | null;
};

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
      .select(
        "id, item_type, created_at, tweak:tweak_id(id, title, description, code, category_id, download_count, favorite_count, image, notes, is_visible, tweak_comment, docs), wallpaper:wallpaper_id(id, title, storage_path, public_url, width, height, file_size_bytes, resolution, tags, created_by, created_at, updated_at)"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const favorites: FavoriteItem[] = (data as FavoriteRow[])
      .map((row) => {
        const tweak = row.tweak?.[0] ?? null;
        const wallpaper = row.wallpaper?.[0] ?? null;

        if (row.item_type === "tweak" && tweak) {
          return {
            id: row.id,
            itemType: "tweak",
            tweak,
            wallpaper: null,
            createdAt: row.created_at,
          } satisfies FavoriteItem;
        }

        if (row.item_type === "wallpaper" && wallpaper) {
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
