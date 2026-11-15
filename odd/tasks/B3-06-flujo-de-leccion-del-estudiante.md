# B3-06 — Flujo de lección del estudiante

| Campo | Valor |
|---|---|
| Estado | cerrada |
| Fase | Fase 3 |
| Requisitos | RF-10, RF-12, RF-15, RN-01..RN-03, RT-B03 |
| Rama | `feature/B3-06-flujo-de-leccion-del-estudiante` (sin crear: el repo git aún no existe, ver F0-02) |
| Responsable | Implementada por el agente en la sesión nocturna del 2026-11-15 |

## Objetivo

Flujo de lección del estudiante. Criterio de aceptación de `docs/plan-backend.md`.

## Alcance de edición autorizado

- `routes/leccion.routes.js`, `middlewares/isEnrolled.middleware.js`, `lessonAccess.middleware.js`, `services/progreso.service.js`, `services/leccion.service.js`
- `odd/tasks/B3-06-flujo-de-leccion-del-estudiante.md`, `MEMORY.md`, `docs/requisitos.md`, `docs/plan-backend.md`, `docs/api-contrato.md`

## Pasos

- [x] B3-06.1 — Implementado según el plan y las reglas de `.agents/rules/backend-rules.md`.
- [x] B3-06.2 — Verificado contra `docker compose up --build` (ver evidencia).

## Progreso y evidencia

| Fecha | Qué se hizo | Evidencia (comando → resultado) |
|---|---|---|
| 2026-11-15 | Implementación y verificación | 403 LESSON_LOCKED, completar solo contenido, intentos solo cuestionario, 3 intentos máx., sin indiceCorrecto (smoke) |

## Entrega

Sin commit ni PR: el repositorio git todavía no existe (F0-02) y las reglas piden hacerlos solo cuando el usuario lo pida.

## Siguiente paso

Cerrada. Pendiente de revisión por el juez (Opus) y por el otro integrante antes del PR.
