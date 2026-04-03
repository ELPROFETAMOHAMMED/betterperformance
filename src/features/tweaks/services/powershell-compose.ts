import {
  completionCode,
  generateAtomicTweakFunction,
  generateRestorePointFunction,
  loggingCode,
  powershellHeader,
} from "@/features/tweaks/services/powershell-assets";
import { generateTweakSummary } from "@/features/tweaks/services/powershell-summary";

export function wrapTweakWithAtomicExecution(
  tweakName: string,
  tweakCode: string,
  totalTweaks: number
): string {
  const escapedName = tweakName.replace(/`/g, "``").replace(/"/g, '`"');

  return `Invoke-AtomicTweak "${escapedName}" {
${tweakCode}
} -TotalTweaks ${totalTweaks}`;
}

export function wrapTweaksWithAtomicExecution(
  tweaks: Array<{ title: string; code: string }>
): string {
  if (tweaks.length === 0) {
    return "";
  }

  const validTweaks = tweaks.filter((tweak) => tweak.code.trim());
  const totalTweaks = validTweaks.length;
  const combinedTweaks = validTweaks
    .map((tweak, index) => {
      const tweakName = tweak.title.trim() || `Tweak ${index + 1}`;

      return wrapTweakWithAtomicExecution(
        tweakName,
        tweak.code.trim(),
        totalTweaks
      );
    })
    .join("\n\n");

  return `${generateAtomicTweakFunction()}\n${combinedTweaks}\n
# Close the native Write-Progress bar
Write-Progress -Activity "BetterPerformance - Applying Tweaks" -Completed
Write-Host ""
`;
}

export function prependRestorePointCode(code: string, enabled: boolean): string {
  if (!enabled) {
    return `Write-Host "Applying tweaks..." -ForegroundColor Cyan\nWrite-Host ""\n${code}`;
  }

  return `${generateRestorePointFunction()}
# Create restore point before applying tweaks
$restorePointCreated = Create-BetterPerformanceRestorePoint
if (-not $restorePointCreated) {
    Write-Host "Continuing without restore point as requested by user." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Applying tweaks..." -ForegroundColor Cyan
Write-Host ""
${code}`;
}

export function wrapWithCompletionNotification(code: string): string {
  return `${powershellHeader}\n${loggingCode}\n
# Initialize logging
Start-TweakLogging
Write-TweakLog -Message "Script execution started"
\n${code}\n${generateTweakSummary()}\n${completionCode}`;
}
