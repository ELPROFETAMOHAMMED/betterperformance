"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { createClient } from "@/shared/utils/supabase/client";
import type {
  profile,
  googleUserMetadata,
} from "@/features/auth/types/user.types";
import type { User } from "@supabase/supabase-js";

interface UserContextType {
  user: profile | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
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
              // Ignore these as they are handled in logic
            }
          }
        } catch (error) {
          profileError = error as Error;
        }
      }

      // Helper function to normalize and validate role
      const normalizeRole = (role: unknown): Role | null => {
        if (!role) return null;
        // Convert to string and trim, handle both string and non-string values
        const roleStr = String(role).trim().toLowerCase();
        if (roleStr === "admin") return "admin";
        if (roleStr === "user") return "user";
        return null;
      };

      // Priority: profileData.role > user_metadata.role > "user"
      // The profiles table is the source of truth for roles
      const profileRole = profileData && !profileError && profileData.role
        ? normalizeRole(profileData.role)
        : null;
      
      const metadataRole = authUser.user_metadata?.role
        ? normalizeRole(authUser.user_metadata.role)
        : null;
      
      // Use profile role first (source of truth), then metadata, then default
      const finalRole = profileRole || metadataRole || "user";

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
          role: finalRole as Role,
        },
      };

      if (mounted) {
        setUser(userData);
        setLoading(false);
      }
    };

    // Helper to get user with timeout
    const getUserWithTimeout = async (
      timeoutMs = 5000
    ): Promise<{ user: User | null; error: Error | null }> => {
      let timeoutId: NodeJS.Timeout | null = null;

      try {
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

        if (timeoutId) clearTimeout(timeoutId);

        if ("data" in result) {
          return { user: result.data.user, error: result.error };
        } else {
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
      } catch {
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

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  
  // If the hook is used outside of the provider, it should gracefully return { user: null, loading: false }
  // instead of throwing, based on user requirements for "outside the (main) layout" pages.
  if (context === undefined) {
    return { user: null, loading: false };
  }
  
  return context;
}
