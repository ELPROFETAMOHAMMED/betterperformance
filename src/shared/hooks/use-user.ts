"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/shared/utils/supabase/client";
import type {
  profile,
  googleUserMetadata,
} from "@/features/auth/types/user.types";
import type { User } from "@supabase/supabase-js";

export function useUser() {
  const [user, setUser] = useState<profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Create a stable supabase client instance
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;

    type Role = googleUserMetadata["role"];

    type ProfileRow = {
      id: string;
      name?: string | null;
      avatar_url?: string | null;
      bio?: string | null;
      role?: Role | null;
    };

    const fetchUserData = async (authUser: User) => {
      let profileData: ProfileRow | null = null;
      let profileError: Error | null = null;

      if (authUser?.id) {
        try {
          // Add timeout to profile query to prevent hanging if RLS blocks it
          const profileQueryPromise = supabase
            .from("profiles")
            .select("*")
            .eq("id", authUser.id)
            .single();

          const timeoutPromise = new Promise<{ data: null; error: Error }>(
            (resolve) => {
              setTimeout(() => {
                resolve({
                  data: null,
                  error: new Error("Profile query timeout - check RLS policies"),
                });
              }, 3000); // 3 second timeout for profile query
            }
          );

          const result = await Promise.race([
            profileQueryPromise,
            timeoutPromise,
          ]);

          profileData = result.data as ProfileRow | null;
          profileError = result.error as Error | null;

          // Log RLS-related errors for debugging
          if (profileError) {
            if (
              profileError.message.includes("timeout") ||
              profileError.message.includes("RLS") ||
              profileError.message.includes("permission") ||
              profileError.message.includes("policy") ||
              profileError.message.includes("infinite recursion")
            ) {
              console.warn(
                "Profile query failed (likely RLS issue):",
                profileError.message
              );
              
              // If infinite recursion, log a helpful message
              if (profileError.message.includes("infinite recursion")) {
                console.error(
                  "❌ RLS Policy Error: Your 'profiles' table has a policy that causes infinite recursion. " +
                  "This usually happens when a policy queries the same table it's protecting. " +
                  "Please check your RLS policies in Supabase and remove any policy that queries 'profiles' within a 'profiles' policy."
                );
              }
            }
          }
        } catch (error) {
          profileError = error as Error;
          console.warn("Profile query exception:", error);
        }
      }

      const userData: profile = {
        ...authUser,
        user_metadata: {
          ...authUser.user_metadata,
          ...(profileData &&
            !profileError && {
              name: profileData.name || authUser.user_metadata?.name,
              avatar_url:
                profileData.avatar_url || authUser.user_metadata?.avatar_url,
              bio: profileData.bio || authUser.user_metadata?.bio,
            }),
          role: ((profileData && !profileError && profileData.role) ??
            "user") as Role,
        },
      };

      if (mounted) {
        setUser(userData);
        setLoading(false);
      }
    };

    // Helper to get user with timeout
    // getSession() can hang in Chrome/Edge/Brave, so we use getUser() directly
    // which is more reliable in Chromium-based browsers
    const getUserWithTimeout = async (
      timeoutMs = 5000
    ): Promise<{ user: User | null; error: Error | null }> => {
      let timeoutId: NodeJS.Timeout | null = null;

      try {
        // Use getUser() directly (more reliable than getSession in Chromium browsers)
        const getUserPromise = supabase.auth.getUser();

        // Create timeout promise
        const timeoutPromise = new Promise<{ user: null; error: Error }>(
          (resolve) => {
            timeoutId = setTimeout(() => {
              resolve({
                user: null,
                error: new Error("getUser timeout after 5s"),
              });
            }, timeoutMs);
          }
        );

        const result = await Promise.race([getUserPromise, timeoutPromise]);

        // Clear timeout if getUser completed first
        if (timeoutId) clearTimeout(timeoutId);

        // Handle result
        if ("data" in result) {
          // This is the getUser result
          return { user: result.data.user, error: result.error };
        } else {
          // This is the timeout result
          console.warn("getUser timed out, user may not be authenticated");
          return result;
        }
      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);
        console.error("Error in getUserWithTimeout:", error);
        return { user: null, error: error as Error };
      }
    };

    const init = async () => {
      try {
        const { user: authUser, error } = await getUserWithTimeout(5000);

        if (!mounted) return;

        if (error) {
          // Don't log timeout errors as errors, they're expected if user isn't logged in
          if (!error.message.includes("timeout")) {
            console.error("Error getting user:", error);
          }
          setUser(null);
          setLoading(false);
          return;
        }

        if (authUser) {
          await fetchUserData(authUser);
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (e) {
        console.error("Unexpected error in useUser:", e);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user;
      if (!mounted) return;

      if (authUser) {
        await fetchUserData(authUser);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, loading };
}
