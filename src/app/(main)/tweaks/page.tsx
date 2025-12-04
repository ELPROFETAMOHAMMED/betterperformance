import { createClient } from "@/utils/supabase/server";
import TweaksContent from "@/components/tweaks/tweaks-content";
import { fetchTweakCategories } from "@/services/tweaks";
import { redirect } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function TweaksPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    return redirect("/login");
  }
  const categories = await fetchTweakCategories();
  return (
    <ScrollArea className="h-full w-full">
      <TweaksContent categories={categories} />
    </ScrollArea>
  );
}
