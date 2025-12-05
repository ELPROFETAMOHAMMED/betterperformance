import { createClient } from "@/utils/supabase/server";
import TweaksPageClient from "@/components/tweaks/tweaks-page-client";
import { redirect } from "next/navigation";

export default async function TweaksPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    return redirect("/login");
  }
  return <TweaksPageClient />;
}
