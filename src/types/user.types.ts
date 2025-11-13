import type { User, UserIdentity, UserMetadata } from "@supabase/supabase-js";
import { TweakHistoryEntry } from "@/types/tweak.types";

export type supabaseUser = User;

export interface googleUserMetadata extends UserMetadata {
  full_name?: string;
  name?: string;
  avatar_url?: string;
  email?: string;

  is_verify?: boolean | false;
  role: "user" | "admin";
  bio?: string;
  provider_id?: string;

  created_at?: string;
  updated_at?: string;
}

export interface profile extends supabaseUser {
  user_metadata: googleUserMetadata;
  identities?: UserIdentity[];
  tweakHistory?: TweakHistoryEntry[];
}

export interface UserCardProps {
  email?: string;
  avatar_url?: string;
  name?: string;
  role?: "user" | "admin";
}
