#!/bin/sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND_DIR="${ROOT_DIR}/frontend"
DIST_DIR="${FRONTEND_DIR}/dist/leccionario-frontend/browser"

WEB_ROOT="${WEB_ROOT:-/var/www/leccionario}"
NGINX_CONF_PATH="${NGINX_CONF_PATH:-/etc/nginx/sites-enabled/leccionario.conf}"
BACKEND_UPSTREAM="${BACKEND_UPSTREAM:-127.0.0.1:8080}"
NGINX_RELOAD_CMD="${NGINX_RELOAD_CMD:-systemctl reload nginx}"

echo "[frontend] Instalando dependencias"
cd "${FRONTEND_DIR}"
npm ci

echo "[frontend] Generando build Angular (base-href: /leccionario/)"
npm run build -- --configuration production --base-href /leccionario/

echo "[frontend] Publicando archivos en ${WEB_ROOT}"
mkdir -p "${WEB_ROOT}"
rsync -av --delete "${DIST_DIR}/" "${WEB_ROOT}/"

echo "[frontend] Generando configuracion de Nginx en ${NGINX_CONF_PATH}"
cat > "${NGINX_CONF_PATH}" << 'NGINX_EOF'
server {
    listen 80;
    server_name _;

    # --- Leccionario ---
    location /leccionario/ {
        alias /var/www/leccionario/;
        try_files $uri $uri/ /leccionario/index.html;

        location ~* \.(?:css|js|woff2?|ttf|eot|ico|svg|gif|jpe?g|png|webp)$ {
            expires 7d;
            add_header Cache-Control "public, immutable";
        }
    }

    location /leccionario/api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_connect_timeout 10s;
    }

    # --- Family Finance ---
    location /family-finance/ {
        alias /var/www/family-finance/;
        try_files $uri $uri/ /family-finance/index.html;
    }

    location /family-finance/api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /family-finance/health {
        proxy_pass http://127.0.0.1:5000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # --- Root redirect ---
    location = / {
        return 302 /leccionario/;
    }
}
NGINX_EOF

if [ "${BACKEND_UPSTREAM}" != "127.0.0.1:8080" ]; then
    sed -i "s|127.0.0.1:8080|${BACKEND_UPSTREAM}|g" "${NGINX_CONF_PATH}"
fi

echo "[frontend] Eliminando configuracion anterior de family-finance (consolidada)"
rm -f /etc/nginx/sites-enabled/family-finance.conf

echo "[frontend] Validando Nginx"
nginx -t

echo "[frontend] Recargando Nginx"
eval "${NGINX_RELOAD_CMD}"

echo ""
echo "[frontend] Despliegue completado"
echo "  Leccionario:    http://$(hostname -I | awk '{print $1}')/leccionario/"
echo "  Family Finance: http://$(hostname -I | awk '{print $1}')/family-finance/"
