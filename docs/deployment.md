# Deployment

Este proyecto queda listo para desplegarse con:

- backend Spring Boot dentro de Docker
- frontend Angular publicado en Nginx fuera de Docker
- app Flutter compilada a APK

## Backend Docker

Archivos:

- `backend/Dockerfile`
- `scripts/deploy_backend_docker.sh`
- `scripts/deploy_backend_docker.ps1`
- `scripts/deploy_backend_docker.bat`

Variables principales:

- `IMAGE_NAME`
- `CONTAINER_NAME`
- `HOST_PORT`
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`

Ejemplo Linux:

```bash
export DB_URL='jdbc:postgresql://192.168.1.20:5432/leccionario_db'
export DB_USERNAME='postgres'
export DB_PASSWORD='12345'
export JWT_SECRET='cambia-esta-clave-por-una-mucho-mas-segura'
./scripts/deploy_backend_docker.sh
```

Ejemplo PowerShell:

```powershell
$env:DB_URL = 'jdbc:postgresql://192.168.1.20:5432/leccionario_db'
$env:DB_USERNAME = 'postgres'
$env:DB_PASSWORD = '12345'
$env:JWT_SECRET = 'cambia-esta-clave-por-una-mucho-mas-segura'
.\scripts\deploy_backend_docker.ps1
```

## Frontend Nginx

Archivos:

- `deploy/nginx/leccionario.conf.template`
- `scripts/deploy_frontend_nginx.sh`
- `scripts/deploy_frontend_nginx.ps1`
- `scripts/deploy_frontend_nginx.bat`

El frontend usa:

- `http://localhost:1080/api` en desarrollo local
- `/api` cuando se sirve desde Nginx en produccion

Variables principales:

- `WEB_ROOT`
- `NGINX_CONF_PATH`
- `SERVER_NAME`
- `BACKEND_UPSTREAM`

Ejemplo Linux:

```bash
export WEB_ROOT='/var/www/leccionario'
export NGINX_CONF_PATH='/etc/nginx/conf.d/leccionario.conf'
export SERVER_NAME='leccionario.midominio.com'
export BACKEND_UPSTREAM='127.0.0.1:1080'
sudo -E ./scripts/deploy_frontend_nginx.sh
```

Ejemplo Windows:

```bat
set WEB_ROOT=C:\nginx\html\leccionario
set NGINX_CONF_PATH=C:\nginx\conf\servers\leccionario.conf
set SERVER_NAME=localhost
set BACKEND_UPSTREAM=127.0.0.1:1080
scripts\deploy_frontend_nginx.bat
```

## APK Flutter

Archivos:

- `scripts/build_mobile_apk.sh`
- `scripts/build_mobile_apk.ps1`
- `scripts/build_mobile_apk.bat`

Flujo:

1. Si no existe la carpeta `android`, el script ejecuta `flutter create .`
2. Descarga dependencias con `flutter pub get`
3. Genera `app-release.apk`
4. Copia el APK final a `mobile_flutter/build_artifacts`

Ejemplo Linux:

```bash
./scripts/build_mobile_apk.sh
```

Ejemplo PowerShell:

```powershell
.\scripts\build_mobile_apk.ps1
```

## Notas

- Para el frontend en Nginx, asegúrate de tener permisos de escritura sobre el directorio web y la configuracion de Nginx.
- Para el APK necesitas Flutter y el toolchain Android instalados.
- Para produccion cambia siempre `JWT_SECRET` y las credenciales de base de datos.
