@echo off
setlocal

set "ROOT_DIR=%~dp0.."
set "MOBILE_DIR=%ROOT_DIR%\mobile_flutter"
if "%APK_OUT_DIR%"=="" set "APK_OUT_DIR=%MOBILE_DIR%\build_artifacts"

pushd "%MOBILE_DIR%"

if not exist "%MOBILE_DIR%\android" (
  echo [mobile] Generando plataforma Android base
  call flutter create .
  if errorlevel 1 exit /b 1
)

echo [mobile] Instalando dependencias Flutter
call flutter pub get
if errorlevel 1 exit /b 1

echo [mobile] Generando APK release
call flutter build apk --release
if errorlevel 1 exit /b 1

popd

if not exist "%APK_OUT_DIR%" mkdir "%APK_OUT_DIR%"
copy /Y "%MOBILE_DIR%\build\app\outputs\flutter-apk\app-release.apk" "%APK_OUT_DIR%\leccionario-mobile-release.apk" >nul

echo [mobile] APK generado en %APK_OUT_DIR%\leccionario-mobile-release.apk
