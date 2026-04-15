@echo off
setlocal

set "ROOT_DIR=%~dp0.."
set "FRONTEND_DIR=%ROOT_DIR%\frontend"
set "DIST_DIR=%FRONTEND_DIR%\dist\leccionario-frontend\browser"
set "TEMPLATE_FILE=%ROOT_DIR%\deploy\nginx\leccionario.conf.template"

if "%WEB_ROOT%"=="" set "WEB_ROOT=C:\nginx\html\leccionario"
if "%NGINX_CONF_PATH%"=="" set "NGINX_CONF_PATH=C:\nginx\conf\servers\leccionario.conf"
if "%SERVER_NAME%"=="" set "SERVER_NAME=localhost"
if "%BACKEND_UPSTREAM%"=="" set "BACKEND_UPSTREAM=127.0.0.1:1080"
if "%NGINX_EXE%"=="" set "NGINX_EXE=nginx"

echo [frontend] Instalando dependencias
pushd "%FRONTEND_DIR%"
call npm ci
if errorlevel 1 exit /b 1

echo [frontend] Generando build Angular
call npm run build
if errorlevel 1 exit /b 1
popd

echo [frontend] Publicando archivos en %WEB_ROOT%
if not exist "%WEB_ROOT%" mkdir "%WEB_ROOT%"
robocopy "%DIST_DIR%" "%WEB_ROOT%" /MIR >nul

echo [frontend] Generando configuracion de Nginx en %NGINX_CONF_PATH%
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$template = Get-Content '%TEMPLATE_FILE%' -Raw; " ^
  "$config = $template.Replace('__SERVER_NAME__', '%SERVER_NAME%').Replace('__WEB_ROOT__', ('%WEB_ROOT%'.Replace('\','/'))).Replace('__BACKEND_UPSTREAM__', '%BACKEND_UPSTREAM%'); " ^
  "New-Item -ItemType Directory -Force -Path (Split-Path -Parent '%NGINX_CONF_PATH%') | Out-Null; " ^
  "Set-Content -Path '%NGINX_CONF_PATH%' -Value $config -NoNewline"
if errorlevel 1 exit /b 1

echo [frontend] Validando Nginx
%NGINX_EXE% -t
if errorlevel 1 exit /b 1

echo [frontend] Recargando Nginx
%NGINX_EXE% -s reload
if errorlevel 1 exit /b 1

echo [frontend] Despliegue completado
