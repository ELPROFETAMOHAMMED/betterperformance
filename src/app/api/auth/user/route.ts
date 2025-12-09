import { createClient } from "@/shared/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data?.user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    return NextResponse.json({ user: data.user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}




