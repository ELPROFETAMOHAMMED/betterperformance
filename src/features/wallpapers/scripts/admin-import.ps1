<#
Internal BetterPerformance admin tool for importing wallpapers.
This script is not intended for end-user wallpaper downloads.
#>

param(
    [string]$AppUrl = "http://localhost:3000",
    [string]$FolderPath,
    [string]$SessionCookie,
    [string]$WallpaperPath
)

$ErrorActionPreference = "Stop"

function Get-Wallpapers {
    param(
        [string]$BaseUrl
    )

    Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/wallpapers"
}

function Get-ImageMetadata {
    param(
        [string]$Path
    )

    Add-Type -AssemblyName System.Drawing
    $image = [System.Drawing.Image]::FromFile($Path)

    try {
        $fileInfo = Get-Item -LiteralPath $Path
        [pscustomobject]@{
            Width = $image.Width
            Height = $image.Height
            FileSizeBytes = $fileInfo.Length
            Title = [System.IO.Path]::GetFileNameWithoutExtension($fileInfo.Name)
        }
    }
    finally {
        $image.Dispose()
    }
}

function New-MultipartContent {
    param(
        [string]$Path,
        [string]$Title,
        [int]$Width,
        [int]$Height,
        [long]$FileSizeBytes
    )

    $multipart = [System.Net.Http.MultipartFormDataContent]::new()
    $multipart.Add([System.Net.Http.StringContent]::new($Title), "title")
    $multipart.Add([System.Net.Http.StringContent]::new([string]$Width), "width")
    $multipart.Add([System.Net.Http.StringContent]::new([string]$Height), "height")
    $multipart.Add([System.Net.Http.StringContent]::new([string]$FileSizeBytes), "file_size_bytes")
    $multipart.Add([System.Net.Http.StringContent]::new("windows, wallpaper"), "tags")

    $bytes = [System.IO.File]::ReadAllBytes($Path)
    $fileContent = [System.Net.Http.ByteArrayContent]::new($bytes)
    $fileContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse("image/jpeg")
    $multipart.Add($fileContent, "file", [System.IO.Path]::GetFileName($Path))

    $multipart
}

function Upload-Wallpaper {
    param(
        [string]$BaseUrl,
        [string]$Path,
        [string]$CookieHeader
    )

    if ([string]::IsNullOrWhiteSpace($CookieHeader)) {
        throw "SessionCookie is required for wallpaper import."
    }

    $metadata = Get-ImageMetadata -Path $Path
    $client = [System.Net.Http.HttpClient]::new()
    $client.DefaultRequestHeaders.Add("Cookie", $CookieHeader)

    try {
        $content = New-MultipartContent -Path $Path -Title $metadata.Title -Width $metadata.Width -Height $metadata.Height -FileSizeBytes $metadata.FileSizeBytes
        $response = $client.PostAsync("$BaseUrl/api/wallpapers", $content).GetAwaiter().GetResult()
        $payload = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()

        if (-not $response.IsSuccessStatusCode) {
            throw "Upload failed for $Path. $payload"
        }

        $payload | ConvertFrom-Json
    }
    finally {
        $client.Dispose()
    }
}

function Set-DesktopWallpaper {
    param(
        [string]$Path
    )

    Add-Type @"
using System.Runtime.InteropServices;
public class WallpaperSetter {
    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool SystemParametersInfo(int uiAction, int uiParam, string pvParam, int fWinIni);
}
"@

    [WallpaperSetter]::SystemParametersInfo(20, 0, $Path, 3) | Out-Null
}

if ($FolderPath) {
    $files = Get-ChildItem -LiteralPath $FolderPath -File | Where-Object {
        $_.Extension -match "^\.(jpg|jpeg|png|webp)$"
    }

    foreach ($file in $files) {
        Upload-Wallpaper -BaseUrl $AppUrl -Path $file.FullName -CookieHeader $SessionCookie | Out-Null
    }
}

if ($WallpaperPath) {
    Set-DesktopWallpaper -Path $WallpaperPath
}

if (-not $FolderPath -and -not $WallpaperPath) {
    Get-Wallpapers -BaseUrl $AppUrl | ConvertTo-Json -Depth 6
}
