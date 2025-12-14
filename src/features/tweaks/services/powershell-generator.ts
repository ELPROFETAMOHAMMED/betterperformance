/**
 * Service for generating PowerShell code snippets
 */

export function generateRestorePointFunction(): string {
  return `# Function to create a system restore point
function Create-BetterPerformanceRestorePoint {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Creating System Restore Point" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Creating system restore point..." -ForegroundColor Yellow
    Write-Host "Please wait, this may take a few moments..." -ForegroundColor Gray
    Write-Host ""
    
    try {
        # Check if running as administrator
        $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
        
        if (-not $isAdmin) {
            Write-Host "ERROR: Administrator privileges are required to create a restore point." -ForegroundColor Red
            Write-Host "Please run this script as Administrator." -ForegroundColor Red
            Write-Host ""
            $response = Read-Host "Do you want to continue applying tweaks without a restore point? (Y/N)"
            if ($response -ne "Y" -and $response -ne "y") {
                Write-Host "Operation cancelled by user." -ForegroundColor Yellow
                throw "User cancelled restore point creation"
            }
            return $false
        }
        
        # Check if System Restore is enabled
        $restoreEnabled = (Get-ComputerRestore -Drive "C:").Enabled
        if (-not $restoreEnabled) {
            Write-Host "WARNING: System Restore is disabled on drive C:." -ForegroundColor Yellow
            Write-Host "You may need to enable System Restore in System Properties." -ForegroundColor Yellow
            Write-Host ""
            $response = Read-Host "Do you want to continue applying tweaks without a restore point? (Y/N)"
            if ($response -ne "Y" -and $response -ne "y") {
                Write-Host "Operation cancelled by user." -ForegroundColor Yellow
                throw "User cancelled restore point creation"
            }
            return $false
        }
        
        # Create restore point using PowerShell
        $restorePointName = "Better Performance Restore Point"
        
        Write-Host "Creating restore point: $restorePointName" -ForegroundColor Cyan
        Write-Host "This may take 1-2 minutes, please be patient..." -ForegroundColor Gray
        
        # Use Checkpoint-Computer (Windows 10+ PowerShell cmdlet)
        try {
            Checkpoint-Computer -Description $restorePointName -RestorePointType "MODIFY_SETTINGS" -ErrorAction Stop
            
            # Verify the restore point was created
            Start-Sleep -Seconds 2
            $restorePoint = Get-ComputerRestorePoint | Sort-Object -Property CreationTime -Descending | Select-Object -First 1
            
            if ($restorePoint) {
                Write-Host ""
                Write-Host "========================================" -ForegroundColor Green
                Write-Host "Restore point created successfully!" -ForegroundColor Green
                Write-Host "========================================" -ForegroundColor Green
                Write-Host "Restore point name: $restorePointName" -ForegroundColor Green
                Write-Host "Sequence number: $($restorePoint.SequenceNumber)" -ForegroundColor Gray
                Write-Host "Creation time: $($restorePoint.CreationTime)" -ForegroundColor Gray
                Write-Host ""
                Write-Host "Changes will now be applied..." -ForegroundColor Cyan
                Write-Host ""
                return $true
            } else {
                Write-Host "WARNING: Restore point may have been created but could not be verified." -ForegroundColor Yellow
                Write-Host "Continuing with tweak application..." -ForegroundColor Yellow
                return $true
            }
        } catch {
            Write-Host ""
            Write-Host "ERROR: Failed to create restore point using Checkpoint-Computer." -ForegroundColor Red
            Write-Host "Error details: $_" -ForegroundColor Red
            Write-Host ""
            Write-Host "This may be due to:" -ForegroundColor Yellow
            Write-Host "  - System Restore is disabled" -ForegroundColor Yellow
            Write-Host "  - Insufficient disk space" -ForegroundColor Yellow
            Write-Host "  - System Restore service is not running" -ForegroundColor Yellow
            Write-Host "  - Insufficient permissions" -ForegroundColor Yellow
            Write-Host ""
            
            $response = Read-Host "Do you want to continue applying tweaks without a restore point? (Y/N)"
            if ($response -ne "Y" -and $response -ne "y") {
                Write-Host "Operation cancelled by user." -ForegroundColor Yellow
                throw "User cancelled restore point creation"
            }
            
            return $false
        }
    } catch {
        Write-Host ""
        Write-Host "ERROR: An exception occurred while creating restore point: $_" -ForegroundColor Red
        Write-Host ""
        $response = Read-Host "Do you want to continue applying tweaks without a restore point? (Y/N)"
        if ($response -ne "Y" -and $response -ne "y") {
            Write-Host "Operation cancelled by user." -ForegroundColor Yellow
            throw "User cancelled restore point creation"
        }
        return $false
    }
}

`;
}

export function prependRestorePointCode(code: string, enabled: boolean): string {
  if (!enabled) {
    // Even if restore point is disabled, show that we're applying tweaks
    return `Write-Host "Applying tweaks..." -ForegroundColor Cyan
Write-Host ""

${code}`;
  }

  const restorePointFunction = generateRestorePointFunction();
  return `${restorePointFunction}# Create restore point before applying tweaks
$restorePointCreated = Create-BetterPerformanceRestorePoint
if (-not $restorePointCreated) {
    Write-Host "Continuing without restore point as requested by user." -ForegroundColor Yellow
    Write-Host ""
}
Write-Host "Applying tweaks..." -ForegroundColor Cyan
Write-Host ""

${code}`;
}

/**
 * Wraps code with error handling and completion notification
 * Always shows a success or error message at the end
 */
export function wrapWithCompletionNotification(code: string): string {
  // Use string concatenation to avoid template string issues with quotes in code
  const notificationCode = `
# Error handling and completion notification
$ErrorActionPreference = "Continue"
$scriptSuccess = $false
$errorMessage = ""
$errorOccurred = $false

# Check if any errors occurred (capture $LASTEXITCODE before it's overwritten)
if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne $null) {
    $errorOccurred = $true
    $errorMessage = "Script exited with error code: $LASTEXITCODE"
    $scriptSuccess = $false
} else {
    $scriptSuccess = $true
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
    
    $restartChoice = $null
    $timeoutSeconds = 30
    $startTime = Get-Date
    $inputReceived = $false
    
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
        $elapsed = (Get-Date) - $startTime
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
                    $key = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
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
        $countdownMsg = "Time remaining: $remaining seconds (Press Y to restart now, N to restart later)     "
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

  return code + notificationCode;
}
