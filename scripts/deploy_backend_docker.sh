#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

IMAGE_NAME="${IMAGE_NAME:-leccionario-backend:latest}"
CONTAINER_NAME="${CONTAINER_NAME:-leccionario-backend}"
HOST_PORT="${HOST_PORT:-8080}"
CONTAINER_PORT="${CONTAINER_PORT:-8080}"
DB_URL="${DB_URL:-jdbc:postgresql://host.docker.internal:5432/leccionario_db}"
DB_USERNAME="${DB_USERNAME:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-12345}"
JWT_SECRET="${JWT_SECRET:-change-this-secret-key-with-at-least-32-chars}"
SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-}"

echo "[backend] Construyendo imagen Docker ${IMAGE_NAME}"
docker build -t "${IMAGE_NAME}" -f "${ROOT_DIR}/backend/Dockerfile" "${ROOT_DIR}/backend"

if docker ps -a --format '{{.Names}}' | grep -qx "${CONTAINER_NAME}"; then
  echo "[backend] Eliminando contenedor previo ${CONTAINER_NAME}"
  docker rm -f "${CONTAINER_NAME}"
fi

RUN_ARGS=(
  run -d
  --name "${CONTAINER_NAME}"
  --restart unless-stopped
  -p "${HOST_PORT}:${CONTAINER_PORT}"
  -e "SPRING_DATASOURCE_URL=${DB_URL}"
  -e "SPRING_DATASOURCE_USERNAME=${DB_USERNAME}"
  -e "SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD}"
  -e "SECURITY_JWT_SECRET=${JWT_SECRET}"
)

if [[ -n "${SPRING_PROFILES_ACTIVE}" ]]; then
  RUN_ARGS+=(-e "SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE}")
fi

RUN_ARGS+=("${IMAGE_NAME}")

echo "[backend] Iniciando contenedor ${CONTAINER_NAME}"
docker "${RUN_ARGS[@]}"

echo "[backend] Despliegue completado"
docker ps --filter "name=${CONTAINER_NAME}"
