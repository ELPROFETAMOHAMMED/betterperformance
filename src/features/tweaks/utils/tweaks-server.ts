import { createClient } from "@/shared/utils/supabase/server";
import type { TweakCategory, Tweak } from "@/features/tweaks/types/tweak.types";

interface CategoryRow {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
}

export async function fetchTweakCategories(): Promise<TweakCategory[]> {
  const supabase = await createClient();
  
  // Fetch tweaks with all necessary fields including code
  const { data: tweaks, error: tweaksError } = await supabase
    .from("tweaks")
    .select("id, title, description, category_id, code, download_count, favorite_count, image, notes, is_visible, tweak_comment")
    .eq("is_visible", true);
  if (tweaksError) throw tweaksError;

  // Fetch categories with all fields
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("id, name, icon, description");
  if (catError) throw catError;

  // Group tweaks by category
  const grouped: TweakCategory[] = categories.map((cat: CategoryRow) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon ?? undefined,
    description: cat.description ?? undefined,
    tweaks: (tweaks || []).filter((t: Tweak) => t.category_id === cat.id),
  }));

  return grouped;
}

