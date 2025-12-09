import { createClient } from "@/shared/utils/supabase/server";
import { redirect } from "next/navigation";

/**
 * Server-side authentication guard
 * Returns the authenticated user or redirects to login
 */
export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

