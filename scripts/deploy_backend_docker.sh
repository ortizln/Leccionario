#!/bin/sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

IMAGE_NAME="${IMAGE_NAME:-leccionario-backend:latest}"
CONTAINER_NAME="${CONTAINER_NAME:-leccionario-backend}"
HOST_PORT="${HOST_PORT:-1080}"
CONTAINER_PORT="${CONTAINER_PORT:-1080}"
DB_HOST="${DB_HOST:-192.168.1.43}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-leccionario}"
DB_USER="${DB_USER:-postgres}"
DB_PASS="${DB_PASS:-086411421}"
JWT_SECRET="${JWT_SECRET:-change-this-secret-key-with-at-least-32-chars}"
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
