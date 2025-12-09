import { createClient } from "@/shared/utils/supabase/server";
import type { TweakCategory, Tweak } from "@/features/tweaks/types/tweak.types";

export async function fetchTweakCategories(): Promise<TweakCategory[]> {
  const supabase = await createClient();
  
  // Fetch tweaks with all necessary fields including code
  const { data: tweaks, error: tweaksError } = await supabase
    .from("tweaks")
    .select("id, title, icon, description, category_id, tweak_metadata, code");
  if (tweaksError) throw tweaksError;

  // Fetch categories with only essential fields
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("id, name, icon");
  if (catError) throw catError;

  // Parse tweak_metadata if it's a string (should be object)
  const parsedTweaks = tweaks.map((t: any) => ({
    ...t,
    tweak_metadata:
      typeof t.tweak_metadata === "string"
        ? JSON.parse(t.tweak_metadata)
        : t.tweak_metadata,
  }));

  // Group tweaks by category
  const grouped: TweakCategory[] = categories.map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    tweaks: parsedTweaks.filter((t: Tweak) => t.category_id === cat.id),
  }));

  return grouped;
}

