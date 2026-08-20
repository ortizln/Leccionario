#!/bin/bash
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"

usage() {
  echo "Uso: $0 [--setup]"
  echo ""
  echo "  --setup   Configuracion interactiva (genera/actualiza .env)"
  echo "  (sin args) Despliega el backend usando .env existente"
  exit 0
}

# ── Modo setup interactivo ─────────────────────────────────────
if [ "${1:-}" = "--setup" ]; then
  echo "============================================"
  echo "  Configuracion del backend Leccionario"
  echo "  (Enter acepta valor entre parentesis)"
  echo "============================================"

  # Cargar valores previos si existen
  if [ -f "$ENV_FILE" ]; then
    set -a; . "$ENV_FILE"; set +a
    echo "[setup] Valores cargados desde .env existente"
    echo ""
  fi

  read -rp "  DB_HOST [${DB_HOST:-192.168.1.43}]: " v; DB_HOST="${v:-${DB_HOST:-192.168.1.43}}"
  read -rp "  DB_PORT [${DB_PORT:-5432}]: " v; DB_PORT="${v:-${DB_PORT:-5432}}"
  read -rp "  DB_NAME [${DB_NAME:-leccionario}]: " v; DB_NAME="${v:-${DB_NAME:-leccionario}}"
  read -rp "  DB_USER [${DB_USER:-postgres}]: " v; DB_USER="${v:-${DB_USER:-postgres}}"

  # Password siempre se pide (no se muestra)
  DB_PASS=""
  while [ -z "$DB_PASS" ]; do
    _prev="${DB_PASS:-}"
    read -rsp "  DB_PASS (obligatorio): " v; echo
    DB_PASS="${v:-$_prev}"
    [ -z "$DB_PASS" ] && echo "  [!] Debe ingresar la contrasena"
  done

  read -rp "  JWT_SECRET [${JWT_SECRET:-leccionario-secret-2026}]: " v
  JWT_SECRET="${v:-${JWT_SECRET:-leccionario-secret-2026}}"

  # CORS:detectar dominio del servidor automaticamente
  _default_cors="http://localhost:4200,https://alan-tek.com,http://alan-tek.com,http://${DB_HOST}"
  read -rp "  CORS_ALLOWED_ORIGINS [${_default_cors}]: " v
  CORS_ALLOWED_ORIGINS="${v:-$_default_cors}"

  read -rp "  HOST_PORT [${HOST_PORT:-1080}]: " v; HOST_PORT="${v:-${HOST_PORT:-1080}}"
  read -rp "  CONTAINER_PORT [${CONTAINER_PORT:-1080}]: " v; CONTAINER_PORT="${v:-${CONTAINER_PORT:-1080}}"
  read -rp "  SPRING_PROFILES_ACTIVE [${SPRING_PROFILES_ACTIVE:-prod}]: " v
  SPRING_PROFILES_ACTIVE="${v:-${SPRING_PROFILES_ACTIVE:-prod}}"

  # Guardar .env
  cat > "$ENV_FILE" <<SETEOF
# Leccionario - Variables de entorno (generado por --setup)
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASS=${DB_PASS}
JWT_SECRET=${JWT_SECRET}
CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}
HOST_PORT=${HOST_PORT}
CONTAINER_PORT=${CONTAINER_PORT}
SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE}
SETEOF
  chmod 600 "$ENV_FILE"

  echo ""
  echo "============================================"
  echo "  Configuracion guardada en ${ENV_FILE}"
  echo "  Ejecuta: $0"
  echo "============================================"
  exit 0
fi

# ── Modo deploy ────────────────────────────────────────────────

# Cargar .env si existe
if [ -f "$ENV_FILE" ]; then
  echo "[backend] Cargando variables desde ${ENV_FILE}"
  set -a
  . "$ENV_FILE"
  set +a
else
  echo "ERROR: No existe ${ENV_FILE}"
  echo "  Ejecuta: $0 --setup"
  exit 1
fi

# Validar variables obligatorias
for var in DB_HOST DB_NAME DB_USER DB_PASS JWT_SECRET; do
  if [ -z "${!var:-}" ]; then
    echo "ERROR: ${var} no esta definido. Ejecuta: $0 --setup"
    exit 1
  fi
done

IMAGE_NAME="${IMAGE_NAME:-leccionario-backend:latest}"
CONTAINER_NAME="${CONTAINER_NAME:-leccionario-backend}"
HOST_PORT="${HOST_PORT:-1080}"
CONTAINER_PORT="${CONTAINER_PORT:-1080}"
DB_PORT="${DB_PORT:-5432}"
SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-prod}"
CORS_ALLOWED_ORIGINS="${CORS_ALLOWED_ORIGINS:-http://localhost:4200}"

echo "[backend] Base de datos: ${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo "[backend] CORS: ${CORS_ALLOWED_ORIGINS}"

# Eliminar todos los contenedores previos (incluyendo docker-compose)
for name in "${CONTAINER_NAME}" "leccionario-api"; do
  if docker ps -a --format '{{.Names}}' | grep -qx "$name"; then
    echo "[backend] Eliminando contenedor previo: ${name}"
    docker rm -f "$name" >/dev/null 2>&1 || true
  fi
done

echo "[backend] Construyendo imagen Docker ${IMAGE_NAME} (sin cache)..."
docker build --no-cache -t "${IMAGE_NAME}" -f "${ROOT_DIR}/Dockerfile" "${ROOT_DIR}"

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
  -e "CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}" \
  "${IMAGE_NAME}"

echo ""
echo "[backend] Despliegue completado. Logs:"
docker logs -f "${CONTAINER_NAME}" &
LOG_PID=$!

# Esperar a que arranque (max 120s)
for i in $(seq 1 120); do
  if docker logs "${CONTAINER_NAME}" 2>&1 | grep -q "Started LeccionarioApplication"; then
    echo "[backend] Aplicacion arrancada correctamente"
    break
  fi
  sleep 1
done

kill $LOG_PID 2>/dev/null || true
echo ""
docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
