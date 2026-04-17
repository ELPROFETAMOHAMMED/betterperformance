import { downloadFile } from "@/features/tweaks/utils/file-downloader";
import { cleanTweakCode } from "@/features/tweaks/utils/code-cleaner";
import {
  completionCode,
  generateRestorePointFunction,
  loggingCode,
  powershellHeader,
} from "@/features/tweaks/services/powershell-assets";
import { wrapTweaksWithAtomicExecution } from "@/features/tweaks/services/powershell-compose";
import { generateTweakSummary } from "@/features/tweaks/services/powershell-summary";
import type { SelectedItem } from "@/shared/types/selection.types";
import type { WallpaperScriptItem } from "@/features/wallpapers/types/wallpaper.types";

type DownloadSelectionOptions = {
  encodingUtf8: boolean;
  autoCreateRestorePoint?: boolean;
};

function escapePowerShellString(value: string) {
  return value.replace(/'/g, "''");
}

function getWallpaperFileName(wallpaper: WallpaperScriptItem) {
  const sanitizedTitle = wallpaper.title.replace(/[^a-zA-Z0-9-_]+/g, "-") || wallpaper.id;
  const extensionMatch = wallpaper.storagePath.match(/\.([a-zA-Z0-9]+)$/);
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : "jpg";

  return `${sanitizedTitle}-${wallpaper.id}.${extension}`;
}

function buildWallpaperSection(wallpapers: WallpaperScriptItem[]): string {
  const serializedWallpapers = wallpapers
    .map((wallpaper, index) => {
      const isApplyTarget = index === wallpapers.length - 1;

      return `  [pscustomobject]@{ Title = '${escapePowerShellString(
        wallpaper.title
      )}'; Url = '${escapePowerShellString(
        wallpaper.publicUrl
      )}'; FileName = '${escapePowerShellString(
        getWallpaperFileName(wallpaper)
      )}'; LocalPath = (Join-Path $wallpaperFolder '${escapePowerShellString(
        getWallpaperFileName(wallpaper)
      )}'); IsApplyTarget = $${isApplyTarget ? "true" : "false"} }`;
    })
    .join(",\n");

  return [
    "Write-Host \"Applying wallpapers...\" -ForegroundColor Cyan",
    "Write-Host \"\"",
    "$wallpaperFolder = Join-Path $env:USERPROFILE 'Pictures\\BetterPerformance-Wallpapers'",
    "if (-not (Test-Path $wallpaperFolder)) { New-Item -Path $wallpaperFolder -ItemType Directory | Out-Null }",
    "$wallpapers = @(",
    serializedWallpapers,
    ")",
    "",
    "foreach ($wallpaper in $wallpapers) {",
    "    try {",
    "        Invoke-WebRequest -Uri $wallpaper.Url -OutFile $wallpaper.LocalPath",
    "        Write-Host \"Downloaded: $($wallpaper.Title)\" -ForegroundColor Green",
    "        $script:TweakResults += [pscustomobject]@{ Name = \"Download $($wallpaper.Title)\"; Status = \"OK\"; ErrorMessage = $null }",
    "    } catch {",
    "        Write-Warning \"Failed to download $($wallpaper.Title): $($_.Exception.Message)\"",
    "        $script:TweakResults += [pscustomobject]@{ Name = \"Download $($wallpaper.Title)\"; Status = \"FAILED\"; ErrorMessage = $_.Exception.Message }",
    "        continue",
    "    }",
    "}",
    "",
    "$lastWallpaper = $wallpapers | Where-Object { $_.IsApplyTarget } | Select-Object -First 1",
    "if ($lastWallpaper -and (Test-Path $lastWallpaper.LocalPath)) {",
    "    try {",
    '        Add-Type -TypeDefinition @"',
    "using System;",
    "using System.Runtime.InteropServices;",
    "public class Wallpaper {",
    "  [DllImport(\"user32.dll\", CharSet = CharSet.Auto)]",
    "  public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);",
    "}",
    '"@',
    "        [Wallpaper]::SystemParametersInfo(20, 0, $lastWallpaper.LocalPath, 3) | Out-Null",
    "        Write-Host \"Wallpaper applied: $($lastWallpaper.Title)\" -ForegroundColor Green",
    "        $script:TweakResults += [pscustomobject]@{ Name = \"Apply $($lastWallpaper.Title)\"; Status = \"OK\"; ErrorMessage = $null }",
    "    } catch {",
    "        Write-Warning \"Failed to apply wallpaper $($lastWallpaper.Title): $($_.Exception.Message)\"",
    "        $script:TweakResults += [pscustomobject]@{ Name = \"Apply $($lastWallpaper.Title)\"; Status = \"FAILED\"; ErrorMessage = $_.Exception.Message }",
    "    }",
    "} else {",
    "    $applyError = 'The selected wallpaper could not be applied because the file was not downloaded successfully.'",
    "    Write-Warning $applyError",
    "    $script:TweakResults += [pscustomobject]@{ Name = 'Apply wallpaper'; Status = 'FAILED'; ErrorMessage = $applyError }",
    "}",
  ].join("\n");
}

function buildSummary() {
  return `
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Selection Execution Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($script:TweakResults -and $script:TweakResults.Count -gt 0) {
    $totalOperations = $script:TweakResults.Count
    $successfulOperations = ($script:TweakResults | Where-Object { $_.Status -eq "OK" }).Count
    $failedOperations = ($script:TweakResults | Where-Object { $_.Status -eq "FAILED" }).Count

    Write-Host "Total Operations: $totalOperations" -ForegroundColor White
    Write-Host "Successful:       $successfulOperations" -ForegroundColor Green
    Write-Host "Failed:           $failedOperations" -ForegroundColor $(if ($failedOperations -gt 0) { "Red" } else { "Gray" })
    Write-Host ""
} else {
    Write-Host "No execution results available." -ForegroundColor Yellow
    Write-Host ""
}
`;
}

export function downloadSelectionScript(
  selectedItems: SelectedItem[],
  options: DownloadSelectionOptions
) {
  const shouldCreateRestorePoint = options.autoCreateRestorePoint ?? true;
  const tweaks = selectedItems
    .filter((item): item is Extract<SelectedItem, { type: "tweak" }> => item.type === "tweak")
    .map((item) => ({ title: item.item.title, code: cleanTweakCode(item.item.code || "") }))
    .filter((tweak) => tweak.code.trim());

  const wallpapers = selectedItems
    .filter((item): item is Extract<SelectedItem, { type: "wallpaper" }> => item.type === "wallpaper")
    .map((item) => ({
      id: item.item.id,
      title: item.item.title,
      publicUrl: item.item.public_url,
      storagePath: item.item.storage_path,
    } satisfies WallpaperScriptItem));

  const parts = [
    powershellHeader.trim(),
    loggingCode.trim(),
    generateRestorePointFunction().trim(),
    "$ErrorActionPreference = 'Stop'",
    "Start-TweakLogging",
    "Write-TweakLog -Message 'Selection script execution started'",
    "",
    shouldCreateRestorePoint
      ? [
          "Write-Host 'Creating restore point before applying selection...' -ForegroundColor Cyan",
          "Write-Host ''",
          "$restorePointCreated = Create-BetterPerformanceRestorePoint",
          "if (-not $restorePointCreated) {",
          "    Write-Host 'Continuing without restore point as requested by user.' -ForegroundColor Yellow",
          "    Write-Host ''",
          "}",
        ].join("\n")
      : ["Write-Host 'Applying selection...' -ForegroundColor Cyan", "Write-Host ''"].join("\n"),
  ];

  if (tweaks.length > 0) {
    parts.push(wrapTweaksWithAtomicExecution(tweaks).trim());
  }

  if (wallpapers.length > 0) {
    parts.push(buildWallpaperSection(wallpapers));
  }

  parts.push(buildSummary().trim());
  parts.push(generateTweakSummary().trim());
  parts.push(completionCode);

  const scriptContent = parts.filter(Boolean).join("\n\n");
  downloadFile(
    scriptContent,
    selectedItems.length === 1 ? "BetterPerformance-Selection.ps1" : "BetterPerformance-Selection.ps1",
    options.encodingUtf8
  );
}
