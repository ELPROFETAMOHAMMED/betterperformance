import { createClient } from "@/utils/supabase/server";
import type { TweakCategory, Tweak } from "@/types/tweak.types";

export async function fetchTweakCategories(): Promise<TweakCategory[]> {
  const supabase = await createClient();
  // Fetch all tweaks and categories
  const { data: tweaks, error: tweaksError } = await supabase
    .from("tweaks")
    .select("*, tweak_metadata"); // ensure tweak_metadata is selected
  if (tweaksError) throw tweaksError;

  // Fetch categories (assuming you have a categories table)
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("*");
  if (catError) throw catError;

  // Parse tweak_metadata if it's a string (should be object)
  const parsedTweaks = tweaks.map((t: any) => ({
    ...t,
    tweak_metadata:
      typeof t.tweak_metadata === "string"
        ? JSON.parse(t.tweak_metadata)
        : t.tweak_metadata,
  }));

  console.log("Fetched tweaks:", parsedTweaks);

  // Group tweaks by category
  const grouped: TweakCategory[] = categories.map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    tweaks: parsedTweaks.filter((t: Tweak) => t.category_id === cat.id),
  }));

  return grouped;
}
