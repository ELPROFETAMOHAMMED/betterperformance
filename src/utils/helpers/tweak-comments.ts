import type { Tweak } from "@/types/tweak.types";
import { redactSensitive } from "@/lib/utils";

export function getTweakCommentBlock(tweak: Tweak) {
  const meta = tweak.tweak_metadata;

  const desc = (tweak.description || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();

  const reports = (meta?.report ?? "-").toString().trim();
  const downloads = (meta?.downloadCount ?? "-").toString().trim();
  const commentMeta = (meta?.tweakComment ?? "-")
    .toString()
    .replace(/\s+/g, " ")
    .trim();
    
  const block = [
    `# ${desc}`,
    `# Reports: ${reports} | Downloads: ${downloads} | Comment: ${commentMeta}`,
  ].join("\n");

  return block.trim();
}

export function getCombinedTweaksCode(tweaks: Tweak[], hideSensitive: boolean) {
  const blocks: string[] = [];

  tweaks.forEach((tweak) => {
    const commentBlock = getTweakCommentBlock(tweak).trim();

    const rawCode = hideSensitive
      ? redactSensitive(tweak.code || "")
      : tweak.code || "";

    const cleanedCode = rawCode
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const block = `${commentBlock}\n${cleanedCode}`.trim();

    blocks.push(block);
  });

  const combined = blocks.join("\n\n").trim();

  return combined;
}
