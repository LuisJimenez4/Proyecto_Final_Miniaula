# B3-02 — Cursos

| Campo | Valor |
|---|---|
| Estado | cerrada |
| Fase | Fase 3 |
| Requisitos | RF-04..RF-07, RN-05, RN-06 |
| Rama | `feature/B3-02-cursos` (sin crear: el repo git aún no existe, ver F0-02) |
| Responsable | Implementada por el agente en la sesión nocturna del 2026-11-15 |

## Objetivo

Cursos. Criterio de aceptación de `docs/plan-backend.md`.

## Alcance de edición autorizado

- `routes/curso.routes.js`, `controllers/curso.controller.js`, `services/curso.service.js`, `schemas/curso.schema.js`, `middlewares/optionalUser.middleware.js`
- `odd/tasks/B3-02-cursos.md`, `MEMORY.md`, `docs/requisitos.md`, `docs/plan-backend.md`, `docs/api-contrato.md`

## Pasos

- [x] B3-02.1 — Implementado según el plan y las reglas de `.agents/rules/backend-rules.md`.
- [x] B3-02.2 — Verificado contra `docker compose up --build` (ver evidencia).

## Progreso y evidencia

| Fecha | Qué se hizo | Evidencia (comando → resultado) |
|---|---|---|
| 2026-11-15 | Implementación y verificación | catálogo con q/page/limit; detalle sin contenido; CRUD y estado con 422/409 (smoke) |

## Entrega

Sin commit ni PR: el repositorio git todavía no existe (F0-02) y las reglas piden hacerlos solo cuando el usuario lo pida.

## Siguiente paso

Cerrada. Pendiente de revisión por el juez (Opus) y por el otro integrante antes del PR.
