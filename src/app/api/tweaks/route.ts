import { createClient } from "@/shared/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    let finalCategoryId = category_id;

    // Create new category if needed
    if (category_name && !category_id) {
      const { data: newCategory, error: categoryError } = await supabase
        .from("categories")
        .insert([
          {
            name: category_name,
            icon: category_icon || null,
            description: category_description || null,
          },
        ])
        .select()
        .single();

      if (categoryError) {
        throw categoryError;
      }

      finalCategoryId = newCategory.id;
    }

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

