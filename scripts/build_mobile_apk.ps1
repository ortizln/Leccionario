$ErrorActionPreference = 'Stop'

$RootDir = Split-Path -Parent $PSScriptRoot
$MobileDir = Join-Path $RootDir 'mobile_flutter'
$ApkOutDir = if ($env:APK_OUT_DIR) { $env:APK_OUT_DIR } else { (Join-Path $MobileDir 'build_artifacts') }
$ApkSource = Join-Path $MobileDir 'build\app\outputs\flutter-apk\app-release.apk'
$ApkTarget = Join-Path $ApkOutDir 'leccionario-mobile-release.apk'

Push-Location $MobileDir

if (-not (Test-Path (Join-Path $MobileDir 'android'))) {
    Write-Host "[mobile] Generando plataforma Android base"
    flutter create .
}

Write-Host "[mobile] Instalando dependencias Flutter"
flutter pub get

Write-Host "[mobile] Generando APK release"
flutter build apk --release

Pop-Location

New-Item -ItemType Directory -Force -Path $ApkOutDir | Out-Null
Copy-Item $ApkSource $ApkTarget -Force

Write-Host "[mobile] APK generado en $ApkTarget"
