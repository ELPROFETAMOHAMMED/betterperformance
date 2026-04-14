import type { User } from "@supabase/supabase-js";

import { resolveUserRole } from "@/shared/auth/normalize-role";
import type {
  googleUserMetadata,
  profile,
} from "@/features/auth/types/user.types";

type Role = googleUserMetadata["role"];

export type ProfileRow = {
  id: string;
  name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  role?: Role | null;
};

export function buildUserProfile(
  authUser: User,
  profileData: ProfileRow | null,
  profileError: Error | null
): profile {
  const profileRole = profileData && !profileError ? profileData.role : null;
  const metadataRole = authUser.user_metadata?.role ?? null;
  const finalRole = resolveUserRole(profileRole, metadataRole);

  return {
    ...authUser,
    user_metadata: {
      ...authUser.user_metadata,
      ...(profileData &&
        !profileError && {
          name: profileData.name || authUser.user_metadata?.name,
          avatar_url: profileData.avatar_url || authUser.user_metadata?.avatar_url,
          bio: profileData.bio || authUser.user_metadata?.bio,
        }),
      role: finalRole as Role,
    },
  };
}
