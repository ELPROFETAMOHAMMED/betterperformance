import { NextResponse } from "next/server";

import type { FavoriteItem } from "@/features/favorites/types/favorite.types";
import type { TweakHistoryEntry } from "@/features/tweaks/types/tweak.types";
import { createClient } from "@/shared/utils/supabase/server";
import type { SelectedItem } from "@/shared/types/selection.types";
import type { Tweak } from "@/features/tweaks/types/tweak.types";

type FavoriteHistoryRow = {
  id: string;
  name: string | null;
  created_at: string;
  tweaks: TweakHistoryEntry["tweaks"];
  is_favorite: boolean | null;
};

type LegacySelectionRef = {
  id: string;
};

function isSelectedItem(value: unknown): value is SelectedItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "type" in value &&
    ((value as { type?: unknown }).type === "tweak" || (value as { type?: unknown }).type === "wallpaper") &&
    "item" in value
  );
}

function isLegacySelectionRef(value: unknown): value is LegacySelectionRef {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return typeof (value as { id?: unknown }).id === "string" && !("type" in value) && !("item" in value);
}

function toFavoriteItem(entry: TweakHistoryEntry): FavoriteItem {
  return {
    id: entry.id,
    itemType: "selection",
    tweak: null,
    wallpaper: null,
    selection: {
      name: entry.name || "Saved selection",
      items: Array.isArray(entry.tweaks) ? entry.tweaks : [],
      createdAt: entry.createdAt,
    },
    createdAt: entry.createdAt,
  };
}

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
      .from("tweak_history")
      .select("id, name, created_at, tweaks, is_favorite")
      .eq("user_id", user.id)
      .eq("is_favorite", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const legacyTweakIds = (data ?? []).flatMap((entry: FavoriteHistoryRow) => {
      const rawTweaks = typeof entry.tweaks === "string" ? JSON.parse(entry.tweaks) : entry.tweaks;
      if (!Array.isArray(rawTweaks)) {
        return [];
      }

      return rawTweaks.filter(isLegacySelectionRef).map((item) => item.id);
    });

    const { data: legacyTweaks } = legacyTweakIds.length > 0
      ? await supabase
          .from("tweaks")
          .select("id, title, description, code, category_id, download_count, favorite_count, image, notes, is_visible, tweak_comment, docs")
          .in("id", Array.from(new Set(legacyTweakIds)))
      : { data: [] as Tweak[] };

    const legacyTweaksById = new Map<string, Tweak>((legacyTweaks ?? []).map((tweak) => [tweak.id, tweak]));

    const favorites: FavoriteItem[] = (data ?? []).flatMap((row: FavoriteHistoryRow) => {
      const items = Array.isArray(row.tweaks)
        ? row.tweaks.flatMap((item) => {
            if (isSelectedItem(item)) {
              return [item];
            }

            if (isLegacySelectionRef(item)) {
              const tweak = legacyTweaksById.get(item.id);
              return tweak ? [{ id: tweak.id, type: "tweak" as const, item: tweak }] : [];
            }

            return [];
          })
        : [];
      if (items.length === 0) {
        return [];
      }

      const entry: TweakHistoryEntry = {
        id: row.id,
        name: row.name ?? undefined,
        createdAt: row.created_at,
        userId: user.id,
        tweaks: items,
        isFavorite: row.is_favorite ?? true,
      };

      return [toFavoriteItem(entry)];
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
  }
}
