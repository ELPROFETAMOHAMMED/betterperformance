/**
 * Service for generating PowerShell code snippets
 */

import { psHeader as ps1Header } from "@/features/tweaks/templates/ps1-header";
import { atomicExecutor } from "@/features/tweaks/templates/atomic-executor";
import { restorePoint } from "@/features/tweaks/templates/restore-point";
import { completion as completionCode } from "@/features/tweaks/templates/completion";
import { trustedInstaller } from "@/features/tweaks/templates/trusted-installer";
import { logging as loggingCode } from "@/features/tweaks/templates/logging";

/**
 * DEPRECATED NOT USED ANYWHERE 
 * Directly imported from the ps1Header file
 *  
export function generateAdminCheckCode(): string => ""; 
export function generateConsoleTheme(): string => ""; 
export function generateAsciiLogo(): string => ""; 
 *  
* 
*/

export function generateTrustedInstallerFunction(): string { 
    return trustedInstaller;
}

export function generateRestorePointFunction(): string {
    return restorePoint;
}

export function generateAtomicTweakFunction(): string {
    return atomicExecutor;
}

export function generateTweakSummary(): string {
    return `
# Display tweak execution summary
Write-Host "" 
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tweak Execution Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($script:TweakResults -and $script:TweakResults.Count -gt 0) {
    $totalTweaks      = $script:TweakResults.Count
    $successfulTweaks = ($script:TweakResults | Where-Object { $_.Status -eq "OK" }).Count
    $failedTweaks     = ($script:TweakResults | Where-Object { $_.Status -eq "FAILED" }).Count

    Write-Host "Total Tweaks: $totalTweaks"  -ForegroundColor White
    Write-Host "Successful:   $successfulTweaks" -ForegroundColor Green
    Write-Host "Failed:       $failedTweaks" -ForegroundColor $(if ($failedTweaks -gt 0) { "Red" } else { "Gray" })
    Write-Host ""

    # Display detailed results
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
    Write-Host "No tweak execution results available." -ForegroundColor Yellow
    Write-Host ""
}
`;
}

export function wrapTweakWithAtomicExecution(
    tweakName: string,
    tweakCode: string,
    totalTweaks: number,
): string {
    const escapedName = tweakName.replace(/`/g, "``").replace(/"/g, '`"');

    return `Invoke-AtomicTweak "${escapedName}" {
${tweakCode}
} -TotalTweaks ${totalTweaks}`;
}

export function wrapTweaksWithAtomicExecution(
    tweaks: Array<{ title: string; code: string }>,
): string {
    if (tweaks.length === 0) {
        return "";
    }

    const atomicFunction = generateAtomicTweakFunction();

    const validTweaks = tweaks.filter((t) => t.code.trim());
    const totalTweaks = validTweaks.length;

    const wrappedTweaks = validTweaks.map((tweak, index) => {
        const tweakName = tweak.title.trim() || `Tweak ${index + 1}`;
        return wrapTweakWithAtomicExecution(
            tweakName,
            tweak.code.trim(),
            totalTweaks,
        );
    });

    const combinedTweaks = wrappedTweaks.join("\n\n");

    const closeProgress = `
# Close the native Write-Progress bar
Write-Progress -Activity "BetterPerformance - Applying Tweaks" -Completed
Write-Host ""
`;

    return `${atomicFunction}\n${combinedTweaks}\n${closeProgress}`;
}

export function prependRestorePointCode(
    code: string,
    enabled: boolean,
): string {
    if (!enabled) {
        return `Write-Host "Applying tweaks..." -ForegroundColor Cyan\nWrite-Host ""\n${code}`;
    }

    const restorePointFunction = generateRestorePointFunction();

    return `${restorePointFunction}
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
    const summaryCode = generateTweakSummary();

    // Add Start-TweakLogging after the header assets
    const loggingInit = `
# Initialize logging
Start-TweakLogging
Write-TweakLog -Message "Script execution started"
`;

    return `${ps1Header}\n${loggingCode}\n${loggingInit}\n${code}\n${summaryCode}\n${completionCode}`;
}
