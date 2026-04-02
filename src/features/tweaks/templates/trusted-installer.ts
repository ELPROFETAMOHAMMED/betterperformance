export const trustedInstaller = `
# ---------------------------------------------------------------------------
# TrustedInstaller privilege escalation helper
# ---------------------------------------------------------------------------
function Invoke-AsTrustedInstaller {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [scriptblock]$Action
    )

    try {
        # -- 1. Verify we are running as SYSTEM or Administrator ---------------
        $currentIdentity  = [Security.Principal.WindowsIdentity]::GetCurrent()
        $currentPrincipal = [Security.Principal.WindowsPrincipal]$currentIdentity

        $isSystem = $currentIdentity.IsSystem
        $isAdmin  = $currentPrincipal.IsInRole(
                        [Security.Principal.WindowsBuiltInRole]::Administrator)

        if (-not $isSystem -and -not $isAdmin) {
            throw [System.UnauthorizedAccessException](
                "Invoke-AsTrustedInstaller requires the process to be running " +
                "as SYSTEM or as a local Administrator. " +
                "Please re-launch the script with elevated privileges.")
        }

        # -- 2. Start TrustedInstaller service if not already running ----------
        $tiService = Get-Service -Name TrustedInstaller -ErrorAction SilentlyContinue
        if ($tiService -and $tiService.Status -ne 'Running') {
            try {
                Start-Service TrustedInstaller -ErrorAction Stop
            } catch {
                Write-Host ("ERROR: Failed to start TrustedInstaller service: " + $_.Exception.Message) \`
                    -ForegroundColor $ColorError
                throw
            }
        }

        # -- 3. Resolve the TrustedInstaller.exe PID ---------------------------
        $tiProcess = Get-Process -Name TrustedInstaller -ErrorAction Stop

        # -- 4. Print escalation banner ----------------------------------------
        $separator = "-" * 60
        Write-Host $separator -ForegroundColor $ColorWarning
        Write-Host "=  Escalating privileges to TrustedInstaller..." \`
            -ForegroundColor $ColorWarning
        Write-Host "   This access level allows modifying protected system components." \`
            -ForegroundColor $ColorMuted
        Write-Host "   The process will revert automatically when finished." \`
            -ForegroundColor $ColorMuted
        Write-Host $separator -ForegroundColor $ColorWarning

        # -- 5. Impersonation: NtObjectManager preferred, PsExec fallback ------
        $ntomAvailable = $false
        try {
            Import-Module NtObjectManager -ErrorAction Stop
            $ntomAvailable = $true
        } catch {
            # Module not installed -- will try fallbacks below
        }

        if ($ntomAvailable) {
            # -- NtObjectManager path ------------------------------------------
            $tiToken = Get-NtToken \`
                -ProcessId $tiProcess.Id \`
                -Duplicate \`
                -Access 'Query,Impersonate,AssignPrimary' \`
                -ImpersonationLevel Impersonation \`
                -ErrorAction Stop

            try {
                Use-NtToken -Token $tiToken -ErrorAction Stop -Script {
                    Write-Host "OK  TrustedInstaller privileges active." \`
                        -ForegroundColor $ColorSuccess

                    & $Action
                }
            } finally {
                $tiToken.Dispose()
            }
        } else {
            # -- PsExec fallback -----------------------------------------------
            $psExecPath = Get-Command psexec.exe -ErrorAction SilentlyContinue |
                              Select-Object -ExpandProperty Source

            if (-not $psExecPath) {
                throw [System.NotSupportedException](
                    "Neither the NtObjectManager module nor PsExec was found. " +
                    "Install NtObjectManager: Install-Module NtObjectManager -Scope CurrentUser " +
                    "or place psexec.exe in a directory on PATH.")
            }

            # Serialise the scriptblock to a temp file and invoke via PsExec
            $tempScript = [System.IO.Path]::GetTempFileName() + ".ps1"
            try {
                $Action.ToString() | Set-Content -Path $tempScript -Encoding UTF8

                Write-Host "OK  TrustedInstaller privileges active." \`
                    -ForegroundColor $ColorSuccess

                $psExecArgs = @(
                    "-i", "-s", "-accepteula",
                    "powershell.exe",
                    "-NoProfile", "-ExecutionPolicy", "Bypass",
                    "-File", ("\`"" + $tempScript + "\`"")
                )
                
                Start-Process -FilePath $psExecPath -ArgumentList $psExecArgs -Wait -NoNewWindow
            } finally {
                if (Test-Path $tempScript) {
                    Remove-Item -Path $tempScript -Force
                }
            }
        }
    } catch {
        Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor $ColorError
        throw
    } finally {
        # -- 6. Cleanup --------------------------------------------------------
        # Optionally stop TrustedInstaller to revert to original state
        $tiService = Get-Service -Name TrustedInstaller -ErrorAction SilentlyContinue
        if ($tiService -and $tiService.Status -eq 'Running') {
            Stop-Service TrustedInstaller -ErrorAction SilentlyContinue
        }
    }
}
`;
