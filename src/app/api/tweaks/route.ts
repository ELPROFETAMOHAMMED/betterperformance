import { createClient } from "@/shared/utils/supabase/server";
import { resolveCategoryId } from "@/features/tweaks/server/resolve-category-id";
import { requireAdmin } from "@/shared/auth/require-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const adminCheck = await requireAdmin(supabase);

    if (adminCheck.response) {
      return adminCheck.response;
    }

    const body = await request.json();
    const {
      title,
      description,
      code,
      category_id,
      category_name,
      category_icon,
      category_description,
      notes,
      tweak_comment,
      docs,
      is_visible,
      image,
    } = body;

    if (!title || !code) {
      return NextResponse.json(
        { error: "Title and code are required" },
        { status: 400 }
      );
    }

    const finalCategoryId = await resolveCategoryId(supabase, {
      categoryDescription: category_description,
      categoryIcon: category_icon,
      categoryId: category_id,
      categoryName: category_name,
    });

    if (!finalCategoryId) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    // Create the tweak
    const { data: newTweak, error: tweakError } = await supabase
      .from("tweaks")
      .insert([
        {
          title,
          description: description || null,
          code,
          category_id: finalCategoryId,
          notes: notes || null,
          tweak_comment: tweak_comment || null,
          docs: docs || null,
          is_visible: is_visible ?? true,
          image: image || null,
          download_count: 0,
          favorite_count: 0,
        },
      ])
      .select()
      .single();

    if (tweakError) {
      throw tweakError;
    }

    return NextResponse.json({ success: true, tweak: newTweak });
  } catch (error) {
    console.error("Error creating tweak:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create tweak",
      },
      { status: 500 }
    );
  }
}

