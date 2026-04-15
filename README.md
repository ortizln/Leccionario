# Leccionario Estudiantil Digital

Sistema full-stack para la gestión del leccionario estudiantil digital, orientado al contexto institucional ecuatoriano y alineado con lineamientos de planificación, seguimiento académico y control interno.

## Estructura del proyecto

- `backend/`: API REST con Spring Boot, seguridad JWT, JPA y PostgreSQL.
- `frontend/`: SPA Angular para autenticación, dashboard, usuarios, leccionario, reportes y auditoría.
- `docs/`: arquitectura, documentación técnica, justificación legal y esquema SQL.

## Arquitectura

- estilo principal: monolito modular
- backend organizado por dominios funcionales
- frontend organizado por áreas funcionales
- autenticación stateless con JWT
- persistencia relacional en PostgreSQL

## Módulos backend

- `auth`
- `security`
- `user`
- `institution`
- `academic`
- `lessonplan`
- `evaluation`
- `report`
- `audit`
- `common`
- `config`

## Módulos frontend

- `core`
- `features/auth`
- `features/dashboard`
- `features/lesson-plans`
- `features/reports`
- `features/users`
- `features/academic`
- `features/audit`

## Requisitos previos

- Java 17
- Maven 3.9 o compatible
- Node.js 20 o compatible
- npm
- PostgreSQL 14 o compatible

## Configuración local

### Backend

1. Crear una base de datos PostgreSQL llamada `leccionario_db`.
2. Revisar `backend/src/main/resources/application.yml`.
3. Ajustar usuario, contraseña, puerto o secreto JWT según el entorno local.
4. Desde `backend/`, ejecutar `mvn spring-boot:run`.

Configuración actual relevante:

- puerto backend: `1080`
- URL de base de datos: `jdbc:postgresql://localhost:5432/leccionario_db`

Datos semilla generados al arranque:

- institución demo
- roles base
- usuario administrador por defecto

Credenciales iniciales:

- usuario: `admin`
- contraseña: `Admin123*`

### Frontend

1. Desde `frontend/`, ejecutar `npm install`.
2. Iniciar la aplicación con `npm start`.

## Funcionalidades disponibles actualmente

- login con JWT
- dashboard inicial
- consulta y registro de leccionarios
- gestión básica de usuarios
- vistas de reportes
- vistas de gestión académica
- vista de auditoría

## Endpoints principales

- `POST /api/auth/login`
- `GET /api/users`
- `POST /api/users`
- `GET /api/lesson-plans`
- `POST /api/lesson-plans`
- `GET /api/reports/dashboard`
- `GET /api/reports/lesson-plans/export`

## Estado del proyecto

El proyecto cuenta con estructura funcional de backend y frontend, documentación base, datos semilla y un esquema SQL inicial. Algunas capacidades todavía están en estado parcial, especialmente exportaciones de reportes, endurecimiento de configuración para producción y consolidación de reglas de negocio por módulo.

## Documentación relacionada

- [`docs/architecture.md`](docs/architecture.md)
- [`docs/technical-documentation.md`](docs/technical-documentation.md)
- [`docs/legal-justification.md`](docs/legal-justification.md)
- [`docs/sql/schema.sql`](docs/sql/schema.sql)
