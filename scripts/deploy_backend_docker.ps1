$ErrorActionPreference = 'Stop'

$RootDir = Split-Path -Parent $PSScriptRoot

# Cargar .env si existe
$EnvFile = Join-Path $PSScriptRoot '.env'
if (Test-Path $EnvFile) {
    Write-Host "[backend] Cargando variables desde $EnvFile"
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $Key = $Matches[1].Trim()
            $Value = $Matches[2].Trim()
            [Environment]::SetEnvironmentVariable($Key, $Value, 'Process')
        }
    }
}

$ImageName = if ($env:IMAGE_NAME) { $env:IMAGE_NAME } else { 'leccionario-backend:latest' }
$ContainerName = if ($env:CONTAINER_NAME) { $env:CONTAINER_NAME } else { 'leccionario-backend' }
$HostPort = if ($env:HOST_PORT) { $env:HOST_PORT } else { '1080' }
$ContainerPort = if ($env:CONTAINER_PORT) { $env:CONTAINER_PORT } else { '1080' }

# Soportar tanto DB_PASS (sh) como DB_PASSWORD (ps1)
$DbPassword = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } elseif ($env:DB_PASS) { $env:DB_PASS } else { $null }
if (-not $DbPassword) {
    Write-Error "ERROR: DB_PASSWORD/DB_PASS no esta definido.`n  Opcione A: `$env:DB_PASSWORD = 'tu_password'`n  Opcione B: Crea scripts/.env con DB_PASS=tu_password"
    exit 1
}

$JwtSecret = if ($env:JWT_SECRET) { $env:JWT_SECRET } else { $null }
if (-not $JwtSecret) {
    Write-Error "ERROR: JWT_SECRET no esta definido.`n  Opcione A: `$env:JWT_SECRET = 'tu_secreto'`n  Opcione B: Crea scripts/.env con JWT_SECRET=tu_secreto"
    exit 1
}

# Construir JDBC URL desde variables individuales
$DbHost = if ($env:DB_HOST) { $env:DB_HOST } else { 'localhost' }
$DbPort = if ($env:DB_PORT) { $env:DB_PORT } else { '5432' }
$DbName = if ($env:DB_NAME) { $env:DB_NAME } else { 'leccionario' }
$DbUser = if ($env:DB_USER) { $env:DB_USER } else { 'postgres' }
$DbUrl = "jdbc:postgresql://${DbHost}:${DbPort}/${DbName}"

$SpringProfilesActive = if ($env:SPRING_PROFILES_ACTIVE) { $env:SPRING_PROFILES_ACTIVE } else { '' }

Write-Host "[backend] Base de datos: ${DbHost}:${DbPort}/${DbName}"
Write-Host "[backend] Construyendo imagen Docker $ImageName"
docker build -t $ImageName -f (Join-Path $RootDir 'Dockerfile') $RootDir

$Existing = docker ps -a --format '{{.Names}}' | Where-Object { $_ -eq $ContainerName }
if ($Existing) {
    Write-Host "[backend] Eliminando contenedor previo $ContainerName"
    docker rm -f $ContainerName | Out-Null
}

$RunArgs = @(
    'run', '-d',
    '--name', $ContainerName,
    '--restart', 'unless-stopped',
    '-p', "${HostPort}:${ContainerPort}",
    '-e', "SPRING_DATASOURCE_URL=$DbUrl",
    '-e', "SPRING_DATASOURCE_USERNAME=$DbUser",
    '-e', "SPRING_DATASOURCE_PASSWORD=$DbPassword",
    '-e', "SECURITY_JWT_SECRET=$JwtSecret"
)

if ($SpringProfilesActive) {
    $RunArgs += @('-e', "SPRING_PROFILES_ACTIVE=$SpringProfilesActive")
}

$RunArgs += $ImageName

Write-Host "[backend] Iniciando contenedor $ContainerName"
docker @RunArgs | Out-Null

Write-Host "[backend] Despliegue completado"
docker ps --filter "name=$ContainerName"
