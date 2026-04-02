export const logging = `
# ---------------------------------------------------------------------------
# Logging Configuration
# ---------------------------------------------------------------------------
$DateString = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$script:LogPath = Join-Path ([Environment]::GetFolderPath("Desktop")) "BetterPerformance_Log_$DateString.log"

function Start-TweakLogging {
    $Header = @"
***************************************************************************
BetterPerformance - Execution Log
***************************************************************************
Date: $(Get-Date)
User: $env:USERNAME
Computer: $env:COMPUTERNAME
OS Version: $((Get-ItemProperty "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion").ProductName)
Log Path: $script:LogPath
***************************************************************************

"@
    $Header | Out-File -FilePath $script:LogPath -Encoding UTF8 -Force
}

function Write-TweakLog {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Type = "INFO"
    )
    
    $Timestamp = Get-Date -Format "HH:mm:ss"
    "[$Timestamp] [$Type] $Message" | Out-File -FilePath $script:LogPath -Encoding UTF8 -Append
}
`;
