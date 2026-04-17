import { createClient } from "@/shared/utils/supabase/server";
import type { TweakHistoryEntry } from "@/features/tweaks/types/tweak.types";
import type { SelectedItem } from "@/shared/types/selection.types";
import { NextResponse } from "next/server";
import { rateLimit } from "@/shared/utils/rate-limit";
import type { Tweak } from "@/features/tweaks/types/tweak.types";

interface TweakHistoryRow {
  id: string;
  name: string | null;
  created_at: string;
  tweaks: SelectedItem[] | string | unknown;
  is_favorite: boolean | null;
}

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

function normalizeSelectionItems(
  value: unknown,
  legacyTweaksById: Map<string, Tweak>
): SelectedItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (isSelectedItem(item)) {
      return [item];
    }

    if (isLegacySelectionRef(item)) {
      const tweak = legacyTweaksById.get(item.id);
      return tweak ? [{ id: tweak.id, type: "tweak", item: tweak }] : [];
    }

    return [];
  });
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("tweak_history")
      .select("id, name, created_at, tweaks, is_favorite")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const legacyTweakIds = (data ?? []).flatMap((entry: TweakHistoryRow) => {
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

    const history: TweakHistoryEntry[] = (data || []).map((entry: TweakHistoryRow) => ({
      id: entry.id,
      name: entry.name ?? undefined,
      createdAt: entry.created_at,
      userId: user.id,
      tweaks: normalizeSelectionItems(
        typeof entry.tweaks === "string" ? JSON.parse(entry.tweaks) : entry.tweaks,
        legacyTweaksById
      ),
      isFavorite: entry.is_favorite ?? false,
    }));

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching tweak history:", error);
    return NextResponse.json(
      { error: "Failed to fetch tweak history" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { allowed } = await rateLimit(
      `history:${user.id}`,
      20,          // 20 requests
      60 * 1000    // por minuto
    );
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { tweaks, name, isFavorite } = body;

    const { error } = await supabase.from("tweak_history").insert([
      {
        user_id: user.id,
        tweaks: JSON.stringify(tweaks),
        name,
        created_at: new Date().toISOString(),
        is_favorite: Boolean(isFavorite),
      },
    ]);

    if (error) {
      throw error;
    }

    // If this is a favorite, increment favorite_count for each tweak
    if (isFavorite && Array.isArray(tweaks) && tweaks.length > 0) {
      try {
        const tweakIds = tweaks
          .filter((t): t is SelectedItem & { type: "tweak" } => t.type === "tweak")
          .map((t) => t.id)
          .filter(Boolean);
        if (tweakIds.length > 0) {
          // NOTE: This requires the PostgreSQL function increment_favorite_count_batch to
          // exist in Supabase, accepting a uuid[] parameter and updating all rows in a
          // single query. Create it if it does not exist.
          const { error: rpcError } = await supabase.rpc("increment_favorite_count_batch", {
            tweak_ids: tweakIds,
          });

          if (rpcError) {
            console.error("Error batch-incrementing favorite counts:", rpcError);
          }
        }
      } catch (favoriteError) {
        console.error("Error incrementing favorite counts:", favoriteError);
        // Don't fail the entire request if favorite increment fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving tweak history:", error);
    return NextResponse.json(
      { error: "Failed to save tweak history" },
      { status: 500 }
    );
  }
}




