#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="${ROOT_DIR}/frontend"
DIST_DIR="${FRONTEND_DIR}/dist/leccionario-frontend/browser"
TEMPLATE_FILE="${ROOT_DIR}/deploy/nginx/leccionario.conf.template"

WEB_ROOT="${WEB_ROOT:-/var/www/leccionario}"
NGINX_CONF_PATH="${NGINX_CONF_PATH:-/etc/nginx/conf.d/leccionario.conf}"
SERVER_NAME="${SERVER_NAME:-_}"
BACKEND_UPSTREAM="${BACKEND_UPSTREAM:-127.0.0.1:1080}"
NGINX_RELOAD_CMD="${NGINX_RELOAD_CMD:-systemctl reload nginx}"

echo "[frontend] Instalando dependencias"
cd "${FRONTEND_DIR}"
npm ci

echo "[frontend] Generando build Angular"
npm run build

echo "[frontend] Publicando archivos en ${WEB_ROOT}"
mkdir -p "${WEB_ROOT}"
rsync -av --delete "${DIST_DIR}/" "${WEB_ROOT}/"

echo "[frontend] Generando configuracion de Nginx en ${NGINX_CONF_PATH}"
mkdir -p "$(dirname "${NGINX_CONF_PATH}")"
sed \
  -e "s|__SERVER_NAME__|${SERVER_NAME}|g" \
  -e "s|__WEB_ROOT__|${WEB_ROOT}|g" \
  -e "s|__BACKEND_UPSTREAM__|${BACKEND_UPSTREAM}|g" \
  "${TEMPLATE_FILE}" > "${NGINX_CONF_PATH}"

echo "[frontend] Validando Nginx"
nginx -t

echo "[frontend] Recargando Nginx"
eval "${NGINX_RELOAD_CMD}"

echo "[frontend] Despliegue completado"
