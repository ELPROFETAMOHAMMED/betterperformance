import { incrementTweakDownloads } from "@/features/tweaks/client/tweak-metrics-client";
import type { Tweak } from "@/features/tweaks/types/tweak.types";
import { withTimeout } from "@/shared/utils/async-helpers";

export async function trackTweakDownloads(tweaks: Tweak[]) {
  try {
    await withTimeout(
      incrementTweakDownloads(tweaks.map((tweak) => tweak.id)),
      5000
    );
  } catch (error) {
    console.warn("Failed to increment download count:", error);
  }
}
