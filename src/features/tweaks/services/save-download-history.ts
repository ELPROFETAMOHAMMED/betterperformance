import type { profile } from "@/features/auth/types/user.types";
import { saveTweakHistory } from "@/features/history-tweaks/utils/tweak-history-client";
import type { SelectedItem } from "@/shared/types/selection.types";
import { withTimeout } from "@/shared/utils/async-helpers";
import { format } from "date-fns";

export async function saveDownloadHistory(
  tweaks: SelectedItem[],
  user: profile | null
) {
  if (!user) {
    return;
  }

  try {
    if (tweaks.length === 0) {
      return;
    }

    const formattedDate = format(new Date(), "dd/MM/yyyy");

    await withTimeout(
      saveTweakHistory({
        tweaks,
        name: `Last Selection Applied - ${formattedDate}`,
        isFavorite: false,
      }),
      5000
    );
  } catch (error) {
    console.warn("Failed to save tweak history:", error);
  }
}
