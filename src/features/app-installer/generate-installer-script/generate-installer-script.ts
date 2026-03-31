/**
 * Generates a PowerShell script to install multiple winget packages.
 * 
 * @param identifiers - Array of package identifiers (IDs)
 * @returns A formatted PowerShell script string
 */
export const generateInstallerScript = (identifiers: string[]): string => {
  if (identifiers.length === 0) return "";

  return identifiers
    .map(
      (id) =>
        `winget install --id ${id} --silent --accept-package-agreements --accept-source-agreements`
    )
    .join("\n");
};
