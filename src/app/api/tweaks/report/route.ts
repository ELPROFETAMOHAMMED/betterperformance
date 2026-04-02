import { NextResponse } from "next/server";
import { z } from "zod";
import { createTweakReport } from "@/features/tweaks/services/create-tweak-report";
import { createClient } from "@/shared/utils/supabase/server";
import { rateLimit } from "@/shared/utils/rate-limit";

const reportSchema = z.object({
  tweakId: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  riskLevel: z.enum(["low", "medium", "high"]),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { allowed } = await rateLimit(
      `report:${user.id}`,
      3,          // 3 requests
      60 * 60 * 1000  // por hora
    );
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedData = reportSchema.parse(body);

    const report = await createTweakReport(validatedData);

    return NextResponse.json(report);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (message === "You have already reported this tweak") {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}
