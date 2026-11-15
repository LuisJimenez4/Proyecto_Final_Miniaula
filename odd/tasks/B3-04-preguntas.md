# B3-04 — Preguntas

| Campo | Valor |
|---|---|
| Estado | cerrada |
| Fase | Fase 3 |
| Requisitos | RF-14, RN-02 |
| Rama | `feature/B3-04-preguntas` (sin crear: el repo git aún no existe, ver F0-02) |
| Responsable | Implementada por el agente en la sesión nocturna del 2026-11-15 |

## Objetivo

Preguntas. Criterio de aceptación de `docs/plan-backend.md`.

## Alcance de edición autorizado

- `routes/pregunta.routes.js`, `services/pregunta.service.js`, `schemas/pregunta.schema.js`
- `odd/tasks/B3-04-preguntas.md`, `MEMORY.md`, `docs/requisitos.md`, `docs/plan-backend.md`, `docs/api-contrato.md`

## Pasos

- [x] B3-04.1 — Implementado según el plan y las reglas de `.agents/rules/backend-rules.md`.
- [x] B3-04.2 — Verificado contra `docker compose up --build` (ver evidencia).

## Progreso y evidencia

| Fecha | Qué se hizo | Evidencia (comando → resultado) |
|---|---|---|
| 2026-11-15 | Implementación y verificación | solo en cuestionarios (422); indiceCorrecto validado en PUT (400); 204 al borrar (smoke) |

## Entrega

Sin commit ni PR: el repositorio git todavía no existe (F0-02) y las reglas piden hacerlos solo cuando el usuario lo pida.

## Siguiente paso

Cerrada. Pendiente de revisión por el juez (Opus) y por el otro integrante antes del PR.
