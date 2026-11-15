# B2-01 — Validación de params y query

| Campo | Valor |
|---|---|
| Estado | cerrada |
| Fase | Fase 2 |
| Requisitos | RT-B04, RT-B09 |
| Rama | `feature/B2-01-validacion-de-params-y-query` (sin crear: el repo git aún no existe, ver F0-02) |
| Responsable | Implementada por el agente en la sesión nocturna del 2026-11-15 |

## Objetivo

Validación de params y query. Criterio de aceptación de `docs/plan-backend.md`.

## Alcance de edición autorizado

- `middlewares/schemaValidate.middleware.js`, `schemas/common.schema.js`
- `odd/tasks/B2-01-validacion-de-params-y-query.md`, `MEMORY.md`, `docs/requisitos.md`, `docs/plan-backend.md`, `docs/api-contrato.md`

## Pasos

- [x] B2-01.1 — Implementado según el plan y las reglas de `.agents/rules/backend-rules.md`.
- [x] B2-01.2 — Verificado contra `docker compose up --build` (ver evidencia).

## Progreso y evidencia

| Fecha | Qué se hizo | Evidencia (comando → resultado) |
|---|---|---|
| 2026-11-15 | Implementación y verificación | `/cursos?limit=abc` → 400; `/cursos/abc` → 400 (smoke) |

## Entrega

Sin commit ni PR: el repositorio git todavía no existe (F0-02) y las reglas piden hacerlos solo cuando el usuario lo pida.

## Siguiente paso

Cerrada. Pendiente de revisión por el juez (Opus) y por el otro integrante antes del PR.
