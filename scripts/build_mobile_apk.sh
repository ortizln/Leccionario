#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOBILE_DIR="${ROOT_DIR}/mobile_flutter"
APK_OUT_DIR="${APK_OUT_DIR:-${MOBILE_DIR}/build_artifacts}"

cd "${MOBILE_DIR}"

if [[ ! -d android ]]; then
  echo "[mobile] Generando plataforma Android base"
  flutter create .
fi

echo "[mobile] Instalando dependencias Flutter"
flutter pub get

echo "[mobile] Generando APK release"
flutter build apk --release

mkdir -p "${APK_OUT_DIR}"
cp "${MOBILE_DIR}/build/app/outputs/flutter-apk/app-release.apk" "${APK_OUT_DIR}/leccionario-mobile-release.apk"

echo "[mobile] APK generado en ${APK_OUT_DIR}/leccionario-mobile-release.apk"
