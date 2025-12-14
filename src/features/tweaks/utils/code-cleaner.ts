/**
 * Utility functions for cleaning and normalizing PowerShell code
 */

export function cleanTweakCode(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n") // normalise line endings
    .replace(/\n{3,}/g, "\n\n") // collapse 3+ blank lines into 1 blank line
    .replace(/[ \t]+$/gm, "") // strip trailing spaces on each line
    .trim(); // remove leading/trailing blank lines
}

export function combineTweakBlocks(blocks: string[]): string {
  return blocks.filter(Boolean).join("\n\n").trimEnd();
}
