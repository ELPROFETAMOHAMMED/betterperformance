import type { Tweak } from "@/types/tweak.types";
import { redactSensitive } from "@/lib/utils";

export function getTweakCommentBlock(tweak: Tweak) {
  const meta = tweak.tweak_metadata;
  const descComment = `# ${tweak.description || ""}\n`;
  const metaComment = `# Reports: ${meta?.report ?? "-"} | Downloads: ${
    meta?.downloadCount ?? "-"
  } | Comment: ${meta?.tweakComment ?? "-"}\n`;
  return descComment + metaComment;
}

export function getCombinedTweaksCode(tweaks: Tweak[], hideSensitive: boolean) {
  return tweaks
    .map((tweak) => {
      const commentBlock = getTweakCommentBlock(tweak);
      const tweakCode = hideSensitive
        ? redactSensitive(tweak.code || "")
        : tweak.code || "";
      return commentBlock + tweakCode;
    })
    .join("\n\n");
}
