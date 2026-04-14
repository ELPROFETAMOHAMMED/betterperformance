import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { resolveUserRole } from "@/shared/auth/normalize-role";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const origin = requestUrl.origin;

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
    const redirectUrl = new URL(`${origin}/home`);
    let redirectResponse = NextResponse.redirect(redirectUrl);

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

        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("role, email, name, avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        const roleToUse = resolveUserRole(existingProfile?.role, userMetadata?.role);

        await supabase.from("profiles").upsert(
          {
            id: user.id,
            email: user.email,
            role: roleToUse,
            name: fullName,
            avatar_url: avatarUrl,
          },
          { onConflict: "id" }
        );
      } catch (profileError) {
        console.error("Error upserting profile:", profileError);
      }

      return redirectResponse;
    }
  }

  const url = new URL(`${origin}/`);
  url.searchParams.set("error", "authentication_failed");
  return NextResponse.redirect(url);
}
