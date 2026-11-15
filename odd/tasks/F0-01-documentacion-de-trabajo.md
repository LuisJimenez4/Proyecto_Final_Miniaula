# F0-01 — Documentación de trabajo

| Campo | Valor |
|---|---|
| Estado | cerrada |
| Fase | Fase 0 — Base del proyecto |
| Requisitos | Soporte para todos (trazabilidad); "Arquitectura y calidad del backend" |
| Rama | — (aún no hay git; ver F0-02) |
| Responsable | — |

## Objetivo

Que cualquier agente o integrante sepa en todo momento en qué estado está el proyecto, qué reglas seguir
por capa y cuál es la siguiente tarea.

## Problema y motivo

El backend existía sin documentación de trabajo, con rutas que no coinciden con el PDF y sin plan.
Sin esto, cada sesión empezaba desde cero.

## Alcance y restricciones

- Solo documentación; **sin cambios en el código** de `api/`.
- Adoptar lo que usa el docente (`agents.md`, `odd/tasks/`) adaptado a un monorepo con Claude Code.

## Alcance de edición autorizado

- `AGENTS.md`, `CLAUDE.md`, `MEMORY.md`
- `api/AGENTS.md`, `api/src/*/AGENTS.md`
- `docs/*.md`, `odd/**`, `.claude/skills/**`

## Pasos

- [x] F0-01.1 — Leer el PDF y contrastarlo con el código (requisitos, contrato).
- [x] F0-01.2 — Definir arquitectura objetivo y decisiones (ADR).
- [x] F0-01.3 — Plan de tareas por fases con criterios de aceptación.
- [x] F0-01.4 — `AGENTS.md` raíz, de `api/` y de cada capa; `MEMORY.md`; `CLAUDE.md`.
- [x] F0-01.5 — Revisar el sistema del docente (`.atl`, `odd/tasks`, `agents.md`) y adoptar documentos de tarea + skills.

## Criterios de aceptación

- Leyendo `CLAUDE.md` → `AGENTS.md` → `MEMORY.md` se sabe la siguiente tarea y dónde está su detalle.
- Existe un comando (`/siguiente-tarea`) que retoma el trabajo sin instrucciones adicionales.
- Ningún archivo de código modificado.

## Verificaciones

- Enlaces relativos de todos los `.md` apuntan a archivos existentes.
- Finales de línea LF (`.editorconfig`).

## Decisiones

- No se copia `.atl/skill-registry.md` del docente: lo genera la herramienta gentle-ai en su máquina y
  apunta a rutas de su usuario (`C:\Users\jmacb\...`). El equivalente portable son las skills del proyecto
  en `.claude/skills/`, listadas en `AGENTS.md` §8.
- Documentos de tarea en `odd/tasks/` en la raíz (no por proyecto) porque el repo es un monorepo.
- `CLAUDE.md` importa `AGENTS.md` en lugar de duplicarlo (el docente duplica el contenido en el examen).

## Progreso y evidencia

| Fecha | Qué se hizo | Evidencia (comando → resultado) |
|---|---|---|
| 2026-11-14 | `docs/` (requisitos, contrato, arquitectura, plan), 10 `AGENTS.md`, `MEMORY.md`, `CLAUDE.md` | Script de enlaces → 0 rotos; `file` → todos LF |
| 2026-11-14 | `odd/` (README, PLANTILLA, tareas F0-01, F0-02, B1-01) y skills `siguiente-tarea`, `cerrar-tarea`, `estado-proyecto` | Ver verificación final de la sesión |

## Entrega

Sin commit: el repositorio aún no existe (F0-02).

## Siguiente paso

Cerrada. Continuar con [F0-02](F0-02-repositorio-git.md).
