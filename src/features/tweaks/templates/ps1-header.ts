export const psHeader = `
# Check if running as administrator, if not relaunch with elevated privileges
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
        Write-Host "Please run this script using: powershell -File path\\to\\script.ps1" \`
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

try {
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
    
    # Force UTF-8 encoding so winget and other tools display correctly
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    [Console]::InputEncoding  = [System.Text.Encoding]::UTF8
    $OutputEncoding            = [System.Text.Encoding]::UTF8

    # Clear the screen after applying the theme
    Clear-Host
} catch {
    # Silently ignore errors so the script does not break in non-GUI environments
}

# Print ASCII logo and header
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
