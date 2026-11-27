# AGENTS.md — MiniAula (monorepo)

Instrucciones para cualquier persona o agente IA que trabaje en este repositorio.
Proyecto final de Ingeniería Web 2: mini LMS con **API REST (Express) en `api/`** y **SPA React en `web/`**.
Se evalúa sobre 100 puntos contra el PDF del proyecto; cada requisito tiene un código (RF, RN, RT-B, RT-F).

## 0. Redirección a reglas específicas y roles

| Si vas a… | Lee primero |
|---|---|
| Tocar `api/` | [`.agents/rules/backend-rules.md`](.agents/rules/backend-rules.md) + `AGENTS.md` de la capa |
| Tocar `web/` | [`.agents/rules/frontend-rules.md`](.agents/rules/frontend-rules.md) |
| Planificar (rol estratega, Opus/Fable) | [`.agents/roles/planner.md`](.agents/roles/planner.md) |
| Implementar (rol ingeniero, Sonnet) | [`.agents/roles/coder.md`](.agents/roles/coder.md) |
| Verificar (rol juez adversarial, Opus) | [`.agents/roles/judge.md`](.agents/roles/judge.md) |
| Ver el flujo planner → coder → judge | [`.agents/roles/README.md`](.agents/roles/README.md) |

Todos los archivos de `.agents/` y `MEMORY.md` tienen **máximo 150 líneas**.

## 1. Antes de empezar cualquier tarea

1. Leer [`MEMORY.md`](MEMORY.md): fase actual, tarea en curso, **siguiente tarea** y el archivo donde está.
2. Abrir el documento de la tarea en [`odd/tasks/`](odd/README.md) y leer su **"Siguiente paso"**,
   el alcance de edición autorizado y los criterios de aceptación. Si no existe, crearlo desde
   [`odd/PLANTILLA.md`](odd/PLANTILLA.md) con los datos de [`docs/plan-backend.md`](docs/plan-backend.md).
3. Leer el `AGENTS.md` de cada carpeta que se vaya a tocar (ver mapa en §6).
4. Si la tarea necesita una decisión que no está en `MEMORY.md` ni en `docs/arquitectura.md`, preguntar al usuario.

Con Claude Code todo esto lo hace la skill `/siguiente-tarea` (ver §8).

## 2. Orden de autoridad cuando algo no coincide

1. PDF del proyecto (resumido por código en [`docs/requisitos.md`](docs/requisitos.md) y [`docs/api-contrato.md`](docs/api-contrato.md)).
2. Decisiones registradas en [`docs/arquitectura.md`](docs/arquitectura.md).
3. Convenciones del código existente.
4. Repositorio de referencia de la materia (`ing-web-2-2026-2`, carpetas `expressapi` y `practicareact`).

Si la documentación y el código discrepan, seguir el código salvo que contradiga al PDF,
y **anotar la discrepancia** en el informe final de la tarea.

## 3. Al terminar una tarea (Definition of Done)

- [ ] Cumple el criterio de aceptación de `docs/plan-backend.md`.
- [ ] Respeta las reglas de la capa (`AGENTS.md` de la carpeta).
- [ ] Verificado: la API arranca y el endpoint responde (curl/Postman/smoke); lo no verificado se dice explícitamente.
- [ ] `docs/requisitos.md` y `docs/api-contrato.md` actualizados si cambió el estado de algún código.
- [ ] Swagger (`api/src/docs/swagger.js`) y Postman actualizados si cambió un endpoint.
- [ ] Documento de la tarea (`odd/tasks/<ID>-*.md`): pasos `[x]`, evidencia real, estado `cerrada`, "Siguiente paso".
- [ ] `MEMORY.md`: tarea marcada, siguiente tarea apuntada (con su archivo preparado), línea en la bitácora.
- [ ] Commit en la rama de la tarea (solo si el usuario lo pidió).

Con Claude Code: skill `/cerrar-tarea`.

## 4. Reglas globales

- **Idioma:** documentación, mensajes de error y textos de UI en español. Código: dominio en español
  (`curso`, `leccion`), funciones de servicio en inglés (`getPublishedCourses`), como ya está.
- **Módulos ES** (`import/export`) en todo el proyecto. Nada de `require`.
- **Sin secretos en el repo:** `.env` nunca se versiona ni se lee para mostrarlo; solo `.env.example` con valores de ejemplo.
- **Sin dependencias nuevas** salvo que la tarea lo justifique; si se añade una, explicar por qué y actualizar el lockfile.
- **Cambios acotados:** solo los archivos de la tarea. No reformatear ni "limpiar" código ajeno a la tarea.
- **Funciones cortas, una responsabilidad, sin duplicar lógica** (se evalúa tanto como la funcionalidad).
- **Docker es la forma oficial de ejecutar:** todo debe levantar con `docker compose up --build` y nada más.
- No borrar datos (`sync({force:true})`, `DROP`) fuera del seed y sin avisar.

## 5. Git y entrega

- Rama principal `main`; una rama por tarea: `feature/<ID>-<slug>` (ej. `feature/B3-02-cursos`).
- Commits pequeños en español con prefijo: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:` + ID de tarea.
  Ej.: `feat(B3-02): mover CRUD de cursos a /cursos según el PDF`.
- Cada tarea entra por Pull Request revisado por el otro integrante (la contribución en Git puntúa).
- Commits, push y PR solo cuando el usuario lo pida.

## 6. Mapa de AGENTS.md

| Carpeta | Contenido |
|---|---|
| [`api/AGENTS.md`](api/AGENTS.md) | Stack, comandos, variables de entorno y flujo de la API |
| [`api/src/routes/AGENTS.md`](api/src/routes/AGENTS.md) | Definición de endpoints y orden de middlewares |
| [`api/src/middlewares/AGENTS.md`](api/src/middlewares/AGENTS.md) | Autenticación, permisos, validación y errores |
| [`api/src/schemas/AGENTS.md`](api/src/schemas/AGENTS.md) | Esquemas Zod de body, params y query |
| [`api/src/controllers/AGENTS.md`](api/src/controllers/AGENTS.md) | Capa HTTP |
| [`api/src/services/AGENTS.md`](api/src/services/AGENTS.md) | Reglas de negocio y consultas |
| [`api/src/models/AGENTS.md`](api/src/models/AGENTS.md) | Modelos Sequelize y asociaciones |
| [`api/src/database/AGENTS.md`](api/src/database/AGENTS.md) | Migraciones y seed |
| [`api/src/docs/AGENTS.md`](api/src/docs/AGENTS.md) | Swagger / OpenAPI |
| `web/AGENTS.md` | Frontend (se crea en la tarea F0-03) |

## 7. Documentos de apoyo

| Documento | Para qué |
|---|---|
| [`MEMORY.md`](MEMORY.md) | Estado vivo del proyecto y siguiente paso |
| [`odd/`](odd/README.md) | Un documento por tarea (alcance, criterios, evidencia, siguiente paso) |
| [`docs/requisitos.md`](docs/requisitos.md) | Estado de cada RF / RN / RT |
| [`docs/api-contrato.md`](docs/api-contrato.md) | Endpoints obligatorios vs. implementados |
| [`docs/arquitectura.md`](docs/arquitectura.md) | Estructura, flujo de petición y decisiones (ADR) |
| [`docs/plan-backend.md`](docs/plan-backend.md) | Tareas en orden con criterios de aceptación |
| `HANDOFF_FRONTEND.md` | Guía antigua para el frontend; sus rutas están desactualizadas respecto al PDF |

## 8. Skills del proyecto (registro)

Viven en `.claude/skills/<nombre>/SKILL.md` y se versionan con el repo, así los dos integrantes tienen las mismas.
Claude Code las detecta solo; otros agentes pueden leer el `SKILL.md` y seguir sus pasos.

| Skill | Se activa con | Qué hace | Modifica archivos |
|---|---|---|---|
| [`siguiente-tarea`](.claude/skills/siguiente-tarea/SKILL.md) | "qué sigue", "continuemos", `/siguiente-tarea [ID]` | Se ubica en `MEMORY.md`, prepara o retoma `odd/tasks/<ID>.md`, presenta y ejecuta la tarea | Sí (los del alcance) |
| [`cerrar-tarea`](.claude/skills/cerrar-tarea/SKILL.md) | "cierra la tarea", `/cerrar-tarea` | Definition of Done, trazabilidad completa y prepara la siguiente | Sí (docs y MEMORY) |
| [`estado-proyecto`](.claude/skills/estado-proyecto/SKILL.md) | "en qué vamos", `/estado-proyecto` | Informe de avance y bloqueos | No |

Skill nueva → carpeta en `.claude/skills/`, `SKILL.md` con `name` y `description` (cuándo usarla), y fila en esta tabla.
Ideas para alimentar más adelante: `nuevo-endpoint` (checklist ruta → schema → controller → service → Swagger/Postman),
`revisar-requisito` (verificar un RF/RN contra la API en marcha), `preparar-defensa`.
