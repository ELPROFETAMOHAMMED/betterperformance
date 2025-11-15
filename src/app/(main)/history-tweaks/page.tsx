import { fetchUserTweakHistory } from "@/services/tweak-history-client";
import HistoryTweaksClient from "@/components/tweaks/history-tweaks-client";
import { getCurrentUser } from "@/services/auth-server";

export default async function HistoryTweaksPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="p-8">
        You must be logged in to view your tweak history.
      </div>
    );
  }
  const history = await fetchUserTweakHistory(user.id);

  return (
    <div className="p-8">
      <HistoryTweaksClient history={history} />
    </div>
  );
}
