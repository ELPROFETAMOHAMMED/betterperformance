import { withTimeout } from "@/shared/utils/async-helpers";

export async function ensureDownloadSession(
  userLoading: boolean,
  hasUser: boolean
) {
  if ((!userLoading && hasUser) || typeof window === "undefined") {
    return;
  }

  try {
    const { createClient } = await import("@/shared/utils/supabase/client");
    const supabase = createClient();
    await withTimeout(supabase.auth.getSession(), 3000);
  } catch (error) {
    console.warn("Could not fetch user session:", error);
  }
}
