# B1-02 — Secretos fuera del repositorio

| Campo | Valor |
|---|---|
| Estado | cerrada |
| Fase | Fase 1 |
| Requisitos | RT-B07 |
| Rama | `feature/B1-02-secretos-fuera-del-repositorio` (sin crear: el repo git aún no existe, ver F0-02) |
| Responsable | Implementada por el agente en la sesión nocturna del 2026-11-15 |

## Objetivo

Secretos fuera del repositorio. Criterio de aceptación de `docs/plan-backend.md`.

## Alcance de edición autorizado

- `docker-compose.yml`, `.env.example` (raíz y api), `README.md`
- `odd/tasks/B1-02-secretos-fuera-del-repositorio.md`, `MEMORY.md`, `docs/requisitos.md`, `docs/plan-backend.md`, `docs/api-contrato.md`

## Pasos

- [x] B1-02.1 — Implementado según el plan y las reglas de `.agents/rules/backend-rules.md`.
- [x] B1-02.2 — Verificado contra `docker compose up --build` (ver evidencia).

## Progreso y evidencia

| Fecha | Qué se hizo | Evidencia (comando → resultado) |
|---|---|---|
| 2026-11-15 | Implementación y verificación | compose con `${VAR:-valor_dev}`; sin secretos reales versionados |

## Entrega

Sin commit ni PR: el repositorio git todavía no existe (F0-02) y las reglas piden hacerlos solo cuando el usuario lo pida.

## Siguiente paso

Cerrada. Pendiente de revisión por el juez (Opus) y por el otro integrante antes del PR.
