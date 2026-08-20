# AGENTS.md - Comandos del Proyecto Leccionario

## Build & Run

### Backend (Spring Boot 3.5.14 / Java 17)
```bash
cd backend

# Compilar (requiere Maven o usar mvnw.cmd en Windows)
mvn clean compile
# o en Windows sin Maven instalado:
.\mvnw.cmd clean compile

# Ejecutar tests unitarios
mvn test
# o:
.\mvnw.cmd test

# Ejecutar tests de integración (requiere Docker)
mvn verify -P integration
# o:
.\mvnw.cmd verify -P integration

# Ejecutar la aplicación
mvn spring-boot:run
# o:
.\mvnw.cmd spring-boot:run

# Build completo con JaCoCo
mvn clean verify
# o:
.\mvnw.cmd clean verify
```

### Frontend (Angular 18)
```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar en desarrollo
ng serve

# Ejecutar tests
ng test --watch=false

# Build producción
ng build --configuration production
```

### Docker
```bash
# Levantar todo (backend + frontend + PostgreSQL)
docker compose up -d

# Solo backend
docker compose up backend -d

# Ver logs
docker compose logs -f backend
```

## Testing

### Backend
```bash
# Tests unitarios (excluye integración)
cd backend
.\mvnw.cmd test

# Tests de integración (requiere Docker para Testcontainers)
cd backend
.\mvnw.cmd verify -P integration

# Coverage JaCoCo
cd backend
.\mvnw.cmd clean verify
# Reporte en: backend/target/site/jacoco/index.html
```

### Frontend
```bash
cd frontend
ng test --watch=false --code-coverage
# Reporte en: frontend/coverage/
```

## Security

### Credenciales por defecto
- **Backend API**: http://localhost:1080
- **Frontend**: http://localhost:4200
- **PostgreSQL**: localhost:5432 (leccionario / leccionario_secret)
- **Demo login**: admin / Admin123*

### Variables de entorno requeridas
Ver `.env.example` para la lista completa.

## Code Quality

### Linting
```bash
# Frontend
cd frontend
ng lint

# Commit lint (automático con husky)
git commit -m "feat(auth): add refresh token"
```

### Convenciones de Commit
Ver `CONTRIBUTING.md` para la guía completa.
Formato: `<tipo>(<ambito>): <descripción>`

Tipos: feat, fix, docs, style, refactor, test, chore, perf, ci, build

## Architecture

### Backend Structure
```
backend/src/main/java/com/leccionario/backend/
├── config/          # CacheConfig, CachingService
├── security/        # JwtService, SecurityConfig, JwtAuthenticationFilter
├── auth/            # Login, refresh tokens, logout
├── user/            # Usuarios, roles, permisos
├── academic/        # Cursos, materias, leccionario
├── evaluation/      # Calificaciones, informes
├── attendance/      # Asistencia
├── finance/         # Facturas, matrículas
├── rrhh/            # Empleados, nómina
├── inventory/       # Activos, compras
├── communication/   # Notificaciones, eventos
├── export/          # Exportación CSV/Excel
├── sri/             # Integración SRI Ecuador
└── ai/              # ML, predicciones
```

### Key Files Modified
- `application.yml` - Config con variables de entorno
- `SecurityConfig.java` - CORS configurable, endpoints públicos
- `JwtService.java` - Access + refresh tokens
- `ExportService.java` - Queries parametrizadas (SQL injection fix)
- `CachingService.java` - Cache para roles, instituciones
- `EmailService.java` - JavaMailSender integrado

### Flyway Migrations
- Ubicación: `backend/src/main/resources/db/migration/`
- Baseline: `V1__baseline.sql` (generado desde schema_full.sql)
- `ddl-auto: validate` en producción
