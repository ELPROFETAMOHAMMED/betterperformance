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
    const { name, icon, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Update the category
    const { data: updatedCategory, error: categoryError } = await supabase
      .from("categories")
      .update({
        name: name.trim(),
        icon: icon?.trim() || null,
        description: description?.trim() || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (categoryError) {
      throw categoryError;
    }

    return NextResponse.json({ success: true, category: updatedCategory });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update category",
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

    // First, delete all tweaks in this category (cascade delete)
    const { error: tweaksError } = await supabase
      .from("tweaks")
      .delete()
      .eq("category_id", id);

    if (tweaksError) {
      throw tweaksError;
    }

    // Then delete the category
    const { error: categoryError } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (categoryError) {
      throw categoryError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete category",
      },
      { status: 500 }
    );
  }
}

