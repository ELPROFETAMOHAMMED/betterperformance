import { NextResponse } from "next/server";

import { requireAdmin } from "@/shared/auth/require-admin";
import { createClient } from "@/shared/utils/supabase/server";
import { deleteWallpaperById } from "@/features/wallpapers/services/delete-wallpaper-by-id";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const supabase = await createClient();
    const adminCheck = await requireAdmin(supabase);

    if (adminCheck.response) {
      return adminCheck.response;
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Wallpaper id is required" }, { status: 400 });
    }

    await deleteWallpaperById(supabase, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete wallpaper",
      },
      { status: 500 }
    );
  }
}
