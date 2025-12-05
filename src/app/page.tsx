import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LandingPage from "@/components/landing/landing-page";

export default async function Home() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If authenticated, redirect to home
  if (user) {
    return redirect("/home");
  }

  // Show landing page for unauthenticated users
  return <LandingPage />;
}
