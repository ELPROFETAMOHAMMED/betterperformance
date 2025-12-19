import { createClient } from "@/shared/utils/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
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

    // Update the tweak
    const { data: updatedTweak, error: tweakError } = await supabase
      .from("tweaks")
      .update({
        title,
        description: description || null,
        code,
        category_id: finalCategoryId,
        notes: notes || null,
        tweak_comment: tweak_comment || null,
        docs: docs || null,
        is_visible: is_visible ?? true,
        image: image || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (tweakError) {
      throw tweakError;
    }

    return NextResponse.json({ success: true, tweak: updatedTweak });
  } catch (error) {
    console.error("Error updating tweak:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update tweak",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Delete the tweak
    const { error: tweakError } = await supabase
      .from("tweaks")
      .delete()
      .eq("id", id);

    if (tweakError) {
      throw tweakError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tweak:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete tweak",
      },
      { status: 500 }
    );
  }
}

