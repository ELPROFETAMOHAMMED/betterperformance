"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { profile } from "@/types/user.types";

export function useUser() {
  const supabase = createClient();
  const [user, setUser] = useState<profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchUserData = async (authUser: any) => {
      // Fetch profile data from profiles table (this is the source of truth for role)
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      // Use auth user as base, merge with profile data
      // Role comes ONLY from profiles table, default to "user" if not found
      const userData: profile = {
        ...authUser,
        user_metadata: {
          ...authUser.user_metadata,
          // Merge profile data into user_metadata if it exists and no error
          ...(profileData &&
            !profileError && {
              name: profileData.name || authUser.user_metadata?.name,
              avatar_url:
                profileData.avatar_url || authUser.user_metadata?.avatar_url,
              bio: profileData.bio || authUser.user_metadata?.bio,
            }),
          // Role comes ONLY from profiles table, default to "user"
          role: (profileData && !profileError && profileData.role) || "user",
        },
      };

      if (mounted) {
        setUser(userData);
        setLoading(false);
      }
    };

    const init = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting session:", sessionError);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      const authUser = session?.user;
      if (mounted) {
        if (authUser) {
          await fetchUserData(authUser);
        } else {
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
      if (mounted) {
        if (authUser) {
          await fetchUserData(authUser);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, loading };
}
