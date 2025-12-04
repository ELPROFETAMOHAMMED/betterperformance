import { fetchUserTweakHistory } from "@/services/tweak-history-client";
import HistoryTweaksClient from "@/components/tweaks/history-tweaks-client";
import { getCurrentUser } from "@/services/auth-server";
import {redirect} from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function HistoryTweaksPage() {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/login");
  }
  const history = await fetchUserTweakHistory(user.id);

  return (
    <ScrollArea className="h-full w-full">
      <HistoryTweaksClient history={history} />
    </ScrollArea>
  );
}
