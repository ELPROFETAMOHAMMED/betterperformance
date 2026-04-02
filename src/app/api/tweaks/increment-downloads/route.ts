import { createClient } from "@/shared/utils/supabase/server";
import { NextResponse } from "next/server";
import { rateLimit } from "@/shared/utils/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-real-ip")
      ?? request.headers.get("x-forwarded-for")?.split(",")[0].trim()
      ?? "anonymous";

    const { allowed } = await rateLimit(
      `downloads:${ip}`,
      5,           // 5 requests
      60 * 1000    // por minuto
    );

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 }
      );
    }

    const supabase = await createClient();
    const body = await request.json();
    const { tweakIds } = body;

    if (!Array.isArray(tweakIds) || tweakIds.length === 0) {
      return NextResponse.json(
        { error: "tweakIds must be a non-empty array" },
        { status: 400 }
      );
    }

    // Validate all IDs before calling the DB
    const validIds = tweakIds.filter((id: unknown): id is string => !!id && typeof id === "string");
    const invalidCount = tweakIds.length - validIds.length;

    if (validIds.length === 0) {
      return NextResponse.json(
        { error: "No valid tweak IDs provided" },
        { status: 400 }
      );
    }

    // NOTE: This requires the PostgreSQL function increment_download_count_batch to exist
    // in Supabase, accepting a uuid[] parameter and updating all rows in a single query.
    // Create it if it does not exist.
    const { error: rpcError } = await supabase.rpc("increment_download_count_batch", {
      tweak_ids: validIds,
    });

    if (rpcError) {
      console.error("Error batch-incrementing download counts:", rpcError);
      return NextResponse.json(
        { error: "Failed to increment download counts", details: rpcError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ...(invalidCount > 0 && { warnings: [`${invalidCount} invalid ID(s) were skipped`] }),
    });
  } catch (error) {
    console.error("Error incrementing download counts:", error);
    return NextResponse.json(
      { error: "Failed to increment download counts", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}




