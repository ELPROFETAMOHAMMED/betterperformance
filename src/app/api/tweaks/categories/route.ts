import { createClient } from "@/shared/utils/supabase/server";
import type { TweakCategory, Tweak } from "@/features/tweaks/types/tweak.types";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: categoriesData, error: catError } = await supabase
      .from("categories")
      .select(`
        id, name, icon, description,
        tweaks (
          id, title, description, category_id, code,
          download_count, favorite_count,
          is_visible, tweak_comment, docs, image, notes,
          tweak_reports(id)
        )
      `)
      .order("name");

    if (catError) throw catError;

    type DBReport = { id: string };
    type DBTweak = Tweak & { tweak_reports: DBReport[] | null };
    type DBCategory = {
      id: string;
      name: string;
      icon: string | null;
      description: string | null;
      tweaks: DBTweak[] | null;
    };

    const grouped: TweakCategory[] = ((categoriesData as unknown) as DBCategory[])
      .map((cat: DBCategory) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon ?? undefined,
        description: cat.description ?? undefined,
        tweaks: (cat.tweaks || []).map((t: DBTweak) => ({
          ...t,
          report_count: t.tweak_reports?.length ?? 0,
        })),
      }))
      .filter((cat: TweakCategory) => cat.tweaks && cat.tweaks.length > 0);

    return NextResponse.json(grouped);
  } catch (error) {
    console.error("Error fetching tweak categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch tweak categories" },
      { status: 500 }
    );
  }
}
