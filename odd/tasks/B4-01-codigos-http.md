# B4-01 — Códigos HTTP

| Campo | Valor |
|---|---|
| Estado | cerrada |
| Fase | Fase 4 |
| Requisitos | Buenas prácticas |
| Rama | `feature/B4-01-codigos-http` (sin crear: el repo git aún no existe, ver F0-02) |
| Responsable | Implementada por el agente en la sesión nocturna del 2026-11-15 |

## Objetivo

Códigos HTTP. Criterio de aceptación de `docs/plan-backend.md`.

## Alcance de edición autorizado

- controladores de curso, lección y pregunta
- `odd/tasks/B4-01-codigos-http.md`, `MEMORY.md`, `docs/requisitos.md`, `docs/plan-backend.md`, `docs/api-contrato.md`

## Pasos

- [x] B4-01.1 — Implementado según el plan y las reglas de `.agents/rules/backend-rules.md`.
- [x] B4-01.2 — Verificado contra `docker compose up --build` (ver evidencia).

## Progreso y evidencia

| Fecha | Qué se hizo | Evidencia (comando → resultado) |
|---|---|---|
| 2026-11-15 | Implementación y verificación | DELETE → 204; intentos → 201; 403/404/409/422 revisados (smoke) |

## Entrega

Sin commit ni PR: el repositorio git todavía no existe (F0-02) y las reglas piden hacerlos solo cuando el usuario lo pida.

## Siguiente paso

Cerrada. Pendiente de revisión por el juez (Opus) y por el otro integrante antes del PR.
