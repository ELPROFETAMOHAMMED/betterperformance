import { createClient } from "@/shared/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { tweakIds } = body;

    if (!Array.isArray(tweakIds) || tweakIds.length === 0) {
      return NextResponse.json(
        { error: "tweakIds must be a non-empty array" },
        { status: 400 }
      );
    }

    // Iterate sequentially to ensure each increment happens one by one
    const errors: string[] = [];
    for (const id of tweakIds) {
      if (!id || typeof id !== "string") {
        errors.push(`Invalid tweak ID: ${id}`);
        continue;
      }

      const { error } = await supabase.rpc("increment_download_count", {
        tweak_id: id,
      });

      if (error) {
        console.error(`Error incrementing download count for tweak ${id}:`, error);
        errors.push(`Failed to increment tweak ${id}: ${error.message}`);
        // Continue with other tweaks even if one fails
      }
    }

    if (errors.length > 0 && errors.length === tweakIds.length) {
      // All failed
      return NextResponse.json(
        { error: "Failed to increment download counts", details: errors },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      ...(errors.length > 0 && { warnings: errors })
    });
  } catch (error) {
    console.error("Error incrementing download counts:", error);
    return NextResponse.json(
      { error: "Failed to increment download counts", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}




