import type { profile } from "@/features/auth/types/user.types";
import { saveTweakHistory } from "@/features/history-tweaks/utils/tweak-history-client";
import type { Tweak } from "@/features/tweaks/types/tweak.types";
import { withTimeout } from "@/shared/utils/async-helpers";
import { format } from "date-fns";

export async function saveDownloadHistory(
  tweaks: Tweak[],
  user: profile | null
) {
  if (!user) {
    return;
  }

  try {
    const formattedDate = format(new Date(), "dd/MM/yyyy");

    await withTimeout(
      saveTweakHistory({
        tweaks,
        name: `Last Tweak Applied - ${formattedDate}`,
        isFavorite: false,
      }),
      5000
    );
  } catch (error) {
    console.warn("Failed to save tweak history:", error);
  }
}
