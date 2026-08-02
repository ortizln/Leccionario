# Documentación técnica

## Propósito

Este documento resume la implementación técnica actual del sistema Leccionario y sirve como referencia para backend, frontend, seguridad, datos y operación local. También incorpora la planificación inmediata para digitalizar el leccionario físico institucional.

## Stack tecnológico

### Backend

- Java 17
- Spring Boot 3.5.x
- Spring Web
- Spring Security
- Spring Data JPA
- PostgreSQL
- JWT con `jjwt`
- MapStruct
- Lombok

### Frontend

- Angular 18
- TypeScript 5
- RxJS
- Bootstrap 5
- Bootstrap Icons

## Estructura del repositorio

- `backend/`: API REST y lógica de negocio.
- `frontend/`: SPA Angular.
- `docs/`: documentación funcional, técnica, legal y SQL.

## Backend

### Paquete base

- `com.leccionario.backend`

### Módulos actuales

- `auth`: autenticación y login.
- `security`: JWT, filtros y configuración de acceso.
- `user`: usuarios, perfiles, docentes y estudiantes.
- `institution`: instituciones educativas.
- `academic`: periodos, cursos y asignaturas.
- `lessonplan`: planificación diaria y leccionario pedagógico.
- `report`: métricas y exportaciones.
- `audit`: trazabilidad operativa.
- `common`: clases base y excepciones compartidas.
- `config`: inicialización y configuración transversal.

### Módulos siguientes

- `schedule`: horario institucional por curso, bloque, materia y docente.
- `dailylog`: control diario de avance académico por jornada.
- `attendance`: inasistencias y novedades por bloque.
- `discipline`: catálogo de acciones contrarias a la convivencia y registro de deméritos.

### Capas internas

- `web`
- `service`
- `repository`
- `domain`
- `dto`
- `mapper`

## Endpoints implementados

### Autenticación

- `POST /api/auth/login`
  - acceso público
  - recibe credenciales
  - retorna JWT, nombre, perfil principal y permisos de sesión

### Usuarios

- `GET /api/users`
  - requiere `USER_VIEW`
  - retorna listado de usuarios

- `GET /api/users/institutions`
  - requiere `USER_VIEW`
  - retorna instituciones para formularios

- `POST /api/users`
  - requiere `USER_MANAGE`
  - crea usuario

- `PUT /api/users/{id}`
  - requiere `USER_MANAGE`
  - actualiza usuario

- `PATCH /api/users/{id}/status`
  - requiere `USER_MANAGE`
  - habilita o bloquea usuario

- `POST /api/users/{id}/reset-password`
  - requiere `USER_MANAGE`
  - restablece contraseña

### Perfiles

- `GET /api/roles`
  - requiere `ROLE_VIEW`
  - lista perfiles configurados

- `POST /api/roles`
  - requiere `ROLE_MANAGE`
  - crea perfil nuevo

- `PUT /api/roles/{roleName}`
  - requiere `ROLE_MANAGE`
  - actualiza descripción y permisos

- `DELETE /api/roles/{roleName}`
  - requiere `ROLE_MANAGE`
  - elimina un perfil si no está asignado a usuarios

### Leccionario pedagógico actual

- `GET /api/lesson-plans?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
  - requiere `LESSONPLAN_VIEW`
  - consulta registros por rango de fechas

- `POST /api/lesson-plans`
  - requiere `LESSONPLAN_MANAGE`
  - crea un registro de planificación diaria

### Gestión académica

- `GET /api/academic/overview`
  - requiere `ACADEMIC_VIEW`
  - retorna cursos, asignaturas y periodos

### Reportes

- `GET /api/reports/dashboard`
  - requiere `REPORT_VIEW`
  - retorna métricas del dashboard

- `GET /api/reports/lesson-plans/export`
  - requiere `REPORT_EXPORT`
  - actualmente retorna un placeholder de exportación

### Auditoría

- `GET /api/audit`
  - requiere `AUDIT_VIEW`
  - permite consulta por usuario o módulo

## Endpoints previstos para la siguiente fase

### Horarios

- `GET /api/schedules/blocks`
- `POST /api/schedules/blocks`
- `GET /api/schedules/courses/{courseId}`
- `POST /api/schedules/courses`
- `PUT /api/schedules/courses/{id}`

### Leccionario diario

- `GET /api/daily-logs?date=YYYY-MM-DD&courseId=...`
- `POST /api/daily-logs`
- `GET /api/daily-logs/{id}`
- `PUT /api/daily-logs/{id}`
- `POST /api/daily-logs/{id}/close`
- `POST /api/daily-logs/{id}/sign`

### Asistencia e inasistencias

- `POST /api/daily-logs/{entryId}/absences`
- `DELETE /api/daily-logs/{entryId}/absences/{studentId}`

### Convivencia y deméritos

- `GET /api/discipline/categories`
- `POST /api/discipline/categories`
- `GET /api/discipline/offenses`
- `POST /api/discipline/offenses`
- `PUT /api/discipline/offenses/{id}`
- `GET /api/discipline/demerits`
- `POST /api/discipline/demerits`
- `PUT /api/discipline/demerits/{id}/annul`

## Seguridad

- Autenticación stateless con JWT.
- Contraseñas cifradas con BCrypt.
- `JwtAuthenticationFilter` ejecutado antes del filtro estándar de autenticación.
- Reglas de autorización definidas por rutas y con anotaciones `@PreAuthorize`.
- `@EnableMethodSecurity` habilitado.
- CORS abierto por patrón para facilitar desarrollo con la SPA.
- `/api/auth/**` y `/actuator/health` son públicos.
- La UI además oculta módulos y acciones según permisos.

## Validación y manejo de errores

- Validación de entrada con `jakarta.validation`.
- Manejo global de excepciones centralizado.
- `ResourceNotFoundException` para recursos inexistentes.
- `BusinessException` para reglas de negocio como eliminación de perfiles en uso.

## Datos semilla

Al iniciar la aplicación se crean, si no existen:

- perfiles base del sistema
- una institución demo
- un usuario administrador por defecto
- un docente demo
- cursos, asignaturas y periodo académico

### Credenciales semilla

- usuario: `admin`
- contraseña: `Admin123*`

## Modelo de datos

### Tablas actuales

- `roles`
- `role_permissions`
- `institutions`
- `users`
- `user_roles`
- `academic_periods`
- `courses`
- `subjects`
- `teachers`
- `students`
- `lesson_plans`
- `evaluations`
- `logs`

### Tablas objetivo siguientes

- `schedule_blocks`
- `course_schedules`
- `daily_logs`
- `daily_log_entries`
- `daily_log_student_absences`
- `daily_log_signatures`
- `behavior_categories`
- `behavior_offenses`
- `student_demerits`

### Relaciones relevantes

- `users` pertenece a `institutions`
- `users` se relaciona con `roles` mediante `user_roles`
- `teachers` y `students` extienden funcionalmente a `users`
- `course_schedules` conecta curso, bloque, materia y docente
- `daily_logs` representa la jornada de un curso en una fecha
- `daily_log_entries` representa cada fila del leccionario por bloque
- `daily_log_student_absences` registra estudiantes inasistentes por bloque
- `daily_log_signatures` registra cierre lógico por rol
- `behavior_offenses` pertenece a categorías del catálogo disciplinario
- `student_demerits` registra incidencias disciplinarias por estudiante

## Frontend

### Organización actual

- `core`: autenticación, interceptor HTTP y guardas.
- `features/auth`
- `features/dashboard`
- `features/lesson-plans`
- `features/reports`
- `features/users`
- `features/academic`
- `features/audit`

### Organización siguiente

- `features/schedules`
- `features/daily-log`
- `features/discipline-catalog`
- `features/demerits`

### Rutas principales actuales

- `/login`
- `/app`
- `/app/lesson-plans`
- `/app/reports`
- `/app/users`
- `/app/academic`
- `/app/audit`

### Responsabilidades clave

- autenticación y persistencia del token
- protección de navegación con guard
- consumo de endpoints REST del backend
- visualización de dashboard, usuarios, leccionario y reportes
- administración de perfiles y permisos

## Configuración local

### Backend

Archivo principal:

- `backend/src/main/resources/application.yml`

Configuración actual:

- PostgreSQL en `localhost:5432`
- base `leccionario`
- puerto HTTP `1080`
- `ddl-auto=update`
- secreto JWT configurado en archivo

### Testing backend

Archivo de pruebas:

- `backend/src/test/resources/application-test.yml`

Configuración actual de pruebas:

- H2 en memoria
- `ddl-auto=create-drop`
- sin inicialización SQL externa

## Roadmap recomendado

### Iteración 1

- estabilizar perfiles dinámicos
- cerrar CRUD de usuarios y perfiles
- definir migraciones de base de datos

### Iteración 2

- implementar `schedule_blocks`
- implementar `course_schedules`
- exponer administración de horarios

### Iteración 3

- implementar `daily_logs`
- implementar `daily_log_entries`
- renderizar vista tipo leccionario físico por jornada

### Iteración 4

- agregar inasistencias por bloque
- agregar observaciones y novedades
- agregar cierre y firma lógica

### Iteración 5

- implementar catálogo disciplinario
- implementar registro de deméritos
- integrar reportes institucionales

## Estado actual y pendientes

### Implementado

- login con JWT
- estructura modular backend
- rutas principales frontend
- gestión ampliada de usuarios
- perfiles con permisos configurables
- creación y consulta de leccionario pedagógico
- dashboard de reportes
- base de auditoría

### Pendiente o parcial

- horarios institucionales
- leccionario diario por bloques horarios
- firmas de jornada
- inasistencias estructuradas
- catálogo disciplinario
- registro de deméritos
- exportación institucional definitiva a PDF y Excel
- migraciones versionadas de base de datos
