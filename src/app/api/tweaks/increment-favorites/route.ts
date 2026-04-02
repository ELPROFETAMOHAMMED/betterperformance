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

    // NOTE: This requires the PostgreSQL function increment_favorite_count_batch to exist
    // in Supabase, accepting a uuid[] parameter and updating all rows in a single query.
    // Create it if it does not exist.
    const { error: rpcError } = await supabase.rpc("increment_favorite_count_batch", {
      tweak_ids: tweakIds,
    });

    if (rpcError) {
      console.error("Error batch-incrementing favorite counts:", rpcError);
      return NextResponse.json(
        { error: "Failed to increment favorite counts", details: rpcError.message },
        { status: 500 }
      );
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

