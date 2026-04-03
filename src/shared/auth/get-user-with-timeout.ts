import type { User } from "@supabase/supabase-js";

import { createClient } from "@/shared/utils/supabase/client";

type BrowserSupabaseClient = ReturnType<typeof createClient>;

export async function getUserWithTimeout(
  supabase: BrowserSupabaseClient,
  timeoutMs = 5000
): Promise<{ user: User | null; error: Error | null }> {
  let timeoutId: NodeJS.Timeout | null = null;

  try {
    const getUserPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise<{ user: null; error: Error }>(
      (resolve) => {
        timeoutId = setTimeout(() => {
          resolve({
            user: null,
            error: new Error(`getUser timeout after ${timeoutMs}ms`),
          });
        }, timeoutMs);
      }
    );
    const result = await Promise.race([getUserPromise, timeoutPromise]);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if ("data" in result) {
      return { user: result.data.user, error: result.error };
    }

    return result;
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    console.error("Error in getUserWithTimeout:", error);
    return { user: null, error: error as Error };
  }
}
