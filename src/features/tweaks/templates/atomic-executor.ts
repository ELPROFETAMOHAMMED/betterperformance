export const atomicExecutor = `
# ---------------------------------------------------------------------------
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
    if (Get-Command Write-TweakLog -ErrorAction SilentlyContinue) {
        Write-TweakLog -Message "Starting Tweak: $TweakName"
    }

    $tweakResult = @{
        Name         = $TweakName
        Status       = "FAILED"
        ErrorMessage = ""
    }

    try {
        $ErrorActionPreference = "SilentlyContinue"

        # Check if the tweak script contains winget commands
        $scriptText = $TweakScript.ToString()
        $hasWinget  = $scriptText -match '\\bwinget\\b'

        if ($hasWinget) {
            # Run directly without piping to preserve winget's interactive output
            & $TweakScript
            if (Get-Command Write-TweakLog -ErrorAction SilentlyContinue) {
                Write-TweakLog -Message "Executed (Winget Mode): $TweakName"
            }
        } else {
            # Run with pipe to capture and display non-terminating errors as warnings
            & $TweakScript 2>&1 | ForEach-Object {
                $line = $_.ToString()
                $trimmed = $line.TrimStart("\`r").Trim()
                
                if (Get-Command Write-TweakLog -ErrorAction SilentlyContinue) {
                    Write-TweakLog -Message "  > $trimmed" -Type "DEBUG"
                }

                if ($_ -is [System.Management.Automation.ErrorRecord]) {
                    Write-Host "    [warn] $line" -ForegroundColor DarkYellow
                } else {
                    if ($trimmed -ne "") {
                        Write-Host "    $trimmed"
                    }
                }
            }
        }

        $tweakResult.Status = "OK"
        Write-Host "  Status: OK" -ForegroundColor Green
        if (Get-Command Write-TweakLog -ErrorAction SilentlyContinue) {
            Write-TweakLog -Message "Successfully applied: $TweakName" -Type "SUCCESS"
        }

    } catch {
        $tweakResult.Status       = "FAILED"
        $tweakResult.ErrorMessage = $_.Exception.Message
        Write-Host "  Status: FAILED - $($tweakResult.ErrorMessage)" -ForegroundColor Red
        if (Get-Command Write-TweakLog -ErrorAction SilentlyContinue) {
            Write-TweakLog -Message "Failed to apply $TweakName. Error: $($tweakResult.ErrorMessage)" -Type "ERROR"
        }
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
