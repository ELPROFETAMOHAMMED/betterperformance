import { createClient } from "../../../utils/supabase/server";
import TweaksContent from "@/components/tweaks/tweaks-content";
import { fetchTweakCategories } from "@/services/tweaks";

export default async function TweaksPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    return <div>No user</div>;
  }
  const categories = await fetchTweakCategories();
  return <TweaksContent categories={categories} />;
}
