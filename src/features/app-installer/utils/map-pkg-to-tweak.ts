import type { Tweak } from "@/features/tweaks/types/tweak.types";
import type { WingetPackage } from "../types/winget-package";

/**
 * Maps a Winget package to the internal Tweak structure used by the selection system.
 * 
 * @param pkg - The Winget package to convert.
 * @returns A Tweak object with the appropriate installation command.
 */
export function mapPkgToTweak(pkg: WingetPackage): Tweak {
  const name = pkg.Latest?.Name || pkg.Id;
  const publisher = pkg.Latest?.Publisher || "Unknown";
  
  return {
    id: `winget-${pkg.Id.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    title: name,
    description: `Install ${name} (${pkg.Id}) by ${publisher} via winget.`,
    code: `winget install --id ${pkg.Id} --silent --accept-package-agreements --accept-source-agreements`,
    download_count: 0,
    favorite_count: 0,
    is_visible: true,
    notes: "Requires an active internet connection and Winget (standard on Windows 10/11).",
  };
}
