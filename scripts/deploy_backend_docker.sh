#!/bin/bash
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Cargar .env si existe
if [ -f "${SCRIPT_DIR}/.env" ]; then
  echo "[backend] Cargando variables desde ${SCRIPT_DIR}/.env"
  set -a
  . "${SCRIPT_DIR}/.env"
  set +a
fi

# Si falta DB_PASS, pedir interactivamente y guardar en .env
if [ -z "${DB_PASS:-}" ]; then
  echo "============================================"
  echo "  Configuracion inicial del backend"
  echo "  (Enter acepta valor entre parentesis)"
  echo "============================================"
  read -rp "  DB_HOST [192.168.1.43]: " _db_host; _db_host="${_db_host:-192.168.1.43}"
  read -rp "  DB_PORT [5432]: " _db_port; _db_port="${_db_port:-5432}"
  read -rp "  DB_NAME [leccionario]: " _db_name; _db_name="${_db_name:-leccionario}"
  read -rp "  DB_USER [postgres]: " _db_user; _db_user="${_db_user:-postgres}"
  while [ -z "${_db_pass:-}" ]; do
    read -rsp "  DB_PASS (obligatorio): " _db_pass; echo
    [ -z "${_db_pass:-}" ] && echo "  [!] Debe ingresar la contrasena"
  done
  read -rp "  JWT_SECRET [leccionario-secret-2026]: " _jwt; _jwt="${_jwt:-leccionario-secret-2026}"

  DB_HOST="$_db_host"
  DB_PORT="$_db_port"
  DB_NAME="$_db_name"
  DB_USER="$_db_user"
  DB_PASS="$_db_pass"
  JWT_SECRET="$_jwt"
  HOST_PORT="${HOST_PORT:-1080}"
  CONTAINER_PORT="${CONTAINER_PORT:-1080}"
  SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-prod}"

  # Guardar para proximas ejecuciones
  ENV_FILE="${SCRIPT_DIR}/.env"
  if touch "$ENV_FILE" 2>/dev/null; then
    cat > "$ENV_FILE" <<SETEOF
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASS=${DB_PASS}
JWT_SECRET=${JWT_SECRET}
HOST_PORT=${HOST_PORT}
CONTAINER_PORT=${CONTAINER_PORT}
SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE}
SETEOF
    chmod 600 "$ENV_FILE"
    echo "[backend] Configuracion guardada en ${ENV_FILE}"
  else
    echo "[backend] No se pudo guardar .env (permisos). Las variables se usaran solo esta vez."
  fi
  echo "============================================"
fi

IMAGE_NAME="${IMAGE_NAME:-leccionario-backend:latest}"
CONTAINER_NAME="${CONTAINER_NAME:-leccionario-backend}"
HOST_PORT="${HOST_PORT:-1080}"
CONTAINER_PORT="${CONTAINER_PORT:-1080}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-leccionario}"
DB_USER="${DB_USER:-postgres}"

if [ -z "${JWT_SECRET:-}" ]; then
  echo "ERROR: JWT_SECRET no esta definido."
  exit 1
fi

SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-prod}"

echo "[backend] Base de datos: ${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo "[backend] Construyendo imagen Docker ${IMAGE_NAME}"
docker build -t "${IMAGE_NAME}" -f "${ROOT_DIR}/Dockerfile" "${ROOT_DIR}"

if docker ps -a --format '{{.Names}}' | grep -qx "${CONTAINER_NAME}"; then
  echo "[backend] Eliminando contenedor previo ${CONTAINER_NAME}"
  docker rm -f "${CONTAINER_NAME}"
fi

echo "[backend] Iniciando contenedor ${CONTAINER_NAME}"
docker run -d \
  --name "${CONTAINER_NAME}" \
  --restart unless-stopped \
  -p "${HOST_PORT}:${CONTAINER_PORT}" \
  -e "SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE}" \
  -e "DB_HOST=${DB_HOST}" \
  -e "DB_PORT=${DB_PORT}" \
  -e "DB_NAME=${DB_NAME}" \
  -e "DB_USER=${DB_USER}" \
  -e "DB_PASS=${DB_PASS}" \
  -e "JWT_SECRET=${JWT_SECRET}" \
  -e "SERVER_PORT=${CONTAINER_PORT}" \
  "${IMAGE_NAME}"

echo "[backend] Despliegue completado"
docker ps --filter "name=${CONTAINER_NAME}"
