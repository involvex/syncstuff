$ErrorActionPreference = "Stop"

$masterIcon = "D:\repos\ionic\syncstuff\apps\mobile\assets\app_icon.png"
$mobileDir = "D:\repos\ionic\syncstuff\apps\mobile"
$desktopDir = "D:\repos\ionic\syncstuff\apps\desktop"

# Android icons
$androidRes = Join-Path $mobileDir "android\app\src\main\res"

$androidSizes = @{
    "mipmap-mdpi"    = 48
    "mipmap-hdpi"    = 72
    "mipmap-xhdpi"  = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi"= 192
}

foreach ($dir in $androidSizes.Keys) {
    $size = $androidSizes[$dir]
    $outDir = Join-Path $androidRes $dir
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
    $outFile = Join-Path $outDir "ic_launcher.png"
    magick $masterIcon -resize "${size}x${size}" -strip $outFile
    Write-Host "Created: $outFile (${size}x${size})"
}

# Android adaptive icon foreground (108dp base)
$adaptiveSizes = @{
    "mipmap-mdpi"    = 108
    "mipmap-hdpi"    = 162
    "mipmap-xhdpi"  = 216
    "mipmap-xxhdpi" = 324
    "mipmap-xxxhdpi"= 432
}

# Create foreground with padding (icon is centered with 1/3 margin)
foreach ($dir in $adaptiveSizes.Keys) {
    $size = $adaptiveSizes[$dir]
    $outDir = Join-Path $androidRes $dir
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null

    # Foreground: icon with transparent background
    magick $masterIcon -resize "${size}x${size}" -strip (Join-Path $outDir "ic_launcher_foreground.png")

    # Background: solid color
    magick -size "${size}x${size}" xc:"#1565C0" -strip (Join-Path $outDir "ic_launcher_background.png")
}

# Adaptive icon XML (API 26+)
$anydpiDir = Join-Path $androidRes "mipmap-anydpi-v26"
New-Item -ItemType Directory -Force -Path $anydpiDir | Out-Null

@(
    "ic_launcher.xml",
    "ic_launcher_round.xml"
) | ForEach-Object {
    $content = @"
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
"@
    Set-Content -Path (Join-Path $anydpiDir $_) -Value $content -Encoding UTF8
    Write-Host "Created: $anydpiDir/$_"
}

# Colors XML for adaptive icon background
$valuesDir = Join-Path $androidRes "values"
New-Item -ItemType Directory -Force -Path $valuesDir | Out-Null
@"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#1565C0</color>
</resources>
"@ | Set-Content -Path (Join-Path $valuesDir "ic_launcher_background.xml") -Encoding UTF8
Write-Host "Created: ic_launcher_background.xml"

# iOS icons
$iosDir = Join-Path $mobileDir "ios\Runner\Assets.xcassets\AppIcon.appiconset"
New-Item -ItemType Directory -Force -Path $iosDir | Out-Null

$iosSizes = @{
    "Icon-App-20x20@1x"    = 20
    "Icon-App-20x20@2x"    = 40
    "Icon-App-20x20@3x"    = 60
    "Icon-App-29x29@1x"    = 29
    "Icon-App-29x29@2x"    = 58
    "Icon-App-29x29@3x"    = 87
    "Icon-App-40x40@1x"    = 40
    "Icon-App-40x40@2x"    = 80
    "Icon-App-40x40@3x"   = 120
    "Icon-App-60x60@2x"   = 120
    "Icon-App-60x60@3x"   = 180
    "Icon-App-76x76@1x"    = 76
    "Icon-App-76x76@2x"   = 152
    "Icon-App-83.5x83.5@2x" = 167
    "Icon-App-1024x1024@1x" = 1024
}

$images = @()
foreach ($name in $iosSizes.Keys) {
    $size = $iosSizes[$name]
    $outFile = Join-Path $iosDir "$name.png"
    magick $masterIcon -resize "${size}x${size}" -strip $outFile
    Write-Host "Created: $outFile (${size}x${size})"

    # Parse size and scale from name
    if ($name -match '@(\d)x') {
        $scale = "$($Matches[1])x"
    } else {
        $scale = "1x"
    }
    $baseSizeStr = ($name -replace 'Icon-App-', '' -replace '@\dx', '').Split('x')[0]

    $images += @{
        idiOM = "universal"
        platform = "ios"
        size = "${baseSizeStr}x${baseSizeStr}"
        scale = $scale
        filename = "$name.png"
    }
}

$contents = @{
    images = $images
    info = @{ version = 1; author = "xcode" }
}
$contents | ConvertTo-Json -Depth 4 | Set-Content -Path (Join-Path $iosDir "Contents.json") -Encoding UTF8
Write-Host "Created: Contents.json"

# Windows desktop icon (ICO with multiple sizes)
$desktopRes = Join-Path $desktopDir "windows\runner\resources"
New-Item -ItemType Directory -Force -Path $desktopRes | Out-Null

magick $masterIcon -define icon:auto-resize=256,128,64,48,32,16 (Join-Path $desktopRes "app_icon.ico")
Write-Host "Created: app_icon.ico (Windows desktop)"

# Also copy icon to desktop assets dir
$desktopAssets = Join-Path $desktopDir "assets\icons"
New-Item -ItemType Directory -Force -Path $desktopAssets | Out-Null
Copy-Item $masterIcon (Join-Path $desktopAssets "app_icon.png") -Force
Write-Host "Created: desktop assets/icons/app_icon.png"

# Web favicon
$webPublic = "D:\repos\ionic\syncstuff\apps\web\public"
if (Test-Path $webPublic) {
    magick $masterIcon -resize 64x64 -strip (Join-Path $webPublic "favicon.ico")
    Write-Host "Created: web favicon.ico"
    magick $masterIcon -resize 192x192 -strip (Join-Path $webPublic "icon-192.png")
    magick $masterIcon -resize 512x512 -strip (Join-Path $webPublic "icon-512.png")
    Write-Host "Created: web PWA icons"
}

Write-Host "`nAll icons generated successfully!"