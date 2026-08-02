$ErrorActionPreference = 'Stop'

$RootDir = Split-Path -Parent $PSScriptRoot

$ImageName = if ($env:IMAGE_NAME) { $env:IMAGE_NAME } else { 'leccionario-backend:latest' }
$ContainerName = if ($env:CONTAINER_NAME) { $env:CONTAINER_NAME } else { 'leccionario-backend' }
$HostPort = if ($env:HOST_PORT) { $env:HOST_PORT } else { '1080' }
$ContainerPort = if ($env:CONTAINER_PORT) { $env:CONTAINER_PORT } else { '1080' }
$DbUrl = if ($env:DB_URL) { $env:DB_URL } else { 'jdbc:postgresql://host.docker.internal:5432/leccionario_db' }
$DbUsername = if ($env:DB_USERNAME) { $env:DB_USERNAME } else { 'postgres' }
$DbPassword = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { '086411421' }
$JwtSecret = if ($env:JWT_SECRET) { $env:JWT_SECRET } else { 'change-this-secret-key-with-at-least-32-chars' }
$SpringProfilesActive = if ($env:SPRING_PROFILES_ACTIVE) { $env:SPRING_PROFILES_ACTIVE } else { '' }

Write-Host "[backend] Construyendo imagen Docker $ImageName"
docker build -t $ImageName -f (Join-Path $RootDir 'backend\Dockerfile') (Join-Path $RootDir 'backend')

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
    '-e', "SPRING_DATASOURCE_USERNAME=$DbUsername",
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
