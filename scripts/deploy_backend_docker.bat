@echo off
setlocal enabledelayedexpansion

set "ROOT_DIR=%~dp0.."
set "SCRIPT_DIR=%~dp0"

:: Cargar .env si existe
if exist "%SCRIPT_DIR%.env" (
    echo [backend] Cargando variables desde %SCRIPT_DIR%.env
    for /f "usebackq tokens=1,* delims==" %%a in ("%SCRIPT_DIR%.env") do (
        set "line=%%a"
        if not "!line:~0,1!"=="#" (
            set "%%a=%%b"
        )
    )
)

if "%IMAGE_NAME%"=="" set "IMAGE_NAME=leccionario-backend:latest"
if "%CONTAINER_NAME%"=="" set "CONTAINER_NAME=leccionario-backend"
if "%HOST_PORT%"=="" set "HOST_PORT=1080"
if "%CONTAINER_PORT%"=="" set "CONTAINER_PORT=1080"

:: Soportar tanto DB_PASS (sh) como DB_PASSWORD (bat)
if "%DB_PASSWORD%"=="" if not "%DB_PASS%"=="" set "DB_PASSWORD=%DB_PASS%"
if "%DB_PASSWORD%"=="" (
    echo ERROR: DB_PASSWORD/DB_PASS no esta definido.
    echo   Opcione A: set DB_PASSWORD=tu_password
    echo   Opcione B: Crea scripts\.env con DB_PASS=tu_password
    exit /b 1
)
if "%JWT_SECRET%"=="" (
    echo ERROR: JWT_SECRET no esta definido.
    echo   Opcione A: set JWT_SECRET=tu_secreto
    echo   Opcione B: Crea scripts\.env con JWT_SECRET=tu_secreto
    exit /b 1
)

:: Construir JDBC URL
if "%DB_HOST%"=="" set "DB_HOST=localhost"
if "%DB_PORT%"=="" set "DB_PORT=5432"
if "%DB_NAME%"=="" set "DB_NAME=leccionario"
if "%DB_USER%"=="" set "DB_USER=postgres"
set "DB_URL=jdbc:postgresql://%DB_HOST%:%DB_PORT%/%DB_NAME%"

echo [backend] Base de datos: %DB_HOST%:%DB_PORT%/%DB_NAME%
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
  -e SPRING_DATASOURCE_USERNAME=%DB_USER% ^
  -e SPRING_DATASOURCE_PASSWORD=%DB_PASSWORD% ^
  -e SECURITY_JWT_SECRET=%JWT_SECRET% ^
  %IMAGE_NAME%

if errorlevel 1 exit /b 1

echo [backend] Despliegue completado
docker ps --filter "name=%CONTAINER_NAME%"
