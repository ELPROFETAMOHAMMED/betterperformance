import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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
      // Return redirect response with cookies already set by exchangeCodeForSession
      return redirectResponse;
    }
  }

  // If no code or authentication failed, redirect to landing page
  const url = new URL(`${origin}/`);
  url.searchParams.set("error", "authentication_failed");
  return NextResponse.redirect(url);
}

