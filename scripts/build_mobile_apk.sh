#!/bin/sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
MOBILE_DIR="${ROOT_DIR}/mobile_flutter"
ANDROID_DIR="${MOBILE_DIR}/android"
APK_OUT_DIR="${APK_OUT_DIR:-${MOBILE_DIR}/build_artifacts}"
JDK_DIR="${HOME}/.local/share/jdk-17"
DO_CLEAN=0

for arg in "$@"; do
  case "$arg" in
    --clean) DO_CLEAN=1 ;;
  esac
done

# --- Detect or install JDK 17 (Android Gradle Plugin requires JDK <= 24) ---

detect_java_version() {
  java_version=""
  if command -v java >/dev/null 2>&1; then
    java_version="$(java -version 2>&1 | head -1 | sed 's/.*"\([0-9]*\)\.\([0-9]*\).*/\1/')"
  fi
}

install_jdk17() {
  echo "[mobile] JDK 17 no encontrado. Descargando Eclipse Temurin 17..."
  mkdir -p "${JDK_DIR}"
  ARCH="$(uname -m)"
  case "${ARCH}" in
    x86_64)  JARCH="x64" ;;
    aarch64) JARCH="aarch64" ;;
    *) echo "[mobile] ERROR: Arquitectura ${ARCH} no soportada"; exit 1 ;;
  esac

  JDK_URL="https://api.adoptium.net/v3/binary/latest/17/ga/linux/${JARCH}/jdk/hotspot/normal/eclipse?project=jdk"
  TMP_TAR="/tmp/jdk17.tar.gz"

  echo "[mobile] Descargando JDK 17 (${JARCH})..."
  curl -fSL -o "${TMP_TAR}" "${JDK_URL}" || {
    echo "[mobile] ERROR: No se pudo descargar JDK 17"
    exit 1
  }

  echo "[mobile] Extrayendo..."
  rm -rf "${JDK_DIR}"
  mkdir -p "${JDK_DIR}"
  tar -xzf "${TMP_TAR}" -C "${JDK_DIR}" --strip-components=1
  rm -f "${TMP_TAR}"
  chmod -R +x "${JDK_DIR}/bin"
  echo "[mobile] JDK 17 instalado en ${JDK_DIR}"
}

detect_java_version

if [ -n "${java_version}" ] && [ "${java_version}" -gt 24 ] 2>/dev/null; then
  echo "[mobile] Java ${java_version} detectado (incompatible con Android Gradle Plugin)"
  if [ -x "${JDK_DIR}/bin/java" ]; then
    echo "[mobile] Usando JDK 17 previamente descargado"
  else
    install_jdk17
  fi
  export JAVA_HOME="${JDK_DIR}"
  export PATH="${JDK_DIR}/bin:${PATH}"
fi

# --- Detect flutter binary ---
FLUTTER=""
for candidate in /opt/flutter/bin/flutter flutter; do
  if command -v "$candidate" >/dev/null 2>&1; then
    FLUTTER="$candidate"
    break
  fi
done

if [ -z "$FLUTTER" ]; then
  echo "[mobile] ERROR: flutter no encontrado"
  exit 1
fi

echo "[mobile] Flutter: $(${FLUTTER} --version 2>/dev/null | head -1)"
echo "[mobile] Java:   $(java -version 2>&1 | head -1)"

cd "${MOBILE_DIR}"

if [ ! -d android ]; then
  echo "[mobile] Generando plataforma Android base"
  ${FLUTTER} create .
fi

echo "[mobile] Instalando dependencias Flutter"
${FLUTTER} pub get

if [ "${DO_CLEAN}" -eq 1 ]; then
  echo "[mobile] Limpieza previa (--clean)"
  ${FLUTTER} clean
  ${FLUTTER} pub get
fi

echo "[mobile] Generando APK release"
cd "${ANDROID_DIR}"
./gradlew assembleRelease

cd "${MOBILE_DIR}"

mkdir -p "${APK_OUT_DIR}"

APK_PATH=""
for candidate in \
  "${ANDROID_DIR}/app/build/outputs/flutter-apk/app-release.apk" \
  "${ANDROID_DIR}/app/build/outputs/apk/release/app-release.apk" \
  "${MOBILE_DIR}/build/app/outputs/flutter-apk/app-release.apk"; do
  if [ -f "$candidate" ]; then
    APK_PATH="$candidate"
    break
  fi
done

if [ -z "$APK_PATH" ]; then
  echo "[mobile] ERROR: APK no generado. Revise la salida de Gradle."
  exit 1
fi

cp "$APK_PATH" "${APK_OUT_DIR}/leccionario-mobile-release.apk"

echo ""
echo "[mobile] APK generado exitosamente:"
echo "  ${APK_OUT_DIR}/leccionario-mobile-release.apk"
echo "  Tamaño: $(du -h "${APK_OUT_DIR}/leccionario-mobile-release.apk" | cut -f1)"
