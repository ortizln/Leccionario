#!/bin/sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND_DIR="${ROOT_DIR}/frontend"
DIST_DIR="${FRONTEND_DIR}/dist/leccionario-frontend/browser"

WEB_ROOT="${WEB_ROOT:-/var/www/leccionario}"

echo "[frontend] Instalando dependencias"
cd "${FRONTEND_DIR}"
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo "[frontend] Generando build Angular (base-href: /leccionario/)"
npx ng build --configuration production

echo "[frontend] Publicando archivos en ${WEB_ROOT}"
mkdir -p "${WEB_ROOT}"
rsync -av --delete "${DIST_DIR}/" "${WEB_ROOT}/"

echo "[frontend] Verificando configuracion Nginx existente"
if [ -f /etc/nginx/sites-available/control-servidor ]; then
  echo "[frontend] Configuracion control-servidor encontrada - no se modifica"
else
  echo "[frontend] ADVERTENCIA: No se encontro /etc/nginx/sites-available/control-servidor"
  echo "[frontend] Copia el archivo control-servidor manualmente y ejecuta:"
  echo "  cp control-servidor /etc/nginx/sites-available/control-servidor"
  echo "  ln -sf /etc/nginx/sites-available/control-servidor /etc/nginx/sites-enabled/"
fi

echo "[frontend] Verificando sintaxis Nginx"
nginx -t

echo "[frontend] Recargando Nginx"
if command -v systemctl >/dev/null 2>&1; then
  systemctl reload nginx
else
  service nginx reload
fi

echo ""
echo "[frontend] Despliegue completado"
echo "  Leccionario: http://$(hostname -I | awk '{print $1}')/leccionario/"
