"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { buildUserProfile, type ProfileRow } from "@/shared/auth/build-user-profile";
import { getUserWithTimeout } from "@/shared/auth/get-user-with-timeout";
import { createClient } from "@/shared/utils/supabase/client";
import type { profile } from "@/features/auth/types/user.types";
import type { User } from "@supabase/supabase-js";

interface UserContextType {
  user: profile | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;

    const fetchUserData = async (authUser: User) => {
      let profileData: ProfileRow | null = null;
      let profileError: Error | null = null;

      if (authUser?.id) {
        try {
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
              }, 3000);
            }
          );

          const result = await Promise.race([
            profileQueryPromise,
            timeoutPromise,
          ]);

          profileData = result.data as ProfileRow | null;
          profileError = result.error as Error | null;
        } catch (error) {
          profileError = error as Error;
        }
      }

      if (mounted) {
        setUser(buildUserProfile(authUser, profileData, profileError));
        setLoading(false);
      }
    };

    const init = async () => {
      try {
        const { user: authUser, error } = await getUserWithTimeout(supabase, 5000);

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

  if (context === undefined) {
    return { user: null, loading: false };
  }

  return context;
}
