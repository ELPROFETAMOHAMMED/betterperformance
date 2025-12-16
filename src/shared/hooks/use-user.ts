"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/shared/utils/supabase/client";
import type { profile } from "@/features/auth/types/user.types";
import type { User } from "@supabase/supabase-js";

export function useUser() {
  const [user, setUser] = useState<profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Create a stable supabase client instance
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;

    const fetchUserData = async (authUser: User) => {
      let profileData: any = null;
      let profileError: any = null;

      if (authUser?.id) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authUser.id)
            .single();

          profileData = data;
          profileError = error;
        } catch (error) {
          profileError = error as Error;
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
          role: (profileData && !profileError && profileData.role) || "user",
        },
      };

      if (mounted) {
        setUser(userData);
        setLoading(false);
      }
    };

    const init = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        const authUser = session?.user;

        if (!mounted) return;

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