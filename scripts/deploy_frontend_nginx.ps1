$ErrorActionPreference = 'Stop'

$RootDir = Split-Path -Parent $PSScriptRoot
$FrontendDir = Join-Path $RootDir 'frontend'
$DistDir = Join-Path $FrontendDir 'dist\leccionario-frontend\browser'
$TemplateFile = Join-Path $RootDir 'deploy\nginx\leccionario.conf.template'

$WebRoot = if ($env:WEB_ROOT) { $env:WEB_ROOT } else { 'C:\nginx\html\leccionario' }
$NginxConfPath = if ($env:NGINX_CONF_PATH) { $env:NGINX_CONF_PATH } else { 'C:\nginx\conf\servers\leccionario.conf' }
$ServerName = if ($env:SERVER_NAME) { $env:SERVER_NAME } else { 'localhost' }
$BackendUpstream = if ($env:BACKEND_UPSTREAM) { $env:BACKEND_UPSTREAM } else { '127.0.0.1:1080' }
$NginxExe = if ($env:NGINX_EXE) { $env:NGINX_EXE } else { 'nginx' }

Write-Host "[frontend] Instalando dependencias"
Push-Location $FrontendDir
npm ci

Write-Host "[frontend] Generando build Angular"
npm run build
Pop-Location

Write-Host "[frontend] Publicando archivos en $WebRoot"
New-Item -ItemType Directory -Force -Path $WebRoot | Out-Null
robocopy $DistDir $WebRoot /MIR | Out-Null

Write-Host "[frontend] Generando configuracion de Nginx en $NginxConfPath"
$Template = Get-Content $TemplateFile -Raw
$Config = $Template.Replace('__SERVER_NAME__', $ServerName).Replace('__WEB_ROOT__', $WebRoot.Replace('\', '/')).Replace('__BACKEND_UPSTREAM__', $BackendUpstream)
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $NginxConfPath) | Out-Null
Set-Content -Path $NginxConfPath -Value $Config -NoNewline

Write-Host "[frontend] Validando Nginx"
& $NginxExe -t

Write-Host "[frontend] Recargando Nginx"
& $NginxExe -s reload

Write-Host "[frontend] Despliegue completado"
