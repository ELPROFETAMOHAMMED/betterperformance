import { createClient } from "@/shared/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { tweakIds } = body;

    if (!Array.isArray(tweakIds)) {
      return NextResponse.json(
        { error: "tweakIds must be an array" },
        { status: 400 }
      );
    }

    // Iterate sequentially to ensure each increment happens one by one
    for (const id of tweakIds) {
      const { error } = await supabase.rpc("increment_favorite_count", {
        tweak_id: id,
      });

      if (error) {
        console.error(`Error incrementing favorite count for tweak ${id}:`, error);
        // Continue with other tweaks even if one fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error incrementing favorite counts:", error);
    return NextResponse.json(
      { error: "Failed to increment favorite counts" },
      { status: 500 }
    );
  }
}

