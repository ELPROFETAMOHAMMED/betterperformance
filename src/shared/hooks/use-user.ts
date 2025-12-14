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
      let profileData = null;
      let profileError = null;

      // Try to fetch profile data from profiles table (this is the source of truth for role)
      // If this fails (e.g., RLS policy, API key issue), we'll use auth user data only
      // Only attempt to fetch if we have a valid auth user
      if (authUser?.id) {
        try {
          // Verify we have a valid session before attempting to fetch profile
          const { data: { session } } = await supabase.auth.getSession();
          
          // Only fetch profile if we have an active session
          if (session?.access_token) {
            const result = await supabase
              .from("profiles")
              .select("*")
              .eq("id", authUser.id)
              .single();
            
            profileData = result.data;
            profileError = result.error;

            // Silently handle errors related to RLS or API key issues
            // These are expected in some configurations and don't affect functionality
            // The profile fetch is optional - if it fails, we use auth user data only
              // No need to log these errors as they're expected RLS/configuration issues
          }
        } catch (error) {
          // Silently handle any unexpected errors - profile fetch is optional
          profileError = error as Error;
        }
      }

      // Use auth user as base, merge with profile data if available
      // Role comes from profiles table if available, otherwise default to "user"
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
          // Role comes from profiles table if available, default to "user"
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



