# B1-04 — Migraciones versionadas (Umzug)

| Campo | Valor |
|---|---|
| Estado | cerrada |
| Fase | Fase 1 |
| Requisitos | RT-B08 |
| Rama | `feature/B1-04-migraciones-versionadas-umzug` (sin crear: el repo git aún no existe, ver F0-02) |
| Responsable | Implementada por el agente en la sesión nocturna del 2026-11-15 |

## Objetivo

Migraciones versionadas (Umzug). Criterio de aceptación de `docs/plan-backend.md`.

## Alcance de edición autorizado

- `database/migrate.js`, `database/migrations/202611160900-crear-tablas-base.js`, `package.json`
- `odd/tasks/B1-04-migraciones-versionadas-umzug.md`, `MEMORY.md`, `docs/requisitos.md`, `docs/plan-backend.md`, `docs/api-contrato.md`

## Pasos

- [x] B1-04.1 — Implementado según el plan y las reglas de `.agents/rules/backend-rules.md`.
- [x] B1-04.2 — Verificado contra `docker compose up --build` (ver evidencia).

## Progreso y evidencia

| Fecha | Qué se hizo | Evidencia (comando → resultado) |
|---|---|---|
| 2026-11-15 | Implementación y verificación | 6 tablas con FKs e índices únicos; reejecutar no falla (SequelizeMeta con 1 fila); sin `sync()` |

## Entrega

Sin commit ni PR: el repositorio git todavía no existe (F0-02) y las reglas piden hacerlos solo cuando el usuario lo pida.

## Siguiente paso

Cerrada. Pendiente de revisión por el juez (Opus) y por el otro integrante antes del PR.
