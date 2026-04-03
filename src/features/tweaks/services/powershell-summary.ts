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
