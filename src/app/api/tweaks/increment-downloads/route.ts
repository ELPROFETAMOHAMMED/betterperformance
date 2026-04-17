import { createClient } from "@/shared/utils/supabase/server";
import { NextResponse } from "next/server";
import { rateLimit } from "@/shared/utils/rate-limit";

type DownloadCountRow = {
  id: string;
  download_count: number | null;
};

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

    const { data: tweaks, error: fetchError } = await supabase
      .from("tweaks")
      .select("id, download_count")
      .in("id", validIds);

    if (fetchError) {
      console.error("Error loading tweak download counts:", fetchError);
      return NextResponse.json(
        { error: "Failed to increment download counts", details: fetchError.message },
        { status: 500 }
      );
    }

    const updates = (tweaks ?? []).map((tweak: DownloadCountRow) =>
      supabase
        .from("tweaks")
        .update({ download_count: (tweak.download_count ?? 0) + 1 })
        .eq("id", tweak.id)
    );

    const results = await Promise.all(updates);
    const updateError = results.find(({ error }) => Boolean(error))?.error;

    if (updateError) {
      console.error("Error batch-incrementing download counts:", updateError);
      return NextResponse.json(
        { error: "Failed to increment download counts", details: updateError.message },
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




