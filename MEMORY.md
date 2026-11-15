# MEMORY.md — Estado vivo del proyecto MiniAula

> Se lee **al empezar** cada sesión y se actualiza **al terminar** cada tarea.
> Solo estado y decisiones; las reglas están en `AGENTS.md` y el detalle de tareas en `docs/plan-backend.md`.
> **Máximo 150 líneas.** Si se pasa, resumir la bitácora antigua en una línea por fase (el detalle queda en `odd/tasks/`).

## Ahora mismo

| Campo | Valor |
|---|---|
| Fase | **Backend completo (Fases 1–5)**; falta repo git, frontend y entrega |
| Última tarea cerrada | B5-02 — README (2026-11-15); todas las B1–B5 cerradas (`odd/tasks/`) |
| Tarea en curso | — |
| **Siguiente tarea** | **Revisión del juez (Opus) del diff de B1–B5** y luego **F0-02 — Repositorio git** → `odd/tasks/F0-02-repositorio-git.md` (necesita datos del usuario) |
| Después | F0-03 (mover el frontend a `web/`) y Lotes 5–7 del plan por lotes (adaptar el frontend a las rutas nuevas) |
| Bloqueos | F0-02 y F0-03 esperan decisiones del usuario (ver "Pendientes de decisión") |
| Avance de requisitos | Backend: 16/16 RF (RF-02 con logout documentado), 8/8 RN y 12/12 RT-B en ✅ (ver `docs/requisitos.md`) |

## Protocolo de sesión

Automatizado con las skills de `.claude/skills/` (detalle en `AGENTS.md` §8): `/siguiente-tarea`, `/cerrar-tarea`, `/estado-proyecto`.
Sin skills: leer este archivo → archivo de la tarea y su "Siguiente paso" → `AGENTS.md` de las carpetas del alcance → trabajar →
actualizar lo mismo que hace `cerrar-tarea`.

## Datos del proyecto

- Enunciado: PDF "Proyecto final — Ingeniería Web 2" (copia del usuario en `Downloads`). Resumen por código en `docs/requisitos.md`.
- Evaluación: 100 pts (60 pareja / 40 individual). Si no levanta con Docker en la defensa, "Funcionalidad" vale la mitad.
- Modalidad: parejas; ambos integrantes deben tocar backend y frontend. Integrantes: **Alejandro** y **Luis**.
- Plan por lotes (0–8) y flujo de PRs: `Plan-MiniAula-por-lotes.md` (Descargas de Alejandro, **no** copiarlo al repo).
- Duración: 4 semanas. Fecha de inicio y de entrega: _(pendiente de anotar)_.
- Referente de clase: repo `ing-web-2-2026-2` (en `Downloads`), carpetas `expressapi` y `practicareact`.
- Frontend actual: `../frontend_miniAula` (fuera de este repo; **consume las rutas antiguas** y ya no funciona contra esta API).
- Docker: si el 3306 está ocupado, `DB_HOST_PORT=3307 docker compose up --build` (variable del compose).

## Decisiones tomadas

| Fecha | Decisión | Dónde |
|---|---|---|
| 2026-11-14 | Express 5 + ESM; arquitectura por capas; rutas según el PDF | ADR-01..03 |
| 2026-11-15 | Estructura multi-agente `.agents/` (rules + roles planner/coder/judge) | F0-01 |
| 2026-11-15 | Migraciones con **Umzug** (carga con `import()`); sin `sync()` | ADR-04, B1-04 |
| 2026-11-15 | `req.validated` + reescritura de `req.body`/`req.params` | ADR-05, B2-01 |
| 2026-11-15 | `GET /lecciones/:id` para estudiante inscrito o instructor dueño (`lessonAccess`) | ADR-07, B3-06 |
| 2026-11-15 | Detalle de curso con sesión opcional; DELETE → 204; intentos → 201 | ADR-10, B3-02 |
| 2026-11-15 | Reglas añadidas: sin publicar con cuestionario vacío; sin borrar la última lección/pregunta de un curso publicado | ADR-12 |
| 2026-11-15 | Compose con `${VAR:-valor_dev}`; rate limit solo cuenta fallos; CORS por `CORS_ORIGIN` | B1-02, B1-03, B2-02 |

## Pendientes de decisión (preguntar al usuario)

- [ ] Nombre del repositorio en GitHub y cuenta de los dos integrantes (F0-02).
- [ ] Mover `../frontend_miniAula` a `web/` o recrearlo dentro del repo (F0-03).
- [ ] Confirmar las decisiones que tomó el agente por defecto: Umzug, 204 en DELETE, acceso del instructor a `GET /lecciones/:id`,
      reglas añadidas (ADR-12) y 3 intentos agotados = curso bloqueado.
- [ ] Fechas de inicio y entrega; qué documentación de trabajo se versiona (`docs/plan-backend.md`, `docs/prompt-agente.md`).

## Problemas conocidos (no olvidar)

- El frontend (`../frontend_miniAula`) usa rutas antiguas y `search` en vez de `q`: se adapta en los Lotes 5–7.
- `HANDOFF_FRONTEND.md` describe rutas antiguas; no usarlo como contrato (el contrato es `docs/api-contrato.md`).
- Sin repositorio git: nada está versionado ni hay ramas/PR todavía.
- Sin pruebas unitarias; solo `npm run smoke` (8 pruebas contra la API en Docker). Las rutas de error de `PUT` completos
  del frontend no se han probado con el navegador.
- Discrepancias documentación ↔ código (se siguió el código): ver sección siguiente.

## Discrepancias documentación ↔ código detectadas (2026-11-15)

- `AGENTS.md`/`routes/AGENTS.md` ponen `schemaValidate` antes de `getObjectOr404`; el código existente valida el **body** después de
  `ownsCourse`. Se mantuvo el orden del código y se añadió la validación de **params** al inicio (exige RT-B04).
- `controllers/AGENTS.md` pide `(req, res)` y usar siempre `req.object.id`; el código usa `(req, res, next)` y a veces `req.params`.
  Se mantuvo la firma `(req, res, next)`; los controladores nuevos usan `req.object`.
- `README.md` antiguo hablaba de "3 capas" y copiaba `../.env.example` a `api/.env`; las demás docs hablan de 5 capas y de `api/.env.example`.
- `schemas/AGENTS.md` pide `.strict()` en todos los bodies; `auth.schema.js` no lo usa (no se tocó: fuera del plan).
- `HANDOFF_FRONTEND.md` y las colecciones Postman antiguas describían rutas que ya no existen.

## Bitácora

| Fecha | Tarea | Resultado |
|---|---|---|
| 2026-11-14 | Análisis y F0-01 | Escaneo del backend y del repo de la materia; documentación de trabajo, `odd/`, skills |
| 2026-11-15 | F0-01 / Planificación | `.agents/` con rules y roles; plan por lotes (0–8) guardado en Descargas |
| 2026-11-15 | Lote 1 (B1-01..05) | Lockfile, Dockerfile con `USER node`, compose sin secretos, CORS, migraciones Umzug y seed conforme al PDF. Verificado con Docker |
| 2026-11-15 | Lote 2 (B2-01..04) | Validación de params/query, errores completos, constantes y utils, Swagger por recurso |
| 2026-11-15 | Lote 3 (B3-01..06) | Rutas alineadas al PDF (25 filas ✅), `lessonAccess`, `optionalUser`, transacciones y recálculo de `completado` |
| 2026-11-15 | Lote 4 y B5 | DELETE 204, `panel.service` dividido, `npm run smoke` (8/8), Postman regenerado, README final |
| 2026-11-15 | Revisión propia | Fallo corregido: `q=%` devolvía todo el catálogo (comodines LIKE sin escapar → `utils/search.js`); smoke ampliado, 8/8 |
