import { NextResponse } from "next/server";

import { createClient } from "@/shared/utils/supabase/server";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function requireAdmin(supabase: ServerSupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      user: null,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return {
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      user: null,
    };
  }

  return {
    response: null,
    user,
  };
}
