@echo off
setlocal enabledelayedexpansion

set "ROOT_DIR=%~dp0.."

if "%IMAGE_NAME%"=="" set "IMAGE_NAME=leccionario-backend:latest"
if "%CONTAINER_NAME%"=="" set "CONTAINER_NAME=leccionario-backend"
if "%HOST_PORT%"=="" set "HOST_PORT=1080"
if "%CONTAINER_PORT%"=="" set "CONTAINER_PORT=1080"
if "%DB_URL%"=="" set "DB_URL=jdbc:postgresql://host.docker.internal:5432/leccionario"
if "%DB_USERNAME%"=="" set "DB_USERNAME=postgres"
if "%DB_PASSWORD%"=="" (
    echo ERROR: DB_PASSWORD no esta definido. Exporta la variable de entorno antes de ejecutar.
    exit /b 1
)
if "%JWT_SECRET%"=="" (
    echo ERROR: JWT_SECRET no esta definido. Exporta la variable de entorno antes de ejecutar.
    exit /b 1
)

echo [backend] Construyendo imagen Docker %IMAGE_NAME%
docker build -t %IMAGE_NAME% -f "%ROOT_DIR%\Dockerfile" "%ROOT_DIR%"
if errorlevel 1 exit /b 1

for /f "delims=" %%i in ('docker ps -a --format "{{.Names}}"') do (
  if "%%i"=="%CONTAINER_NAME%" (
    echo [backend] Eliminando contenedor previo %CONTAINER_NAME%
    docker rm -f %CONTAINER_NAME%
  )
)

echo [backend] Iniciando contenedor %CONTAINER_NAME%
docker run -d ^
  --name %CONTAINER_NAME% ^
  --restart unless-stopped ^
  -p %HOST_PORT%:%CONTAINER_PORT% ^
  -e SPRING_DATASOURCE_URL=%DB_URL% ^
  -e SPRING_DATASOURCE_USERNAME=%DB_USERNAME% ^
  -e SPRING_DATASOURCE_PASSWORD=%DB_PASSWORD% ^
  -e SECURITY_JWT_SECRET=%JWT_SECRET% ^
  %IMAGE_NAME%

if errorlevel 1 exit /b 1

echo [backend] Despliegue completado
docker ps --filter "name=%CONTAINER_NAME%"
