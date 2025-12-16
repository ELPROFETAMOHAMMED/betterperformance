import { createClient } from "@/shared/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: reports, error } = await supabase
      .from("tweak_reports")
      .select("*")
      .eq("tweak_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tweak reports:", error);
      return NextResponse.json(
        { error: "Failed to fetch reports" },
        { status: 500 }
      );
    }

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error in GET tweak reports:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

