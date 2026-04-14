import {
  generateRestorePointFunction,
  loggingCode,
  powershellHeader,
} from "@/features/tweaks/services/powershell-assets";
import type { WallpaperScriptItem } from "@/features/wallpapers/types/wallpaper.types";

function escapePowerShellString(value: string) {
  return value.replace(/'/g, "''");
}

function getWallpaperFileName(wallpaper: WallpaperScriptItem) {
  const sanitizedTitle = wallpaper.title.replace(/[^a-zA-Z0-9-_]+/g, "-") || wallpaper.id;
  const extensionMatch = wallpaper.storagePath.match(/\.([a-zA-Z0-9]+)$/);
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : "jpg";

  return `${sanitizedTitle}-${wallpaper.id}.${extension}`;
}

function generateWallpaperSummary() {
  return `
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Wallpaper Execution Summary" -ForegroundColor Cyan
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
    Write-Host "Detailed Results:" -ForegroundColor White
    Write-Host "----------------" -ForegroundColor Gray
    Write-Host ""

    foreach ($result in $script:TweakResults) {
        $statusColor = if ($result.Status -eq "OK") { "Green" } else { "Red" }
        Write-Host "  [$($result.Status)] " -NoNewline -ForegroundColor $statusColor
        Write-Host "$($result.Name)" -ForegroundColor White
        if ($result.Status -eq "FAILED" -and $result.ErrorMessage) {
            Write-Host "    Error: $($result.ErrorMessage)" -ForegroundColor Yellow
        }
    }
    Write-Host ""
} else {
    Write-Host "No wallpaper execution results available." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
if (($script:TweakResults | Where-Object { $_.Status -eq "FAILED" }).Count -eq 0) {
    Write-Host "[SUCCESS] Wallpapers Applied Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "All selected wallpapers were processed correctly." -ForegroundColor Green
} else {
    Write-Host "[WARNING] Wallpapers Completed With Errors" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Some downloads failed. Review the summary above for details." -ForegroundColor Yellow
}

if ($script:LogPath) {
    Write-Host "Detailed Log: $script:LogPath" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
`;
}

export function buildWallpaperPowerShellScript(
  wallpapers: WallpaperScriptItem[],
  lastSelectedId: string | null
) {
  const serializedWallpapers = wallpapers
    .map((wallpaper) => {
      return `  [pscustomobject]@{ Title = '${escapePowerShellString(
        wallpaper.title
      )}'; Url = '${escapePowerShellString(
        wallpaper.publicUrl
      )}'; FileName = '${escapePowerShellString(
        getWallpaperFileName(wallpaper)
      )}'; LocalPath = (Join-Path $wallpaperFolder '${escapePowerShellString(
        getWallpaperFileName(wallpaper)
      )}'); IsApplyTarget = $${wallpaper.id === lastSelectedId ? "true" : "false"} }`;
    })
    .join(",\n");

  const wallpaperBody = [
    "$ErrorActionPreference = 'Stop'",
    "$script:TweakResults = @()",
    "$wallpaperFolder = Join-Path $env:USERPROFILE 'Pictures\\BetterPerformance-Wallpapers'",
    "if (-not (Test-Path $wallpaperFolder)) { New-Item -Path $wallpaperFolder -ItemType Directory | Out-Null }",
    "$wallpapers = @(",
    serializedWallpapers,
    ")",
    "",
    "Write-Host 'Preparing wallpaper downloads...' -ForegroundColor Cyan",
    "Write-Host ''",
    "",
    "foreach ($wallpaper in $wallpapers) {",
    "    try {",
    "        Invoke-WebRequest -Uri $wallpaper.Url -OutFile $wallpaper.LocalPath",
    "        Write-Host \"Downloaded: $($wallpaper.Title)\" -ForegroundColor Green",
    "        Write-TweakLog -Message \"Downloaded wallpaper: $($wallpaper.Title)\"",
    "        $script:TweakResults += [pscustomobject]@{ Name = \"Download $($wallpaper.Title)\"; Status = \"OK\"; ErrorMessage = $null }",
    "    } catch {",
    "        Write-Warning \"Failed to download $($wallpaper.Title): $($_.Exception.Message)\"",
    "        Write-TweakLog -Type 'ERROR' -Message \"Failed to download wallpaper: $($wallpaper.Title). Error: $($_.Exception.Message)\"",
    "        $script:TweakResults += [pscustomobject]@{ Name = \"Download $($wallpaper.Title)\"; Status = \"FAILED\"; ErrorMessage = $_.Exception.Message }",
    "        continue",
    "    }",
    "}",
    "",
    "$lastWallpaper = $wallpapers | Where-Object { $_.IsApplyTarget } | Select-Object -First 1",
    "",
    "if ($lastWallpaper -and (Test-Path $lastWallpaper.LocalPath)) {",
    "    try {",
    "        Add-Type -TypeDefinition @\"",
    "using System;",
    "using System.Runtime.InteropServices;",
    "public class Wallpaper {",
    "  [DllImport(\"user32.dll\", CharSet = CharSet.Auto)]",
    "  public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);",
    "}",
    "\"@",
    "        [Wallpaper]::SystemParametersInfo(20, 0, $lastWallpaper.LocalPath, 3) | Out-Null",
    "        Write-Host \"Wallpaper applied: $($lastWallpaper.Title)\" -ForegroundColor Green",
    "        Write-TweakLog -Message \"Applied wallpaper: $($lastWallpaper.Title)\"",
    "        $script:TweakResults += [pscustomobject]@{ Name = \"Apply $($lastWallpaper.Title)\"; Status = \"OK\"; ErrorMessage = $null }",
    "    } catch {",
    "        Write-Warning \"Failed to apply wallpaper $($lastWallpaper.Title): $($_.Exception.Message)\"",
    "        Write-TweakLog -Type 'ERROR' -Message \"Failed to apply wallpaper: $($lastWallpaper.Title). Error: $($_.Exception.Message)\"",
    "        $script:TweakResults += [pscustomobject]@{ Name = \"Apply $($lastWallpaper.Title)\"; Status = \"FAILED\"; ErrorMessage = $_.Exception.Message }",
    "    }",
    "} else {",
    "    $applyError = 'The selected wallpaper could not be applied because the file was not downloaded successfully.'",
    "    Write-Warning $applyError",
    "    Write-TweakLog -Type 'ERROR' -Message $applyError",
    "    $script:TweakResults += [pscustomobject]@{ Name = 'Apply wallpaper'; Status = 'FAILED'; ErrorMessage = $applyError }",
    "}",
  ].join("\n");

  return [
    powershellHeader.trim(),
    loggingCode.trim(),
    generateRestorePointFunction().trim(),
    "$ErrorActionPreference = 'Stop'",
    "Start-TweakLogging",
    "Write-TweakLog -Message 'Wallpaper script execution started'",
    "",
    "Write-Host 'Creating restore point before applying wallpapers...' -ForegroundColor Cyan",
    "Write-Host ''",
    "$restorePointCreated = Create-BetterPerformanceRestorePoint",
    "if (-not $restorePointCreated) {",
    "    Write-Host 'Continuing without restore point as requested by user.' -ForegroundColor Yellow",
    "    Write-Host ''",
    "}",
    "",
    wallpaperBody,
    generateWallpaperSummary().trim(),
  ].join("\n\n");
}
