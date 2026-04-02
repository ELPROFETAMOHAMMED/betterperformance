export const restorePoint = `
# Function to create a system restore point
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
