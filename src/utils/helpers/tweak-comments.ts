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

export function getCombinedTweaksCode(
  tweaks: Tweak[],
  hideSensitive: boolean,
  includeComments: boolean = true
) {
  const blocks: string[] = tweaks.map((tweak) => {
    const rawCode = hideSensitive
      ? redactSensitive(tweak.code || "")
      : tweak.code || "";

    // Normalise code: consistent newlines, collapse 3+ blank lines, no trailing whitespace, and no
    // trailing completely blank lines per tweak.
    const normalised = rawCode
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]+$/gm, "");

    const lines = normalised.split("\n");
    while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
      lines.pop();
    }
    const cleanedCode = lines.join("\n");

    const parts: string[] = [];

    if (includeComments) {
      const commentBlock = getTweakCommentBlock(tweak).trim();
      if (commentBlock) {
        parts.push(commentBlock);
      }
    }

    if (cleanedCode) {
      parts.push(cleanedCode);
    }

    return parts.join("\n");
  });

  // Exactly one blank line between tweak blocks, no trailing blank lines.
  return blocks.join("\n\n").trimEnd();
}
