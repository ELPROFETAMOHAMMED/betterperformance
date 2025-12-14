/**
 * Utility for downloading files in the browser
 */

export function downloadFile(
  content: string,
  filename: string,
  encodingUtf8: boolean
): void {
  const mime = encodingUtf8
    ? "text/plain;charset=utf-8"
    : "text/plain;charset=utf-16";
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
