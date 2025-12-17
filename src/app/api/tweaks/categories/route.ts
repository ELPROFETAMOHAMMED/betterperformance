import { createClient } from "@/shared/utils/supabase/server";
import type { TweakCategory, Tweak } from "@/features/tweaks/types/tweak.types";
import { NextResponse } from "next/server";

interface CategoryRow {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch tweaks with report counts
    const { data: tweaks, error: tweaksError } = await supabase
      .from("tweaks")
      .select(
        `
        id, 
        title, 
        description, 
        category_id, 
        code, 
        download_count, 
        favorite_count, 
        image, 
        notes, 
        is_visible, 
        tweak_comment,
        docs,
        default_tweak_value,
        tweak_reports(id)
      `
      )
      .eq("is_visible", true);

    if (tweaksError) throw tweaksError;

    // Fetch categories with all fields
    const { data: categoriesData, error: catError } = await supabase
      .from("categories")
      .select("id, name, icon, description");
    if (catError) throw catError;

    const categories = categoriesData as CategoryRow[];

    // Group tweaks by category
    const grouped: TweakCategory[] = categories
      .map((cat: CategoryRow) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon ?? undefined,
        description: cat.description ?? undefined,
        tweaks: (tweaks || [])
          .filter((t: { category_id: string }) => t.category_id === cat.id)
          .map((t: Tweak & { tweak_reports: { id: string }[] }) => ({
            ...t,
            report_count: t.tweak_reports?.length ?? 0,
          })),
      }))
      .filter((cat) => cat.tweaks && cat.tweaks.length > 0); // Filter out empty categories

    return NextResponse.json(grouped);
  } catch (error) {
    console.error("Error fetching tweak categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch tweak categories" },
      { status: 500 }
    );
  }
}
