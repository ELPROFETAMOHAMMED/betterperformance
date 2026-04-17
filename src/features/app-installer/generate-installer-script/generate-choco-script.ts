export const generateChocoScript = (identifiers: string[]): string => {
  if (identifiers.length === 0) {
    return "";
  }

  return identifiers
    .map((id) => `choco install ${id} -y --no-progress`)
    .join("\n");
};
