# Leccionario Mobile

Base Flutter para trabajar el leccionario diario en linea y offline.

## Incluye

- login con JWT
- descarga de la jornada del dia
- horario por fecha y proxima clase
- cache local SQLite
- cola de sincronizacion offline
- edicion de bloques, inasistencias y novedades
- escaneo QR para cierre de clase, firma y cierre diario

## Endpoints

- `POST /api/auth/login`
- `GET /api/daily-logs/mobile/today`
- `GET /api/daily-logs/mobile/entries/{token}`
- `POST /api/daily-logs/mobile/entries/{token}/close`
- `GET /api/daily-logs/mobile/logs/{token}`
- `GET /api/daily-logs/mobile/logs/{token}/signatures/{signatureType}`
- `POST /api/daily-logs/mobile/logs/{token}/signatures/{signatureType}`
- `POST /api/daily-logs/mobile/logs/{token}/close`
- `PUT /api/daily-logs/{dailyLogId}/entries/{entryId}`
- `PUT /api/daily-logs/{dailyLogId}/entries/{entryId}/absences`
- `PUT /api/daily-logs/{dailyLogId}/entries/{entryId}/incidents`

## Arranque

1. Instala Flutter.
2. Entra a `mobile_flutter`.
3. Si todavia no existen `android/`, `ios/` o `web/`, ejecuta `flutter create .`.
4. Ejecuta `flutter pub get`.
5. Ajusta `lib/core/config/app_config.dart`.
6. Habilita permisos de camara para Android/iOS si Flutter te los solicita.
7. Ejecuta `flutter run`.
