# B3-05 — Inscripciones y progreso

| Campo | Valor |
|---|---|
| Estado | cerrada |
| Fase | Fase 3 |
| Requisitos | RF-11, RF-13, RN-04, RN-08 |
| Rama | `feature/B3-05-inscripciones-y-progreso` (sin crear: el repo git aún no existe, ver F0-02) |
| Responsable | Implementada por el agente en la sesión nocturna del 2026-11-15 |

## Objetivo

Inscripciones y progreso. Criterio de aceptación de `docs/plan-backend.md`.

## Alcance de edición autorizado

- `routes/inscripcion.routes.js`, `services/inscripcion.service.js`, `services/progreso.service.js`
- `odd/tasks/B3-05-inscripciones-y-progreso.md`, `MEMORY.md`, `docs/requisitos.md`, `docs/plan-backend.md`, `docs/api-contrato.md`

## Pasos

- [x] B3-05.1 — Implementado según el plan y las reglas de `.agents/rules/backend-rules.md`.
- [x] B3-05.2 — Verificado contra `docker compose up --build` (ver evidencia).

## Progreso y evidencia

| Fecha | Qué se hizo | Evidencia (comando → resultado) |
|---|---|---|
| 2026-11-15 | Implementación y verificación | `/inscripciones/mias` con %; `/cursos/:id/progreso` propio, otro estudiante → 403 (smoke) |

## Entrega

Sin commit ni PR: el repositorio git todavía no existe (F0-02) y las reglas piden hacerlos solo cuando el usuario lo pida.

## Siguiente paso

Cerrada. Pendiente de revisión por el juez (Opus) y por el otro integrante antes del PR.
