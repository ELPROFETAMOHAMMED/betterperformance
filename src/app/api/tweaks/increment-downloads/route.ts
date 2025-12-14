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

    // Use Promise.all for parallel execution instead of sequential await
    // This significantly improves performance when incrementing multiple tweaks
    await Promise.all(
      tweakIds.map((id: string) =>
        supabase.rpc("increment_download_count", { tweak_id: id })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error incrementing download counts:", error);
    return NextResponse.json(
      { error: "Failed to increment download counts" },
      { status: 500 }
    );
  }
}




