# Leccionario Estudiantil Digital - Resumen Completo

## Descripcion General

Sistema de gestion academica integral disenado para instituciones educativas ecuatorianas. Digitaliza el leccionario tradicional, cubriendo el seguimiento diario de clases, asistencia, conducta (demeritos), anuncios, horarios, branding institucional y reportes.

**Arquitectura**: Monolito modular
**Stack**:
- Backend: Java 17 / Spring Boot 3.5.x / PostgreSQL / Maven
- Frontend: Angular 18 / TypeScript 5 / Bootstrap 5
- Mobile: Flutter 3.3+ / Dart (Android APK + Web)
- Despliegue: Docker (backend) + Nginx (frontend) + Flutter APK
- Base de datos: PostgreSQL 14+ con Flyway migrations (V8-V14)
- WebSocket: STOMP/SockJS para notificaciones en tiempo real

**Credenciales por defecto**: `admin` / `Admin123*`
**Puerto backend**: 1080
**Inicio**: Abril 2026 | **Commits**: 29

---

## 1. Modulos del Sistema

### 1.1 Autenticacion y Seguridad (`auth`, `security`)
- Login JWT con 24h de expiracion
- 4 roles por defecto: Administrador, Docente, Administrativo, Estudiante
- 17 permisos granulares (USER_VIEW, USER_MANAGE, ACADEMIC_VIEW, etc.)
- Admin obtiene TODOS los permisos automaticamente
- Roles de usuario con permisos asignados
- Filtro JWT en cada peticion (Bearer token)
- Admin offline: acceso sin servidor con credenciales locales

### 1.2 Gestion de Usuarios (`user`)
- CRUD completo de usuarios (crear, editar, activar/desactivar)
- Importacion masiva desde Excel (.xlsx) con Apache POI
- Exportacion: Excel, CSV, PDF (ventana de impresion)
- Plantilla de importacion descargable
- Reset de contrasena
- Gestion de roles CRUD con asignacion de permisos
- Prevencion de eliminacion de roles asignados a usuarios

### 1.3 Gestion Academica (`academic`)
- **Cursos**: CRUD con sistema educativo ecuatoriano (INICIAL, BASICA, BACHILLERATO, BGU), paralelos, nivel, grado, capacidad, seccion/sub-nivel
- **Estudiantes**: CRUD con numero de matricula, fecha nacimiento, genero, detalle con representante y horario
- **Docentes**: CRUD con especializacion, asignacion de materias (multi-select por area curricular), asignacion de cursos
- **Materias**: CRUD con codigo y area curricular, agrupadas por area
- **Representantes/Tutores**: CRUD vinculados a estudiantes, tipo de relacion, contacto de emergencia
- **Catalogos**: Anos academicos, jornadas escolares, modalidades escolares
- **Asignacion semanero**: Estudiante responsable por semana por curso
- Importacion Excel para cursos, estudiantes y docentes
- Vista general con contadores

### 1.4 Horarios (`schedule`)
- **Bloques de horario**: CRUD (hora inicio/fin, orden, tipo CLASE/RECESO)
- **Asignaciones curso-horario**: docente + materia + bloque + dia semana + aula
- Deteccion de conflictos de docente
- Importacion Excel para bloques y asignaciones
- Vista de cuadricula semanal por curso

### 1.5 Leccionario Diario (`dailylog`)
- **Generacion automatica**: Crea registros diarios basados en horarios del curso
- **Edicion por bloque**: Unidad didactica, destreza con criterio, tema, observaciones
- **Control de asistencia**: Por estudiante por bloque (AUSENTE, TARDIA, JUSTIFICADO)
- **Registro de incidentes**: Demerito por estudiante con catalogo de faltas
- **Aplicacion masiva**: Aplicar mismo incidente a multiples estudiantes
- **Firma digital**: 3 roles (Docente Tutor, Estudiante Semanero, Inspector General)
- **Cierre movil**: Flujo QR-based para cerrar bloques, firmar o cerrar leccionario completo
- **Estados**: BORRADOR -> CERRADO -> FIRMADO
- **Impresion**: Exportar leccionario diario en formato tabla para impresion/PDF

### 1.6 Sistema de Demeritos (`demerit`)
- **Categorias**: CRUD con codigo, nombre, descripcion, orden
- **Faltas**: CRUD con severidad (LEVE, MEDIA, GRAVE, MUY_GRAVE), puntuacion, flags (requiere observacion/evidencia/representante)
- **Registro estudiante**: Record con multiples faltas, puntuacion total, flujo de estados (CREADO -> VALIDADO -> APELADO -> ANULADO/APROBADO)
- **Historial de estados**: Auditoria de cambios de estado
- **Evidencia**: Campos para archivos adjuntos
- **Vista acumulada**: Vista materializada `demerit_accumulated`
- Importacion Excel de demeritos

### 1.7 Anuncios y Eventos (`announcement`)
- **Tipos**: EVENTO, TAREA, ALERTA
- **Prioridades**: BAJA, NORMAL, ALTA, URGENTE
- **Alcance**: Por curso o institucional
- **Programacion**: Asociacion a dias y bloques de horario con fechas
- **Seguimiento**: Registro de lectura por usuario, contador de no leidos
- **Calendario**: Vista de anuncios por mes
- **WebSocket**: Notificaciones push en tiempo real (creacion, edicion, eliminacion)

### 1.8 Portal Auto- servicio Estudiante (`self`)
- Mi curso (info, companeros, horario)
- Mi leccionario diario (vista del estudiante)
- Vista de anuncios con highlight en horario

### 1.9 Portal Auto-servicio Docente (`self`)
- Mis cursos con lista de estudiantes por curso
- Mi carga academica (horario semanal)
- Mi leccionario semanal (journal) con navegacion por semana
- Vista de anuncios con highlight en horario

### 1.10 Branding Institucional (`branding`)
- Configuracion visual por institucion: colores primario/secundario/acento/fondo/superficie/texto
- Logos: logo principal, logo de login
- Textos: titulo login, subtitulo login, badge, titulo shell, titulo movil
- Carrusel de imagenes en pagina de login
- Subida de archivos de assets
- API publica para branding por codigo de institucion
- Multi-tenancy: selector de institucion

### 1.11 Auditoria (`audit`)
- Registro de todas las acciones significativas: usuario, accion, modulo, detalles
- Consulta con filtros por usuario y modulo

### 1.12 Reportes (`report`)
- Dashboard con metricas (contadores de usuarios, docentes, estudiantes, lecciones, evaluaciones)
- Endpoint de exportacion PDF/Excel (placeholder, pendiente de integrar JasperReports)

### 1.13 Evaluaciones (`evaluation`)
- Entidad para calificar estudiantes por leccion (lesson plan)
- Score + feedback

---

## 2. Frontend Angular - Funcionalidades

### 2.1 Login
- Selector de institucion con carousel de imagenes
- Branding dinamico (colores, logos, textos desde servidor)
- Credenciales: usuario + contrasena

### 2.2 Shell / Navegacion
- Sidebar colapsable (persistido en localStorage)
- Por rol: Dashboard, Leccionario, Gestion Academica (expandible), Horarios, Demeritos, Usuarios, Reportes, Auditoria, Institucion, Anuncios
- Vista auto-servicio: "Mi curso" (estudiante), "Mi carga academica" (docente)
- Header con badge de usuario, nombre, rol, materia, periodo
- Footer con branding ALANTEK

### 2.3 Dashboard
- Metricas: total usuarios, docentes, estudiantes, lecciones, evaluaciones
- Accesos rapidos por permisos

### 2.4 Leccionario (Componente central)
- Navegacion semanal (Lun-Sab)
- Seleccion de curso/fecha (admin) o cursos asignados (docente)
- Edicion por bloque: unidad didactica, tema, notas
- Control de asistencia por estudiante
- Registro de incidentes/demeritos
- Codigos QR para cierre movil (bloque, firma tutor, firma semanero, cierre completo)
- Vista de anuncios en cada entrada del leccionario con colores por prioridad
- Sistema de firmas (Inspector General, Docente Tutor, Estudiante Semanero)
- Impresion/PDF del leccionario diario
- WebSocket para actualizaciones en tiempo real

### 2.5 Gestion Academica
- Cursos: CRUD, asignacion de horarios, vista de estudiantes, asignacion semanero
- Estudiantes: CRUD, detalle con tabs (datos, representante, horario)
- Docentes: CRUD, asignacion de materias/cursos, vista de horario por dia
- Materias: CRUD agrupadas por area curricular
- Representantes: CRUD vinculados a estudiantes
- Catalogos: Anos academicos, jornadas, modalidades
- Importacion Excel en todos los modulos

### 2.6 Horarios
- Bloques de tiempo (CLASE/RECESO)
- Cuadricula de asignaciones (curso x bloque x dia)
- Deteccion de conflictos
- Importacion Excel

### 2.7 Demeritos
- Tab: Categorias
- Tab: Faltas (con severidad, puntuacion, flags)
- Registro de incidentes desde el leccionario

### 2.8 Anuncios
- Lista con filtros por tipo, busqueda
- Editor con: titulo, descripcion, tipo, prioridad, curso, rango de fechas, grilla de bloques por dia
- Marcar como leido
- WebSocket: actualizaciones en tiempo real

### 2.9 Reportes
- Panel de metricas
- Exportacion PDF/Excel (pendiente)

### 2.10 Auditoria
- Log de acciones con filtros por usuario y modulo

### 2.11 Branding
- Configuracion de textos, colores, logos, carrusel
- Subida de assets
- Preview en pagina de login

### 2.12 Portal Estudiante (`Mi curso`)
- Info del curso, companeros
- Vista del leccionario diario
- Horario semanal con highlight de anuncios

### 2.13 Portal Docente (`Mi carga academica`)
- Selector de curso con busqueda
- Horario semanal por dia
- Lista de estudiantes por curso
- Vista del leccionario semanal con navegacion

### 2.14 Componentes Compartidos
- `SortableHeaderComponent`: Cabecera de tabla ordenable
- `FilterDropdownComponent`: Dropdown de filtros multi-select
- `table-utils.ts`: Funciones genericas de ordenamiento y filtrado

### 2.15 WebSocket
- Conexion STOMP sobre WebSocket
- Topicos: `/topic/notifications` (global), `/user/{username}/queue/personal` (personal)
- Reconexion automatica (5s), heartbeat (4s)
- Consumidores: Leccionario, Anuncios, Mi Curso, Mi Carga Academica

---

## 3. App Movil Flutter - Funcionalidades

### 3.1 Autenticacion
- Login JWT con selector de institucion
- Admin offline: `admin` / `Admin123*` funciona sin servidor
- Token en FlutterSecureStorage (cifrado)
- Sesion en SQLite local

### 3.2 Flujo Docente (4 tabs)
- **Horario**: Vista semanal por dia (Lun-Sab), color-coded, badges de anuncios
- **Leccionario**: Navegacion por semana, entradas por dia con estado
- **Mis Cursos**: Grid de cursos con materias y horarios, tap para ver estudiantes
- **Anuncios**: Lista con tipo/prioridad, marcar como leido

### 3.3 Mi Jornada (no docente)
- Blocs del dia con estado abierto/cerrado
- Siguiente clase
- Selector de fecha (+/- 30 dias)
- Pull-to-refresh
- Boton de escaneo QR

### 3.4 Edicion de Entrada
- Campos: unidad didactica, destreza, tema, observaciones
- Toggle de firma (FIRMADO/PENDIENTE)
- Asistencia: buscar estudiante + tipo (AUSENTE/TARDIA/JUSTIFICADO) + notas
- Incidentes: busqueda + demerito del catalogo + notas
- Aplicacion masiva: seleccionar multiples estudiantes + demerito comun + notas comunes

### 3.5 Escaneo QR
- Camara con `mobile_scanner`
- 3 modos: cierre de bloque, firma de leccionario, cierre completo
- Formulario de identificacion (usuario, codigo, notas)
- Envio de cierre al servidor

### 3.6 Offline / Sincronizacion
- SQLite local: sesion, entradas cacheadas, colas de pendientes
- Colas: actualizaciones de entrada, ausencias, incidentes
- Sincronizacion automatica al reconectar
- Deteccion de conectividad con `connectivity_plus`

### 3.7 WebSocket
- Conexion directa STOMP sobre WebSocket
- Auto-reconnect (5s), PING cada 30s
- Notificaciones push: anuncios (creados/actualizados/eliminados) como SnackBar
- Contador de no leidos en tab

### 3.8 Configuracion
- URL del backend con validacion de conexion
- Selector de tema (10 temas con preview de color)
- Persistencia en SQLite

### 3.9 Branding
- Login adaptativo: logo, colores, textos desde servidor
- Multi-tenancy: selector de institucion

### 3.10 Permisos Android
- INTERNET, ACCESS_NETWORK_STATE (conexion/offline)
- CAMERA (escaneo QR)
- VIBRATE (feedback de escaneo)

### 3.11 Dependencias Clave
- `dio` 5.7.0: HTTP client con interceptores
- `flutter_secure_storage` 9.2.4: Almacenamiento cifrado
- `sqflite` 2.4.0: SQLite local (+ fallback en memoria para web)
- `mobile_scanner` 5.2.3: Escaneo QR/barcode
- `web_socket_channel` 3.0.2: WebSocket STOMP
- `connectivity_plus` 6.0.5: Deteccion de red

---

## 4. Base de Datos

### 4.1 Entidades Principales (42+ tablas)
- **Usuarios**: users, roles, user_roles, role_permissions, teachers, teacher_subjects, teacher_courses, students, representatives
- **Academico**: institutions, academic_years, academic_periods, courses, subjects, school_days, school_modalities, week_student_assignments
- **Horarios**: schedule_blocks, course_schedules
- **Leccionario**: daily_logs, daily_log_entries, daily_log_student_absences, daily_log_student_incidents, daily_log_signatures
- **Lesson Plans**: lesson_plans
- **Demeritos**: demerits (legacy), demerit_categories, demerit_faltas, student_demers, student_demer_details, demerit_evidences, demerit_status_history
- **Anuncios**: announcements, announcement_recipients, announcement_schedules
- **Branding**: institution_branding, institution_carousel_slides
- **Evaluaciones**: evaluations
- **Auditoria**: logs
- **Config**: app_settings, session_store

### 4.2 Migraciones Flyway (V8-V14)
- V8: Eliminar columnas legacy de destreza curricular
- V9: Rediseño completo del modulo de demeritos
- V10: Agregar INICIAL a restricciones CHECK
- V11: Corregir constraint unico de cursos (incluye sub_level)
- V12: Tablas de anuncios (announcements, announcement_recipients)
- V13: Tabla announcement_schedules (anuncios por bloque de horario)
- V14: Agregar schedule_date a announcement_schedules

### 4.3 Vista Materializada
- `demerit_accumulated`: Acumulado de demeritos por estudiante

---

## 5. API REST - Endpoints Principales

| Modulo | Endpoints | Permisos |
|--------|-----------|----------|
| Auth | POST /api/auth/login | Publico |
| Usuarios | CRUD /api/users, /api/roles | USER_VIEW, USER_MANAGE, ROLE_VIEW, ROLE_MANAGE |
| Academico | CRUD /api/academic/* (courses, students, teachers, subjects, representatives, catalogs) | ACADEMIC_VIEW, ACADEMIC_MANAGE |
| Horarios | CRUD /api/schedules/* (blocks, assignments, import) | ACADEMIC_VIEW, ACADEMIC_MANAGE |
| Leccionario | POST/GET/PUT /api/daily-logs/* (generate, today, entries, absences, incidents, mobile/*) | LESSONPLAN_VIEW, LESSONPLAN_MANAGE |
| Lesson Plans | POST/GET /api/lesson-plans | LESSONPLAN_VIEW, LESSONPLAN_MANAGE |
| Demeritos | CRUD /api/demerits/*, /api/demerit-categories/*, /api/demerit-faltas/*, /api/student-demers/* | ACADEMIC_VIEW, ACADEMIC_MANAGE |
| Anuncios | CRUD /api/announcements/* | ANNOUNCEMENT_VIEW, ANNOUNCEMENT_MANAGE |
| Branding | GET/PUT /api/branding/*, /api/public/* | SETTINGS_VIEW, SETTINGS_MANAGE, Publico |
| Self-Service | GET /api/self/* (course, classmates, schedule, my-courses, my-students, my-teaching-schedule, my-weekly-journal) | STUDENT_SELF_VIEW, TEACHER_SELF_VIEW |
| Reportes | GET /api/reports/dashboard, /api/reports/lesson-plans/export | REPORT_VIEW, REPORT_EXPORT |
| Auditoria | GET /api/audit | AUDIT_VIEW |
| Health | GET /actuator/health | Publico |

### Endpoints Moviles (Publicos)
- GET /api/daily-logs/mobile/today
- GET/POST /api/daily-logs/mobile/entries/{token}[/close]
- GET/POST /api/daily-logs/mobile/logs/{token}[/close]
- GET/POST /api/daily-logs/mobile/logs/{token}/signatures/{type}

---

## 6. WebSocket - STOMP

| Topico | Tipo | Eventos |
|--------|------|---------|
| /topic/notifications | Global | ANNOUNCEMENT (CREATED, UPDATED, DELETED), SCHEDULE (CHANGED), DAILY_LOG (UPDATED) |
| /user/{username}/queue/personal | Personal | ANNOUNCEMENT (READ), notificaciones individuales |

---

## 7. Despliegue

### 7.1 Backend (Docker)
- Dockerfile multi-stage: Maven build + JRE 17 runtime
- Puerto: 1080
- Variables de entorno: DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET
- Scripts: `deploy_backend_docker.sh` (Linux), `.ps1` (Windows PowerShell), `.bat` (Windows CMD)

### 7.2 Frontend (Nginx)
- Build Angular production
- Rsync a /var/www/leccionario
- Template Nginx con proxy reverso a backend
- Scripts: `deploy_frontend_nginx.sh/.ps1/.bat`

### 7.3 Movil (Flutter APK)
- Build release con minificacion + resource shrinking
- Keystore via variables de entorno
- Scripts: `build_mobile_apk.sh/.ps1/.bat`
- Deteccion automatica de Android SDK y JDK 17

---

## 8. Scripts de Utilidad

| Script | Plataforma | Funcion |
|--------|-----------|---------|
| deploy_backend_docker.sh/ps1/bat | Linux/Windows | Desplegar backend en Docker |
| deploy_frontend_nginx.sh/ps1/bat | Linux/Windows | Desplegar frontend en Nginx |
| build_mobile_apk.sh/ps1/bat | Linux/Windows | Compilar APK de Flutter |
| clean_data.sql | PostgreSQL | Limpiar datos transaccionales (preservar catalogos) |

---

## 9. Arquitectura de Datos - Modelo Relacional

```
Institution ──< User >──< Role >──< PermissionCode
                  │
                  ├── Teacher (1:1 User)
                  │     ├── teacher_subjects
                  │     └── teacher_courses
                  │
                  └── Student (1:1 User)
                        ├── Course >── AcademicYear
                        │              SchoolDay
                        │              SchoolModality
                        │              Student (weekStudent)
                        └── Representative

Course ──< CourseSchedule >── ScheduleBlock
              ├── Subject
              ├── Teacher
              └── AcademicPeriod

LessonPlan ── Teacher, Subject, Course, AcademicPeriod
     │
     └── Evaluation >── Student

DailyLog ── Institution, Course, AcademicPeriod, User
     ├── DailyLogEntry >── ScheduleBlock, Teacher, Subject
     │     ├── DailyLogStudentAbsence >── Student
     │     └── DailyLogStudentIncident >── Student, Demerit
     └── DailyLogSignature >── User

DemeritCategory ──< DemeritFalta
StudentDemer ── Student, AcademicPeriod, Course, Teacher
     ├── StudentDemerDetail >── DemeritFalta
     ├── DemeritEvidence
     └── DemeritStatusHistory

Announcement ── Course (opt), User
     ├── AnnouncementRecipient >── User
     └── AnnouncementSchedule >── ScheduleBlock

InstitutionBranding ── Institution
InstitutionCarouselSlide ── InstitutionBranding
```

---

## 10. Permisos del Sistema

| Permiso | Descripcion | Roles por Defecto |
|---------|-------------|-------------------|
| USER_VIEW | Ver usuarios | Admin, Administrativo |
| USER_MANAGE | Gestionar usuarios | Admin |
| ROLE_VIEW | Ver roles | Admin, Administrativo |
| ROLE_MANAGE | Gestionar roles | Admin |
| ACADEMIC_VIEW | Ver datos academicos | Admin, Administrativo, Docente |
| ACADEMIC_MANAGE | Gestionar datos academicos | Admin |
| LESSONPLAN_VIEW | Ver leccionario | Admin, Administrativo, Docente, Estudiante |
| LESSONPLAN_MANAGE | Gestionar leccionario | Admin, Docente |
| REPORT_VIEW | Ver reportes | Admin, Administrativo, Docente |
| REPORT_EXPORT | Exportar reportes | Admin, Administrativo |
| AUDIT_VIEW | Ver auditoria | Admin, Administrativo |
| SETTINGS_VIEW | Ver configuracion | Admin, Administrativo |
| SETTINGS_MANAGE | Gestionar configuracion | Admin |
| STUDENT_SELF_VIEW | Portal estudiante | Estudiante |
| TEACHER_SELF_VIEW | Portal docente | Docente |
| ANNOUNCEMENT_VIEW | Ver anuncios | Admin, Administrativo, Docente, Estudiante |
| ANNOUNCEMENT_MANAGE | Gestionar anuncios | Admin, Administrativo |

---

## 11. Endpoints Moviles (API)

| Endpoint | Metodo | Auth | Descripcion |
|----------|--------|------|-------------|
| /api/daily-logs/mobile/today | GET | JWT | Jornada del dia para el docente |
| /api/daily-logs/mobile/entries/{token} | GET | Publico | Info de entrada por token |
| /api/daily-logs/mobile/entries/{token}/close | POST | Publico | Cerrar bloque de clase |
| /api/daily-logs/mobile/logs/{token} | GET | Publico | Info del leccionario por token |
| /api/daily-logs/mobile/logs/{token}/close | POST | Publico | Cerrar leccionario completo |
| /api/daily-logs/mobile/logs/{token}/signatures/{type} | GET | Publico | Estado de firma |
| /api/daily-logs/mobile/logs/{token}/signatures/{type} | POST | Publico | Registrar firma |

---

## 12. Temas de la App Movil

| # | Nombre | Color Principal | Descripcion |
|---|--------|----------------|-------------|
| 1 | Esmeralda | #0F766E | Verde institucional |
| 2 | Amanecer | #BE123C | Rojo suave |
| 3 | Cielo | #2563EB | Azul limpio |
| 4 | Noche | #1E293B | Gris profundo |
| 5 | Bosque | #166534 | Verde intenso |
| 6 | Arena | #92400E | Tonos calidos |
| 7 | Lavanda | #7C3AED | Violeta claro |
| 8 | Oceano | #0E7490 | Azul turquesa |
| 9 | Carbon | #334155 | Grafito sobrio |
| 10 | Menta | #0F766E | Verde fresco |

---

## 13. Estado del Proyecto

### Completado
- Autenticacion JWT con roles y permisos
- Gestion completa de usuarios y roles
- Gestion academica (cursos, estudiantes, docentes, materias, representantes, catalogos)
- Sistema de horarios con deteccion de conflictos
- Leccionario diario con edicion, asistencia e incidentes
- Sistema de demeritos con categorias, faltas y flujo de estados
- Anuncios con tipos, prioridades y seguimiento de lectura
- Portal auto-servicio estudiante y docente
- Branding institucional multi-tenancy
- Auditoria de acciones
- Dashboard con metricas
- WebSocket para notificaciones en tiempo real
- App movil Flutter con offline/sync
- Escaneo QR para cierre movil
- Importacion Excel en todos los modulos
- Despliegue Docker + Nginx + APK
- Temas personalizables (10 opciones)

### Pendiente / En Desarrollo
- Exportacion PDF/Excel de reportes (endpoint placeholder)
- Subida de evidencia para demeritos (entidad existe, controlador no)
- Tests unitarios del backend (solo context load test)
- Tests del movil (sin archivos de prueba)
- CI/CD automatizado
- Envio de email (campos existen, integracion no)
- Evaluaciones completas (entidad base existe)
