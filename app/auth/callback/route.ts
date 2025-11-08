import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const origin = requestUrl.origin;

  // Si hay un error, redirigir a login con el error
  if (error) {
    console.error("Auth error:", error, errorDescription);
    const url = new URL(`${origin}/login`);
    url.searchParams.set("error", error);
    if (errorDescription) {
      url.searchParams.set("error_description", errorDescription);
    }
    return NextResponse.redirect(url);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error("Exchange error:", exchangeError);
      const url = new URL(`${origin}/login`);
      url.searchParams.set("error", "exchange_failed");
      url.searchParams.set("error_description", exchangeError.message);
      return NextResponse.redirect(url);
    }
  }

  // Redirigir a home después de la autenticación exitosa
  return NextResponse.redirect(`${origin}/home`);
}

