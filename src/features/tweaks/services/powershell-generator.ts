/**
 * Service for generating PowerShell code snippets
 */

/**
 * Generates code to check and request administrator privileges
 * If not running as admin, the script will relaunch with elevated privileges
 */
export function generateAdminCheckCode(): string {
    return `# Check if running as administrator, if not relaunch with elevated privileges
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "Administrator Privileges Required" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "This script requires administrator privileges to apply system tweaks." -ForegroundColor White
    Write-Host "Relaunching script with elevated privileges..." -ForegroundColor Cyan
    Write-Host ""

    # Get the script path - $PSCommandPath is always set when invoked with -File
    $scriptPath = $PSCommandPath
    if (-not $scriptPath) {
        Write-Host "ERROR: Could not determine script path." -ForegroundColor Red
        Write-Host "Please run this script using: powershell -File path\to\script.ps1" \`
            -ForegroundColor Yellow
        exit 1
    }

    # Relaunch with elevated privileges
    try {
        $arguments = "-NoProfile -ExecutionPolicy Bypass -File " + '"' + $scriptPath + '"'
        Start-Process powershell.exe -Verb RunAs -ArgumentList $arguments -Wait
        exit $LASTEXITCODE
    } catch {
        Write-Host "ERROR: Failed to relaunch script with administrator privileges." -ForegroundColor Red
        Write-Host "Please right-click the script and select 'Run as Administrator'." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Press any key to exit..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
}
Write-Host "Running with administrator privileges..." -ForegroundColor Green
Write-Host ""
`;
}

/**
 * Generates the progress bar helper and the atomic tweak execution function.
 *
 * Progress display strategy:
 *   1. Write-Progress  — native PowerShell progress bar shown in the PS window header area.
 *
 * The function receives the total tweak count up-front so the bar can show
 * an accurate percentage from the very first tweak.
 *
 * FIX (false-positive errors): non-terminating errors (e.g. registry path
 * auto-creation warnings) are captured via stream redirection and shown as
 * [warn] lines. Only a terminating exception reaches the catch block and
 * marks the tweak as FAILED.
 */
export function generateAtomicTweakFunction(): string {
    return `# ---------------------------------------------------------------------------
# Progress bar helper
# ---------------------------------------------------------------------------
function Show-TweakProgress {
    param (
        [int]$Current,
        [int]$Total,
        [string]$TweakName
    )

    $percent     = [math]::Round(($Current / $Total) * 100)

    # -- Native Write-Progress bar (shown in PS window header area) ----------
    Write-Progress \`
        -Activity      "BetterPerformance - Applying Tweaks" \`
        -Status        "$statusText  |  $TweakName" \`
        -PercentComplete $percent
}

# ---------------------------------------------------------------------------
# Atomic tweak executor
# ---------------------------------------------------------------------------
function Invoke-AtomicTweak {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory=$true)]
        [string]$TweakName,

        [Parameter(Mandatory=$true)]
        [scriptblock]$TweakScript,

        [Parameter(Mandatory=$true)]
        [int]$TotalTweaks
    )

    # Increment the global counter and show progress BEFORE running the tweak
    $script:TweakCurrentIndex++
    Show-TweakProgress -Current $script:TweakCurrentIndex -Total $TotalTweaks -TweakName $TweakName

    Write-Host "  Executing: $TweakName" -ForegroundColor Cyan

    $tweakResult = @{
        Name         = $TweakName
        Status       = "FAILED"
        ErrorMessage = ""
    }

    try {
        $ErrorActionPreference = "SilentlyContinue"

        # Check if the tweak script contains winget commands
        # Winget uses Unicode progress bars and carriage returns that break
        # when piped through ForEach-Object — run it directly in that case
        $scriptText = $TweakScript.ToString()
        $hasWinget  = $scriptText -match '\bwinget\b'

        if ($hasWinget) {
            # Run directly without piping to preserve winget's interactive output
            & $TweakScript
        } else {
            # Run with pipe to capture and display non-terminating errors as warnings
            & $TweakScript 2>&1 | ForEach-Object {
                if ($_ -is [System.Management.Automation.ErrorRecord]) {
                    Write-Host "    [warn] $($_.ToString())" -ForegroundColor DarkYellow
                } else {
                    $line    = $_.ToString()
                    $trimmed = $line.TrimStart("\`r").Trim()
                    if ($trimmed -ne "") {
                        Write-Host "    $trimmed"
                    }
                }
            }
        }

        $tweakResult.Status = "OK"
        Write-Host "  Status: OK" -ForegroundColor Green

    } catch {
        $tweakResult.Status       = "FAILED"
        $tweakResult.ErrorMessage = $_.Exception.Message
        Write-Host "  Status: FAILED - $($tweakResult.ErrorMessage)" -ForegroundColor Red
    } finally {
        $ErrorActionPreference = "Continue"
    }

    $script:TweakResults += $tweakResult
}

# ---------------------------------------------------------------------------
# Global state
# ---------------------------------------------------------------------------
$script:TweakResults      = @()
$script:TweakCurrentIndex = 0
`;
}

/**
 * Wraps a single tweak code with atomic execution.
 * @param totalTweaks - The total number of tweaks in the script, used so the
 *                      progress bar can show an accurate percentage from the start.
 */
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

        # Create restore point using PowerShell
        $restorePointName = "Better Performance Restore Point"
        Write-Host "Creating restore point: $restorePointName" -ForegroundColor Cyan
        Write-Host "This may take 1-2 minutes, please be patient..." -ForegroundColor Gray

        # Use Checkpoint-Computer (Windows 10+ PowerShell cmdlet)
        # This cmdlet will fail gracefully if System Restore is disabled
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
            $errorMessage = $_.Exception.Message

            # Check if System Restore is not available (common on Windows Server)
            if ($errorMessage -match "not recognized" -or $errorMessage -match "not available" -or $errorMessage -match "not supported") {
                Write-Host "WARNING: System Restore is not available on this system." -ForegroundColor Yellow
                Write-Host "This is common on Windows Server editions where System Restore is not available." -ForegroundColor Yellow
                Write-Host ""
            } else {
                Write-Host "ERROR: Failed to create restore point using Checkpoint-Computer." -ForegroundColor Red
                Write-Host "Error details: $errorMessage" -ForegroundColor Red
                Write-Host ""
                Write-Host "This may be due to:" -ForegroundColor Yellow
                Write-Host "  - System Restore is disabled" -ForegroundColor Yellow
                Write-Host "  - Insufficient disk space" -ForegroundColor Yellow
                Write-Host "  - System Restore service is not running" -ForegroundColor Yellow
                Write-Host "  - Insufficient permissions" -ForegroundColor Yellow
                Write-Host ""
            }

            $response = Read-Host "Do you want to continue applying tweaks without a restore point? (Y/N)"
            if ($response -ne "Y" -and $response -ne "y") {
                Write-Host "Operation cancelled by user." -ForegroundColor Yellow
                throw "User cancelled restore point creation"
            }
            return $false
        }
    } catch {
        Write-Host ""
        $errorMessage = $_.Exception.Message

        # Check if this is a user cancellation
        if ($errorMessage -match "User cancelled") {
            throw $_
        }

        Write-Host "ERROR: An exception occurred while creating restore point: $errorMessage" -ForegroundColor Red
        Write-Host ""
        Write-Host "This may indicate that System Restore is not available on this system." -ForegroundColor Yellow
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
 * Wraps multiple tweaks with atomic execution.
 * Passes the total tweak count to every call so both the ASCII bar and
 * Write-Progress can show accurate percentages from the very first tweak.
 * Closes Write-Progress cleanly once all tweaks have finished.
 */
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

    // Close the native Write-Progress bar after all tweaks complete
    const closeProgress = `
# Close the native Write-Progress bar
Write-Progress -Activity "BetterPerformance - Applying Tweaks" -Completed
Write-Host ""
`;

    return `${atomicFunction}${combinedTweaks}${closeProgress}`;
}

export function prependRestorePointCode(
    code: string,
    enabled: boolean,
): string {
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
    const adminCheckCode = generateAdminCheckCode();
    const consoleThemeCode = generateConsoleTheme();
    const asciiLogoCode = generateAsciiLogo();
    const summaryCode = generateTweakSummary();

    // Use string concatenation to avoid template string issues with quotes in code
    const notificationCode = `
${summaryCode}

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

    return adminCheckCode + consoleThemeCode + asciiLogoCode + code + notificationCode;
}

/**
 * Generates the PowerShell code to apply a visual theme to the console before executing tweaks.
 */
export function generateConsoleTheme(): string {
    return `try {
    # Change the console background color to the closest equivalent of pure black (#0D0D0D)
    $Host.UI.RawUI.BackgroundColor = "Black"
    
    # Change the default text color to bright white
    $Host.UI.RawUI.ForegroundColor = "White"
    
    # Change the window title
    $Host.UI.RawUI.WindowTitle = "BetterPerformance - Applying Tweaks"
    
    # Define a set of constant color variables with semantic names
    # (Using Set-Variable with the Constant option to ensure they are not overwritten)
    Set-Variable -Name "ColorPrimary" -Value "Cyan" -Option Constant -ErrorAction SilentlyContinue
    Set-Variable -Name "ColorSuccess" -Value "Green" -Option Constant -ErrorAction SilentlyContinue
    Set-Variable -Name "ColorError"   -Value "Red" -Option Constant -ErrorAction SilentlyContinue
    Set-Variable -Name "ColorWarning" -Value "Yellow" -Option Constant -ErrorAction SilentlyContinue
    Set-Variable -Name "ColorMuted"   -Value "DarkGray" -Option Constant -ErrorAction SilentlyContinue
    Set-Variable -Name "ColorAccent"  -Value "Magenta" -Option Constant -ErrorAction SilentlyContinue
    Set-Variable -Name "ColorText"    -Value "White" -Option Constant -ErrorAction SilentlyContinue
    
    # Fallback variables in case Set-Variable fails
    if (-not $ColorPrimary) {
        $ColorPrimary = "Cyan"
        $ColorSuccess = "Green"
        $ColorError   = "Red"
        $ColorWarning = "Yellow"
        $ColorMuted   = "DarkGray"
        $ColorAccent  = "Magenta"
        $ColorText    = "White"
    }
    
    # Font size adjustment via P/Invoke is not applied in this environment.
    
    # Force UTF-8 encoding so winget and other tools display correctly
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    [Console]::InputEncoding  = [System.Text.Encoding]::UTF8
    $OutputEncoding            = [System.Text.Encoding]::UTF8

    # Clear the screen after applying the theme
    Clear-Host
} catch {
    # Silently ignore errors so the script does not break in non-GUI environments
}
`;
}

/**
 * Generates the PowerShell code to print the BetterPerformance ASCII logo and header.
 */
export function generateAsciiLogo(): string {
    return `# Print ASCII logo and header
Write-Host " -xxxxxX  ..               " -ForegroundColor $ColorAccent
Write-Host "  +X+-::++-+x++X           " -ForegroundColor $ColorAccent
Write-Host " .+x=---=XXx+-::+X         " -ForegroundColor $ColorAccent
Write-Host "  -X+=-:--X+=--::x+.       " -ForegroundColor $ColorAccent
Write-Host "   +X==-:-:+==-::-+x       " -ForegroundColor $ColorAccent
Write-Host "   ++-=-:-::==--:=X.       " -ForegroundColor $ColorAccent
Write-Host "   :X-==:--:==:-:+X-       " -ForegroundColor $ColorAccent
Write-Host "   ++==-:-:.-:--=X:        " -ForegroundColor $ColorAccent
Write-Host "   =+---===--::::+x+++=--: " -ForegroundColor $ColorAccent
Write-Host "   -X--========+=--::-=+x+x+:    " -ForegroundColor $ColorAccent
Write-Host "   xx-======-xXXXx-===---=+xx+-.      " -ForegroundColor $ColorAccent
Write-Host "   ++:-=====-+X-:XX-======:::::-+xx=  " -ForegroundColor $ColorAccent
Write-Host "   -X::::-===-+Xxxxx-=====::::-:::-++ " -ForegroundColor $ColorAccent
Write-Host "   ++-:::::-==-+xx+-=====::::==-...-X." -ForegroundColor $ColorAccent
Write-Host "  -X-===:::::-===-======::.:====:.. +x " -ForegroundColor $ColorAccent
Write-Host "  xx-=====:.:::-=======::::==---:.:.=O." -ForegroundColor $ColorAccent
Write-Host "  +x========-::::-====:::.....::::==x+xx:  " -ForegroundColor $ColorAccent
Write-Host "  X===========-:::::-:..   ...-=---:--:=XX" -ForegroundColor $ColorAccent
Write-Host "  X=============-......   :+x+++==-:::::-+X=" -ForegroundColor $ColorAccent
Write-Host "  X==============:------+O:.:-+x++++++x-    " -ForegroundColor $ColorAccent
Write-Host "  X+=============:-------x+:                " -ForegroundColor $ColorAccent
Write-Host "  xx-=============:-------+x+:              " -ForegroundColor $ColorAccent
Write-Host "  :+xxx+XX+xXX+x+xxxxxxxxxx+=               " -ForegroundColor $ColorAccent
Write-Host ""
Write-Host "        BetterPerformance v1.0" -ForegroundColor $ColorAccent
Write-Host "--------------------------------------------------" -ForegroundColor $ColorMuted
Write-Host "   Windows Performance Optimization Suite" -ForegroundColor $ColorMuted
Write-Host ""
Write-Host ""
`;
}

/**
 * Generates the PowerShell function \`Invoke-AsTrustedInstaller\`.
 *
 * The function:
 *  1. Verifies the process is running as SYSTEM or Administrator.
 *  2. Starts the TrustedInstaller service if not already running.
 *  3. Obtains the TrustedInstaller process token via NtObjectManager (preferred),
 *     PsExec (fallback), or throws a clear error if neither is available.
 *  4. Prints themed console messages using the \$Color* variables defined by
 *     generateConsoleTheme() — never redefines them.
 *  5. Executes the caller-supplied [scriptblock]\$Action under the elevated token,
 *     then reverts impersonation and stops the service.
 *
 * The TypeScript function only returns the PS string — it executes nothing.
 */
export function generateTrustedInstallerFunction(): string {
    return `# ---------------------------------------------------------------------------
# TrustedInstaller privilege escalation helper
# ---------------------------------------------------------------------------
function Invoke-AsTrustedInstaller {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = \$true)]
        [scriptblock]\$Action
    )

    try {
        # -- 1. Verify we are running as SYSTEM or Administrator ---------------
        \$currentIdentity  = [Security.Principal.WindowsIdentity]::GetCurrent()
        \$currentPrincipal = [Security.Principal.WindowsPrincipal]\$currentIdentity

        \$isSystem = \$currentIdentity.IsSystem
        \$isAdmin  = \$currentPrincipal.IsInRole(
                        [Security.Principal.WindowsBuiltInRole]::Administrator)

        if (-not \$isSystem -and -not \$isAdmin) {
            throw [System.UnauthorizedAccessException](
                "Invoke-AsTrustedInstaller requires the process to be running " +
                "as SYSTEM or as a local Administrator. " +
                "Please re-launch the script with elevated privileges.")
        }

        # -- 2. Start TrustedInstaller service if not already running ----------
        \$tiService = Get-Service -Name TrustedInstaller -ErrorAction SilentlyContinue
        if (\$tiService -and \$tiService.Status -ne 'Running') {
            try {
                Start-Service TrustedInstaller -ErrorAction Stop
            } catch {
                Write-Host ("ERROR: Failed to start TrustedInstaller service: " + \$_.Exception.Message) \`
                    -ForegroundColor \$ColorError
                throw
            }
        }

        # -- 3. Resolve the TrustedInstaller.exe PID ---------------------------
        \$tiProcess = Get-Process -Name TrustedInstaller -ErrorAction Stop

        # -- 4. Print escalation banner ----------------------------------------
        \$separator = "-" * 60
        Write-Host \$separator -ForegroundColor \$ColorWarning
        Write-Host "=  Escalating privileges to TrustedInstaller..." \`
            -ForegroundColor \$ColorWarning
        Write-Host "   This access level allows modifying protected system components." \`
            -ForegroundColor \$ColorMuted
        Write-Host "   The process will revert automatically when finished." \`
            -ForegroundColor \$ColorMuted
        Write-Host \$separator -ForegroundColor \$ColorWarning

        # -- 5. Impersonation: NtObjectManager preferred, PsExec fallback ------
        \$ntomAvailable = \$false
        try {
            Import-Module NtObjectManager -ErrorAction Stop
            \$ntomAvailable = \$true
        } catch {
            # Module not installed -- will try fallbacks below
        }

        if (\$ntomAvailable) {
            # -- NtObjectManager path ------------------------------------------
            \$tiToken = Get-NtToken \`
                -ProcessId \$tiProcess.Id \`
                -Duplicate \`
                -Access 'Query,Impersonate,AssignPrimary' \`
                -ImpersonationLevel Impersonation \`
                -ErrorAction Stop

            try {
                Use-NtToken -Token \$tiToken -ErrorAction Stop -Script {
                    Write-Host "OK  TrustedInstaller privileges active." \`
                        -ForegroundColor \$ColorSuccess

                    & \$Action
                }
            } finally {
                \$tiToken.Dispose()
            }
        } else {
            # -- PsExec fallback -----------------------------------------------
            \$psExecPath = Get-Command psexec.exe -ErrorAction SilentlyContinue |
                              Select-Object -ExpandProperty Source

            if (-not \$psExecPath) {
                throw [System.NotSupportedException](
                    "Neither the NtObjectManager module nor PsExec was found. " +
                    "Install NtObjectManager: Install-Module NtObjectManager -Scope CurrentUser " +
                    "or place psexec.exe in a directory on PATH.")
            }

            # Serialise the scriptblock to a temp file and invoke via PsExec
            \$tempScript = [System.IO.Path]::GetTempFileName() + ".ps1"
            try {
                \$Action.ToString() | Set-Content -Path \$tempScript -Encoding UTF8

                Write-Host "OK  TrustedInstaller privileges active." \`
                    -ForegroundColor \$ColorSuccess

                \$psExecArgs = @(
                    "-i", "-s", "-accepteula",
                    "powershell.exe",
                    "-NoProfile", "-ExecutionPolicy", "Bypass",
                    "-File", ("\`"" + \$tempScript + "\`"")
                )
                & \$psExecPath @\$psExecArgs

                if (\$LASTEXITCODE -ne 0) {
                    throw ("PsExec exited with code " + \$LASTEXITCODE + " while running TrustedInstaller action.")
                }
            } finally {
                if (Test-Path \$tempScript) {
                    Remove-Item \$tempScript -Force -ErrorAction SilentlyContinue
                }
            }
        }

    } finally {
        # -- 6. Revert impersonation and stop the service ----------------------
        try {
            Stop-Service TrustedInstaller -ErrorAction SilentlyContinue
        } catch {
            # Non-fatal -- best-effort cleanup only
        }
    }
}
`;
}
