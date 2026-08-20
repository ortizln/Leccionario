#!/bin/sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

IMAGE_NAME="${IMAGE_NAME:-leccionario-backend:latest}"
CONTAINER_NAME="${CONTAINER_NAME:-leccionario-backend}"
HOST_PORT="${HOST_PORT:-1080}"
CONTAINER_PORT="${CONTAINER_PORT:-1080}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-leccionario}"
DB_USER="${DB_USER:-postgres}"

if [ -z "${DB_PASS:-}" ]; then
  echo "ERROR: DB_PASS no esta definido. Exporta la variable de entorno antes de ejecutar."
  exit 1
fi

if [ -z "${JWT_SECRET:-}" ]; then
  echo "ERROR: JWT_SECRET no esta definido. Exporta la variable de entorno antes de ejecutar."
  exit 1
fi

SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-prod}"

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
