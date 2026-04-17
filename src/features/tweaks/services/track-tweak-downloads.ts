import { incrementTweakDownloads } from "@/features/tweaks/client/tweak-metrics-client";
import type { Tweak } from "@/features/tweaks/types/tweak.types";
import { withTimeout } from "@/shared/utils/async-helpers";
import { isUuidV4 } from "@/shared/utils/is-uuid";

export async function trackTweakDownloads(tweaks: Tweak[]) {
  try {
    const tweakIds = tweaks.map((tweak) => tweak.id).filter(isUuidV4);

    if (tweakIds.length === 0) {
      return;
    }

    await withTimeout(
      incrementTweakDownloads(tweakIds),
      5000
    );
  } catch (error) {
    console.warn("Failed to increment download count:", error);
  }
}
