import { createClient } from "@/shared/utils/supabase/server";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

type ResolveCategoryIdInput = {
  categoryDescription?: string | null;
  categoryIcon?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
};

export async function resolveCategoryId(
  supabase: ServerSupabaseClient,
  {
    categoryDescription,
    categoryIcon,
    categoryId,
    categoryName,
  }: ResolveCategoryIdInput
) {
  if (categoryId) {
    return categoryId;
  }

  if (!categoryName) {
    return null;
  }

  const { data: newCategory, error } = await supabase
    .from("categories")
    .insert([
      {
        name: categoryName,
        icon: categoryIcon || null,
        description: categoryDescription || null,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return newCategory.id;
}
