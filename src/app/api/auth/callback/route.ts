import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { normalizeRole } from "@/shared/auth/normalize-role";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const origin = requestUrl.origin;

  // If there's an error, redirect to landing page with the error
  if (error) {
    console.error("Auth error:", error, errorDescription);
    const url = new URL(`${origin}/`);
    url.searchParams.set("error", error);
    if (errorDescription) {
      url.searchParams.set("error_description", errorDescription);
    }
    return NextResponse.redirect(url);
  }

  if (code) {
    // Create redirect response that we'll return after setting cookies
    const redirectUrl = new URL(`${origin}/home`);
    let redirectResponse = NextResponse.redirect(redirectUrl);

    // Create Supabase client with proper cookie handling for Route Handlers
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });
            // Recreate redirect response to ensure it has the latest cookies
            redirectResponse = NextResponse.redirect(redirectUrl);
            cookiesToSet.forEach(({ name, value, options }) => {
              redirectResponse.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      code
    );

    if (exchangeError) {
      console.error("Exchange error:", exchangeError);
      const url = new URL(`${origin}/`);
      url.searchParams.set("error", "exchange_failed");
      url.searchParams.set("error_description", exchangeError.message);
      return NextResponse.redirect(url);
    }

    // Verify user is authenticated before redirecting
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      try {
        const userMetadata = user.user_metadata as Record<string, unknown> | null;
        const fullName =
          userMetadata && typeof userMetadata["full_name"] === "string"
            ? (userMetadata["full_name"] as string)
            : userMetadata && typeof userMetadata["name"] === "string"
            ? (userMetadata["name"] as string)
            : null;
        const avatarUrl =
          userMetadata && typeof userMetadata["avatar_url"] === "string"
            ? (userMetadata["avatar_url"] as string)
            : null;

        // Check if profile already exists to preserve role
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("role, email, name, avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        // Extract role from profiles table (source of truth)
        // The profiles table is the authoritative source for roles
        const profileRole = existingProfile?.role ? normalizeRole(existingProfile.role) : null;
        
        // Extract role from user_metadata for syncing (if it exists and differs)
        const metadataRole = userMetadata?.role ? normalizeRole(userMetadata.role) : null;
        
        // Determine the role to use:
        // Priority: profiles.role > user_metadata.role > "user"
        // This ensures profiles table is the source of truth
        // If role exists in profiles, ALWAYS preserve it (critical for admin users)
        let roleToUse: "user" | "admin";
        
        if (profileRole !== null) {
          // Profile exists with a valid role - ALWAYS preserve it (CRITICAL: don't overwrite admin)
          roleToUse = profileRole;
        } else if (metadataRole !== null) {
          // No profile role, but role exists in user_metadata - use it and sync to profiles
          roleToUse = metadataRole;
        } else {
          // New profile or invalid role - default to "user"
          roleToUse = "user";
        }
        
        // Update or create profile with the determined role
        if (existingProfile) {
          // Profile exists: update all fields including role
          // This will sync role from user_metadata to profiles if needed
          await supabase
            .from("profiles")
            .update({
              email: user.email,
              role: roleToUse,
              name: fullName,
              avatar_url: avatarUrl,
            })
            .eq("id", user.id);
        } else {
          // New profile: create with determined role
          await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: user.email,
              role: roleToUse,
              name: fullName,
              avatar_url: avatarUrl,
            });
        }
      } catch (profileError) {
        // Log but don't break the login flow if profile sync fails
        console.error("Error upserting profile:", profileError);
      }

      // Return redirect response with cookies already set by exchangeCodeForSession
      return redirectResponse;
    }
  }

  // If no code or authentication failed, redirect to landing page
  const url = new URL(`${origin}/`);
  url.searchParams.set("error", "authentication_failed");
  return NextResponse.redirect(url);
}
