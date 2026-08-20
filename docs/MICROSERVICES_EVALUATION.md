# Evaluación de Microservicios - Leccionario

> **Fecha:** 19 de agosto de 2026
> **Estado:** Evaluación inicial
> **Recomendación:** Monolito mejorado por ahora

---

## 1. Análisis de Modularidad Actual

### Módulos candidatos a extracción

| Módulo | Líneas | Dependencias | Prioridad extracción | Complejidad |
|--------|--------|--------------|:--------------------:|:-----------:|
| **Finance** | ~4,500 | Auth, Student, Enrollment | **ALTA** | Media |
| **HR/RRHH** | ~3,800 | Auth, Institution | **ALTA** | Media |
| **Inventory** | ~2,100 | Auth, Institution | **MEDIA** | Baja |
| **Library** | ~1,800 | Auth, Student | **MEDIA** | Baja |
| **Communication** | ~2,500 | Auth, Student, Teacher | **MEDIA** | Baja |
| **AI/Analytics** | ~1,200 | All academic data | **BAJA** | Alta |
| **Academic Core** | ~8,000 | Auth | **NO** | Muy Alta |

### Dependencias cruzadas identificadas

```
Finance → Student, Enrollment, AcademicPeriod
HR → Institution, User
Inventory → Institution, User
Library → Student, User
Communication → Student, Teacher, Course
AI → All academic modules
```

---

## 2. Recomendación: Monolito Mejorado

### Razones para NO extraer a microservicios todavía

1. **Tamaño del equipo**: Solo desarrolladores, sin equipo DevOps dedicado
2. **Complejidad operacional**: Kubernetes, service mesh, observabilidad
3. **Costo de infraestructura**: 6+ servicios = 6+ contenedores = más RAM/CPU
4. **Latencia**: Comunicación inter-servicio vs. llamadas locales
5. **Consistencia de datos**: Transacciones distribuidas (2PC, Saga)

### Qué hacer en su lugar

| Mejora | Impacto | Esfuerzo |
|--------|:-------:|:--------:|
| Separar por paquetes Maven bien definidos | Alto | Bajo |
| Implementar bounded contexts | Alto | Medio |
| API Gateway para rate limiting | Medio | Medio |
| CQRS para módulos de solo lectura (AI, BI) | Medio | Alto |

---

## 3. Plan de Modularidad (Monolito Mejorado)

### Estructura de paquetes propuesta

```
com.leccionario.backend/
├── shared/                    # Kernel compartido
│   ├── security/
│   ├── audit/
│   └── common/
├── academic/                  # Bounded Context Académico
│   ├── enrollment/
│   ├── grading/
│   ├── attendance/
│   ├── dailylog/
│   └── lessonplan/
├── finance/                   # Bounded Context Financiero
│   ├── invoice/
│   ├── tuition/
│   └── accounting/
├── hr/                        # Bounded Context RRHH
│   ├── employee/
│   ├── payroll/
│   └── benefits/
├── inventory/                 # Bounded Context Inventario
│   ├── assets/
│   ├── purchases/
│   └── suppliers/
└── communication/             # Bounded Context Comunicación
    ├── notifications/
    ├── messaging/
    └── events/
```

### Reglas de dependencia

1. Los bounded contexts **NO** pueden dependeer entre sí directamente
2. La comunicación entre contexts es solo a través de:
   - Eventos de dominio (Spring Events)
   - APIs internas (service interfaces compartidas)
3. El kernel compartido es la única dependencia permitida

---

## 4. Cuándo sí migrar a microservicios

### Señales de que es momento

- [ ] El equipo crece a 5+ desarrolladores
- [ ] Hay DevOps/SRE dedicado
- [ ] La carga de un módulo crece 10x (ej: Finance en una red de escuelas)
- [ ] Se necesita despliegue independiente por módulo
- [ ] Hay presupuesto para infraestructura cloud

### Módulos que primero se extraerían

1. **Finance** - Más independiente, alta carga, compliance
2. **HR** - Datos sensibles, regulación laboral
3. **AI/Analytics** - Solo lectura, alta carga computacional

---

## 5. Acciones Inmediatas (sin microservicios)

1. ✅ Definir bounded contexts en paquetes Maven
2. ✅ Eliminar dependencias cruzadas innecesarias
3. ✅ Implementar Spring Events para comunicación asíncrona
4. ✅ Documentar límites de contexto en README
5. ⏸️ Evaluar CQRS para módulos de solo lectura (Fase 5)
