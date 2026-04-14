import { NextResponse } from "next/server";

import type {
  FavoriteItemType,
  ToggleFavoriteInput,
} from "@/features/favorites/types/favorite.types";
import { createClient } from "@/shared/utils/supabase/server";

function isFavoriteItemType(value: unknown): value is FavoriteItemType {
  return value === "tweak" || value === "wallpaper";
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Partial<ToggleFavoriteInput>;

    if (!isFavoriteItemType(body.itemType) || typeof body.itemId !== "string" || !body.itemId.trim()) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const itemType = body.itemType;
    const itemId = body.itemId;

    const query = supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("item_type", itemType)
      .limit(1);

    const { data: existingData, error: existingError } =
      itemType === "tweak" ? await query.eq("tweak_id", itemId) : await query.eq("wallpaper_id", itemId);

    if (existingError) {
      throw existingError;
    }

    const existing = existingData?.[0];

    if (existing) {
      const { error: deleteError } = await supabase
        .from("favorites")
        .delete()
        .eq("id", existing.id)
        .eq("user_id", user.id);

      if (deleteError) {
        throw deleteError;
      }

      return NextResponse.json({ success: true, isFavorite: false });
    }

    const insertPayload =
      itemType === "tweak"
        ? {
            user_id: user.id,
            item_type: "tweak",
            tweak_id: itemId,
            wallpaper_id: null,
          }
        : {
            user_id: user.id,
            item_type: "wallpaper",
            tweak_id: null,
            wallpaper_id: itemId,
          };

    const { error: insertError } = await supabase.from("favorites").insert([insertPayload]);

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ success: true, isFavorite: true });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 });
  }
}
