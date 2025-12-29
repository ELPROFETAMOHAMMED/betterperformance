/**
 * Service for generating PowerShell code snippets
 */

/**
 * Generates the atomic tweak execution function that wraps each tweak
 * This function ensures each tweak executes independently and continues on error
 */
export function generateAtomicTweakFunction(): string {
  return `# Function to execute tweaks atomically with error handling
function Invoke-AtomicTweak {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory=$true)]
        [string]$TweakName,
        
        [Parameter(Mandatory=$true)]
        [scriptblock]$TweakScript
    )
    
    Write-Host "Executing: $TweakName" -ForegroundColor Cyan
    
    $tweakResult = @{
        Name = $TweakName
        Status = "FAILED"
        ErrorMessage = ""
    }
    
    # Capture error state before execution
    $errorCountBefore = $Error.Count
    $lastExitCodeBefore = $LASTEXITCODE
    
    try {
        # Reset error tracking for this tweak
        $ErrorActionPreference = "Continue"
        $LASTEXITCODE = $null
        
        # Execute the tweak script block
        & $TweakScript
        
        # Check for errors after execution
        $hasNewError = $false
        $errorMessage = ""
        
        # Check if LASTEXITCODE indicates failure
        if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne $null) {
            $hasNewError = $true
            $errorMessage = "Script exited with error code: $LASTEXITCODE"
        }
        # Check if new errors were added to $Error collection
        elseif ($Error.Count -gt $errorCountBefore) {
            $hasNewError = $true
            # Get the most recent error (first in the collection)
            $newError = $Error[0]
            if ($newError) {
                $errorMessage = $newError.ToString()
            } else {
                $errorMessage = "An error occurred during execution"
            }
        }
        
        if ($hasNewError) {
            $tweakResult.Status = "FAILED"
            $tweakResult.ErrorMessage = $errorMessage
            Write-Host "  Status: FAILED - $errorMessage" -ForegroundColor Red
        } else {
            $tweakResult.Status = "OK"
            Write-Host "  Status: OK" -ForegroundColor Green
        }
    } catch {
        $tweakResult.Status = "FAILED"
        $tweakResult.ErrorMessage = $_.Exception.Message
        Write-Host "  Status: FAILED - $($tweakResult.ErrorMessage)" -ForegroundColor Red
    } finally {
        # Clear errors from this tweak to prevent affecting next tweak
        # Only clear errors that were added during this tweak's execution
        $errorsToRemove = $Error.Count - $errorCountBefore
        if ($errorsToRemove -gt 0) {
            for ($i = 0; $i -lt $errorsToRemove; $i++) {
                if ($Error.Count -gt 0) {
                    $Error.RemoveAt(0)
                }
            }
        }
        # Reset LASTEXITCODE for next tweak
        $LASTEXITCODE = $null
    }
    
    # Add result to global array
    $script:TweakResults += $tweakResult
    
    Write-Host ""
}

# Initialize global tweak results array
$script:TweakResults = @()

`;
}

/**
 * Wraps a single tweak code with atomic execution
 */
export function wrapTweakWithAtomicExecution(
  tweakName: string,
  tweakCode: string
): string {
  // Escape double quotes and backticks for PowerShell double-quoted strings
  // Double quotes are escaped with backticks, backticks are escaped by doubling
  const escapedName = tweakName
    .replace(/`/g, "``") // Escape backticks first
    .replace(/"/g, '`"'); // Escape double quotes
  
  // Wrap the tweak code in a scriptblock
  return `Invoke-AtomicTweak "${escapedName}" {
${tweakCode}
}`;
}

/**
 * Generates the tweak execution summary table
 */
export function generateTweakSummary(): string {
  return `
# Display tweak execution summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tweak Execution Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($script:TweakResults -and $script:TweakResults.Count -gt 0) {
    $totalTweaks = $script:TweakResults.Count
    $successfulTweaks = ($script:TweakResults | Where-Object { $_.Status -eq "OK" }).Count
    $failedTweaks = ($script:TweakResults | Where-Object { $_.Status -eq "FAILED" }).Count
    
    Write-Host "Total Tweaks: $totalTweaks" -ForegroundColor White
    Write-Host "Successful: $successfulTweaks" -ForegroundColor Green
    Write-Host "Failed: $failedTweaks" -ForegroundColor $(if ($failedTweaks -gt 0) { "Red" } else { "Gray" })
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
            Write-Host "      Error: $($result.ErrorMessage)" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
} else {
    Write-Host "No tweak execution results available." -ForegroundColor Yellow
    Write-Host ""
}
`;
}

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

/**
 * Wraps multiple tweaks with atomic execution
 * Each tweak is executed independently and continues on error
 */
export function wrapTweaksWithAtomicExecution(
  tweaks: Array<{ title: string; code: string }>
): string {
  if (tweaks.length === 0) {
    return "";
  }

  // Generate the atomic function at the top
  const atomicFunction = generateAtomicTweakFunction();

  // Wrap each tweak with atomic execution
  const wrappedTweaks = tweaks.map((tweak, index) => {
    const cleanedCode = tweak.code.trim();
    if (!cleanedCode) {
      return "";
    }
    // Use title or fallback to a generic name
    const tweakName = tweak.title.trim() || `Tweak ${index + 1}`;
    return wrapTweakWithAtomicExecution(tweakName, cleanedCode);
  }).filter(Boolean);

  // Combine all wrapped tweaks
  const combinedTweaks = wrappedTweaks.join("\n\n");

  return `${atomicFunction}${combinedTweaks}`;
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
 * Includes tweak summary if atomic execution was used
 */
export function wrapWithCompletionNotification(code: string): string {
  const summaryCode = generateTweakSummary();
  
  // Use string concatenation to avoid template string issues with quotes in code
  const notificationCode = `
${summaryCode}
# Error handling and completion notification
$ErrorActionPreference = "Continue"
$scriptSuccess = $false
$errorMessage = ""
$errorOccurred = $false

# Determine script success based on tweak results if available
if ($script:TweakResults -and $script:TweakResults.Count -gt 0) {
    $failedTweaks = ($script:TweakResults | Where-Object { $_.Status -eq "FAILED" }).Count
    if ($failedTweaks -eq 0) {
        $scriptSuccess = $true
    } else {
        $scriptSuccess = $false
        $errorOccurred = $true
        $errorMessage = "$failedTweaks tweak(s) failed during execution. See summary above for details."
    }
} else {
    # Fallback to original error checking if no tweak results available
    if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne $null) {
        $errorOccurred = $true
        $errorMessage = "Script exited with error code: $LASTEXITCODE"
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
