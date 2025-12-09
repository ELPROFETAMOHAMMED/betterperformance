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

    const { id } = await params;
    const body = await request.json();

    // Handle rename
    if (body.name !== undefined) {
      const { error } = await supabase
        .from("tweak_history")
        .update({ name: body.name })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // Handle favorite toggle
    if (body.isFavorite !== undefined) {
      const { error } = await supabase
        .from("tweak_history")
        .update({ is_favorite: body.isFavorite })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // Handle tweaks update
    if (body.tweaks !== undefined) {
      const { error } = await supabase
        .from("tweak_history")
        .update({ tweaks: JSON.stringify(body.tweaks) })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Error updating tweak history:", error);
    return NextResponse.json(
      { error: "Failed to update tweak history" },
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

    const { id } = await params;
    const { error } = await supabase
      .from("tweak_history")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tweak history:", error);
    return NextResponse.json(
      { error: "Failed to delete tweak history" },
      { status: 500 }
    );
  }
}

