import { Suspense } from "react";
import { requireAuth } from "@/shared/utils/auth-guard";
import { fetchUserTweakHistory } from "@/features/history-tweaks/utils/tweak-history-server";
import HistoryTweaksClient from "@/features/history-tweaks/components/history-tweaks-client";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

export default async function HistoryTweaksPage() {
  // Ensure user is authenticated (redirects if not)
  const user = await requireAuth();

  // Fetch user's tweak history on the server
  const history = await fetchUserTweakHistory(user.id);

  return (
    <Suspense>
      <ScrollArea className="h-full w-full">
        <HistoryTweaksClient history={history} />
      </ScrollArea>
    </Suspense>
  );
}



