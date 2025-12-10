import type { Tweak } from "@/features/tweaks/types/tweak.types";
import { redactSensitive } from "@/shared/lib/utils";

export function getTweakCommentBlock(tweak: Tweak) {
  const desc = (tweak.description || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();

  const downloads = (tweak.download_count ?? 0).toString().trim();
  const commentMeta = (tweak.tweak_comment ?? "")
    .toString()
    .replace(/\s+/g, " ")
    .trim();
    
  const block = [
    `# ${desc}`,
    `# Downloads: ${downloads} | Comment: ${commentMeta}`,
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

    // Normalise code: consistent newlines, remove all empty lines, no trailing whitespace
    const normalised = rawCode
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+$/gm, ""); // Remove trailing whitespace

    // Split into lines and filter out empty lines
    const lines = normalised.split("\n").filter(line => line.trim().length > 0);
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

  // Join blocks with newline (no blank lines between), remove all empty lines
  const combined = blocks.filter(block => block.trim().length > 0).join("\n");
  // Final pass: remove any remaining empty lines
  return combined.split("\n").filter(line => line.trim().length > 0).join("\n");
}



