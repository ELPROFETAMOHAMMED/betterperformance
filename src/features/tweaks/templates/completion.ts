export const completion = `
# Error handling and completion notification
$ErrorActionPreference = "Continue"
$scriptSuccess  = $false
$errorMessage   = ""
$errorOccurred  = $false

# Determine script success based on tweak results if available
if ($script:TweakResults -and $script:TweakResults.Count -gt 0) {
    $failedTweaks = ($script:TweakResults | Where-Object { $_.Status -eq "FAILED" }).Count
    if ($failedTweaks -eq 0) {
        $scriptSuccess = $true
    } else {
        $scriptSuccess  = $false
        $errorOccurred  = $true
        $errorMessage   = "$failedTweaks tweak(s) failed during execution. See summary above for details."
    }
} else {
    # Fallback to original error checking if no tweak results available
    if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne $null) {
        $errorOccurred = $true
        $errorMessage  = "Script exited with error code: $LASTEXITCODE"
        $scriptSuccess = $false
    } else {
        $scriptSuccess = $true
    }
}

# Display completion notification (always shown)
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($scriptSuccess -and -not $errorOccurred) {
    Write-Host "[SUCCESS] Tweaks Applied Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "All tweaks have been applied correctly." -ForegroundColor Green
    Write-Host "Your system has been optimized with BetterPerformance tweaks." -ForegroundColor Gray
    Write-Host ""
    if ($script:LogPath) {
        Write-Host "Detailed Log: $script:LogPath" -ForegroundColor Cyan
        Write-Host ""
    }
    Write-Host "Note: Some changes may require a system restart to take full effect." -ForegroundColor Yellow
    Write-Host ""

    # Ask user about system restart
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "System Restart Required" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Some tweaks require a system restart to take full effect." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor White
    Write-Host "  [Y] - Restart system automatically now" -ForegroundColor Green
    Write-Host "  [N] - Restart manually later" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If no option is selected within 30 seconds, the system will restart automatically." -ForegroundColor Gray
    Write-Host ""

    $restartChoice   = $null
    $timeoutSeconds  = 30
    $startTime       = Get-Date
    $inputReceived   = $false

    # Check if KeyAvailable is supported
    $keyAvailableSupported = $false
    try {
        $null = $Host.UI.RawUI.KeyAvailable
        $keyAvailableSupported = $true
    } catch {
        $keyAvailableSupported = $false
    }

    # Show countdown and wait for user input
    while (-not $inputReceived) {
        $elapsed   = (Get-Date) - $startTime
        $remaining = [math]::Max(0, $timeoutSeconds - [math]::Floor($elapsed.TotalSeconds))

        # Check if timeout
        if ($remaining -le 0) {
            Write-Host ""
            Write-Host "No response received. Restarting system automatically..." -ForegroundColor Yellow
            $restartChoice = "Y"
            $inputReceived = $true
            break
        }

        # Check if a key is available (only if supported)
        if ($keyAvailableSupported) {
            try {
                if ($Host.UI.RawUI.KeyAvailable) {
                    $key  = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
                    $char = $key.Character.ToString().ToUpper()

                    if ($char -eq "Y") {
                        Write-Host ""
                        Write-Host "Restarting system now..." -ForegroundColor Green
                        $restartChoice = "Y"
                        $inputReceived = $true
                        break
                    } elseif ($char -eq "N") {
                        Write-Host ""
                        Write-Host "You chose to restart manually later." -ForegroundColor Yellow
                        Write-Host "Please restart your system when convenient to apply all changes." -ForegroundColor Yellow
                        $restartChoice = "N"
                        $inputReceived = $true
                        break
                    }
                }
            } catch {
                # If KeyAvailable fails, fall back to Read-Host
                $keyAvailableSupported = $false
            }
        }

        # Show countdown
        $countdownMsg = "Time remaining: $remaining seconds (Press Y to restart now, N to restart later) "
        $cr = [char]13
        Write-Host "$($cr)$countdownMsg" -NoNewline -ForegroundColor Cyan
        Start-Sleep -Milliseconds 200
    }

    # If KeyAvailable is not supported, use Read-Host as fallback
    if (-not $inputReceived -and -not $keyAvailableSupported) {
        Write-Host ""
        Write-Host "Enter your choice (Y/N, default: Y): " -NoNewline -ForegroundColor Yellow
        $response = Read-Host
        if ($response -eq "N" -or $response -eq "n") {
            Write-Host "You chose to restart manually later." -ForegroundColor Yellow
            Write-Host "Please restart your system when convenient to apply all changes." -ForegroundColor Yellow
            $restartChoice = "N"
        } else {
            Write-Host "Restarting system now..." -ForegroundColor Green
            $restartChoice = "Y"
        }
        $inputReceived = $true
    }

    Write-Host ""

    # Restart system if user chose Y or timeout occurred
    if ($restartChoice -eq "Y") {
        Write-Host "Preparing to restart system in 5 seconds..." -ForegroundColor Yellow
        Write-Host "Press Ctrl+C to cancel" -ForegroundColor Gray
        Start-Sleep -Seconds 5
        try {
            Restart-Computer -Force -ErrorAction Stop
            Write-Host "System restart initiated." -ForegroundColor Green
        } catch {
            Write-Host "Failed to restart system automatically: $_" -ForegroundColor Red
            Write-Host "Please restart your system manually." -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Press any key to exit..." -ForegroundColor Gray
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
    } else {
        Write-Host "Script execution completed." -ForegroundColor Gray
        Write-Host "Press any key to exit..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
} else {
    Write-Host "[ERROR] Error Applying Tweaks" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    if ($errorMessage) {
        Write-Host "An error occurred while applying tweaks:" -ForegroundColor Red
        Write-Host $errorMessage -ForegroundColor Red
        Write-Host ""
    } else {
        Write-Host "An error occurred while applying tweaks." -ForegroundColor Red
        Write-Host ""
    }
    Write-Host "Please review the error message above and try again." -ForegroundColor Yellow
    Write-Host "If the problem persists, you may need to:" -ForegroundColor Yellow
    Write-Host "  - Run the script as Administrator" -ForegroundColor Yellow
    Write-Host "  - Check system permissions" -ForegroundColor Yellow
    Write-Host "  - Verify all tweaks are compatible with your system" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}
`;
