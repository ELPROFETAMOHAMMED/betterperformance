import { createClient } from "../../../utils/supabase/server";
import TweaksContent from "@/components/tweaks/tweaks-content";
import { mockTweaksData } from "@/data/mock-tweaks";

export default async function TweaksPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return <div>No user</div>;
  }

  return <TweaksContent categories={mockTweaksData} />;
}
