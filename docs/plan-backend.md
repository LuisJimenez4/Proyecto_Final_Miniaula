# Plan de trabajo — Backend MiniAula (prioridad)

Hoja de ruta: las tareas se hacen **en orden**. Este archivo da el resumen; el detalle de cada tarea
(alcance autorizado, pasos, evidencia y siguiente paso) vive en `odd/tasks/<ID>-<slug>.md`
(ver [odd/README.md](../odd/README.md)). La tarea en curso y la siguiente se anotan en `MEMORY.md`.
Al cerrar una tarea (skill `/cerrar-tarea`): marcar `[x]`, actualizar [requisitos.md](requisitos.md) y
[api-contrato.md](api-contrato.md) si aplica, y registrar en la bitácora de `MEMORY.md`.

Formato de cada tarea: **ID — título** · requisitos que cubre · archivos · criterio de aceptación (CA).
Rama sugerida: `feature/<ID>-<slug>` (p. ej. `feature/B1-01-dockerfile`).

---

## Fase 0 — Base del proyecto

- [x] **F0-01 — Documentación de trabajo** · AGENTS.md por capa, MEMORY.md, CLAUDE.md, `docs/`, `odd/`, skills.
  CA: un agente nuevo sabe qué hacer leyendo `CLAUDE.md` → `AGENTS.md` → `MEMORY.md`, o con `/siguiente-tarea`.
- [ ] **F0-02 — Repositorio git y GitHub** · Entrega, "Contribución en Git" (5 pts).
  Archivos: `.gitignore` (añadir `data/`, `coverage/`), repo remoto.
  CA: `git init`, commit inicial en `main`, remoto en GitHub, ambos integrantes con acceso,
  ramas `feature/*` y PR para cada tarea. **Requiere al usuario** (cuenta y nombre del repo).
- [ ] **F0-03 — Monorepo `api/` + `web/`** · Entrega.
  CA: el frontend vive en `web/` dentro de este repo (hoy está en `../frontend_miniAula`).
  **Requiere decisión del usuario** sobre mover o recrear el frontend.

## Fase 1 — Infraestructura que bloquea la defensa

- [x] **B1-01 — Dockerfile de la API funcional** · RT-B11.
  Archivos: `api/package-lock.json` (generar con `npm install`), `api/Dockerfile`, `api/.dockerignore`.
  CA: `docker compose up --build` levanta `db` y `api`; `GET /api/health` responde 200.
- [x] **B1-02 — Secretos fuera del repositorio** · RT-B07, buena práctica "ningún secreto".
  Archivos: `docker-compose.yml` (usar `${VAR}` / `env_file`), `.env.example` raíz, `api/.env.example`, `README.md`.
  CA: ningún `JWT_SECRET` ni contraseña real en archivos versionados; README explica cómo crear `.env`.
- [x] **B1-03 — CORS con el origen del frontend** · RT-B06.
  Archivos: `src/config/env.config.js` (`CORS_ORIGIN`), `src/app.js`.
  CA: solo `http://localhost:5173` (configurable) recibe cabeceras CORS.
- [x] **B1-04 — Migraciones versionadas** · RT-B08, ADR-04.
  Archivos: `src/database/migrations/*`, `src/database/migrate.js`, `package.json`.
  CA: `npm run migrate` crea las 6 tablas con FKs e índices únicos; se puede ejecutar dos veces sin error;
  no queda `sync()` en el arranque.
- [x] **B1-05 — Seed conforme al PDF** · RT-B08.
  Archivos: `src/database/seed.js`.
  CA: 2 instructores, 3 estudiantes, **3 cursos publicados** de 5 lecciones con ≥1 cuestionario;
  idempotente; usuarios documentados en README.

## Fase 2 — Núcleo transversal

- [x] **B2-01 — Validación de params y query** · RT-B04, RT-B09.
  Archivos: `middlewares/schemaValidate.middleware.js`, `schemas/common.schema.js` (id, paginación).
  CA: `/cursos?limit=abc` → 400 con formato de error; `/cursos/abc` → 400; IDs y paginación validados en todas las rutas.
- [x] **B2-02 — Manejo de errores completo** · RT-B05.
  Archivos: `middlewares/errorHandler.middleware.js`, `middlewares/rateLimiter.middleware.js`.
  CA: JSON malformado → 400; `SequelizeUniqueConstraintError` → 409; 429 con `details`; nunca stack al cliente.
- [x] **B2-03 — Constantes y utilidades** · Buenas prácticas (sin números mágicos ni duplicación).
  Archivos: `src/constants/index.js`, `src/utils/pagination.js`.
  CA: roles, estados, tipos, `MAX_INTENTOS = 3` y límites de paginación salen de constantes.

- [x] **B2-04 — Swagger por recurso** · RT-B10. Archivos: `src/docs/swagger.js`, `src/docs/paths/*.js`, `src/docs/helpers.js`.
  CA: un archivo de rutas por recurso; `/api/docs` carga.

## Fase 3 — Contrato de la API según el PDF

- [x] **B3-01 — Usuarios** · RF-03. `PUT /users/me`. CA: perfil editable; nunca devuelve `passwordHash`.
- [x] **B3-02 — Cursos** · RF-04..07, RN-05.
  CA: `GET /cursos` con `q`, `categoria`, `page`, `limit`; `GET /cursos/:id` solo publicados (o dueño) y
  temario sin `contenido` ni preguntas; `POST /cursos` (borrador), `PUT/DELETE /cursos/:id`,
  `PATCH /cursos/:id/estado` (422 sin lecciones, 409 con inscritos al borrar).
- [x] **B3-03 — Lecciones (instructor)** · RF-08, RF-09.
  CA: `POST /cursos/:id/lecciones`, `PUT/DELETE /lecciones/:id` (204, reordena el resto),
  `PATCH /cursos/:id/lecciones/orden` exige la lista completa y sin repetidos; eliminar rutas públicas que exponen contenido.
- [x] **B3-04 — Preguntas** · RF-14, RN-02.
  CA: `POST /lecciones/:id/preguntas` solo en cuestionarios, `PUT/DELETE /preguntas/:id`;
  `indiceCorrecto < opciones.length` también al editar.
- [x] **B3-05 — Inscripciones y progreso** · RF-11, RF-13, RN-04, RN-08.
  CA: `GET /inscripciones/mias` con % de avance; `GET /cursos/:id/progreso` del propio estudiante.
- [x] **B3-06 — Flujo de lección del estudiante** · RF-10, RF-12, RF-15, RN-01, RN-02, RN-03, RN-08, RT-B03.
  CA: `GET /lecciones/:id` → 403 `LESSON_LOCKED` si bloqueada, sin `indiceCorrecto`;
  `POST /lecciones/:id/completar` solo tipo contenido; `POST /lecciones/:id/intentos` solo cuestionario;
  la lección debe pertenecer a un curso donde el estudiante está inscrito. Confirmar ADR-07.

## Fase 4 — Calidad

- [x] **B4-01 — Códigos HTTP** · Buena práctica. CA: DELETE → 204; revisar 403/404/409/422 en todos los servicios.
- [x] **B4-02 — Funciones cortas** · Buena práctica. CA: dividir `getCourseResumen`, `submitQuizAttempt`
  y otras de más de ~30 líneas en funciones con una responsabilidad.
- [x] **B4-03 — Prueba de humo** · Verificación. CA: script `npm run smoke` (Node `--test` + `fetch`, sin dependencias
  nuevas) que recorre el flujo de la defensa contra la API levantada con Docker.

## Fase 5 — Documentación

- [x] **B5-01 — Swagger y Postman** · RT-B10. CA: todos los endpoints del PDF documentados con ejemplos y errores.
- [x] **B5-02 — README** · Entrega. CA: compose, seed, variables, usuarios de prueba, logout del cliente,
  decisiones técnicas para la defensa, enlace al video.

## Después del backend

- **F-web** — Frontend en `web/` (RT-F01..F09) y servicio `web` en `docker-compose.yml`; tendrá su propio plan.
- **Final** — Video, tag `v1.0.0`, ensayo de la defensa desde cero.
