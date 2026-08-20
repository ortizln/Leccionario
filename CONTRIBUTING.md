# Convenciones de Commits - Leccionario

Este proyecto sigue el estándar [Conventional Commits](https://www.conventionalcommits.org/).

## Formato

```
<tipo>(<ambito>): <descripción corta>

[corpo del commit opcional]

[footer opcional]
```

## Tipos

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `feat` | Nueva funcionalidad | `feat(auth): add refresh token endpoint` |
| `fix` | Corrección de bug | `fix(export): parameterize SQL queries` |
| `docs` | Documentación | `docs: update ANALISIS_SISTEMA.md` |
| `style` | Formato (no afecta lógica) | `style: fix indentation in SecurityConfig` |
| `refactor` | Refactorización (sin cambio funcional) | `refactor(user): extract UserService methods` |
| `test` | Tests | `test(security): add JwtService tests` |
| `chore` | Tareas de mantenimiento | `chore: add Flyway dependency` |
| `perf` | Mejora de performance | `perf: add @Cacheable for roles` |
| `ci` | Integración continua | `ci: add JaCoCo coverage` |
| `build` | Build system | `build: update Maven plugins` |

## Ámbitos comunes

- `auth` - Autenticación y autorización
- `user` - Gestión de usuarios
- `academic` - Módulo académico
- `evaluation` - Calificaciones
- `attendance` - Asistencia
- `finance` - Finanzas
- `hr` / `rrhh` - Recursos humanos
- `security` - Seguridad
- `export` - Exportación
- `communication` - Comunicación

## Ejemplos

```bash
# Feature
git commit -m "feat(evaluation): add bulk grade import endpoint"

# Bug fix
git commit -m "fix(attendance): correct N+1 query in course attendance"

# Breaking change
git commit -m "feat(auth)!: change JWT token format

BREAKING CHANGE: JWT tokens now use refresh tokens instead of long-lived access tokens"
```

## Reglas

1. **Siempre** usar inglés para los mensajes de commit
2. **Máximo** 72 caracteres en la primera línea
3. **Separar** subject del corpo con línea en blanco
4. **Usar** imperativo en el subject ("add" no "added")
5. **No** terminar el subject con punto
6. **Referenciar** issues con `Closes #123` en el footer
