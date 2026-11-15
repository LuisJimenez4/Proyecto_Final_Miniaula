# Trazabilidad de requisitos — MiniAula

Fuente: PDF "Proyecto final — Ingeniería Web 2" (evaluación sobre 100 pts).
Cada código se verifica uno por uno en la defensa. Esta tabla es la **fuente de verdad del avance**:
se actualiza al cerrar cada tarea de [plan-backend.md](plan-backend.md).

Leyenda: ✅ cumple · ⚠️ parcial / ruta distinta al PDF · ❌ no cumple · ⏳ pendiente (frontend/entrega)

Última revisión: 2026-11-15 (Lotes 1 a 4 y B5-01 implementados y verificados con `npm run smoke` contra Docker; falta README final B5-02, frontend y entrega).

## Requisitos funcionales (RF) — criterio "Funcionalidad completa" (20 pts)

| Código | Requisito | Estado | Situación actual | Tarea |
|---|---|---|---|---|
| RF-01 | Registro con nombre, email, contraseña y rol | ✅ | `POST /api/auth/register` | — |
| RF-02 | Iniciar y cerrar sesión | ⚠️ | Login ✅. Logout es del cliente (JWT sin estado); documentarlo en el README | B5-02 |
| RF-03 | Ver y editar el propio perfil | ✅ | `GET` y `PUT /users/me` (contraseña opcional) | B3-01 |
| RF-04 | Catálogo publicado con búsqueda, filtro por categoría y paginación | ✅ | `GET /cursos?q=&categoria=&nivel=&page=&limit=` validado con Zod | B2-01, B3-02 |
| RF-05 | Detalle de curso con temario **sin contenido** | ✅ | `GET /cursos/:id`: temario sin contenido; borradores solo para su dueño | B3-02 |
| RF-06 | Crear/editar cursos; nuevo curso en borrador | ✅ | `POST /cursos`, `PUT` y `DELETE /cursos/:id` (204) | B3-02 |
| RF-07 | Publicar y archivar | ✅ | `PATCH /cursos/:id/estado` (422 sin lecciones o con cuestionario vacío) | B3-02 |
| RF-08 | CRUD de lecciones de contenido | ✅ | `POST /cursos/:id/lecciones`, `PUT` y `DELETE /lecciones/:id` (204) | B3-03 |
| RF-09 | Reordenar lecciones | ✅ | `PATCH /cursos/:id/lecciones/orden` exige la lista completa sin repetidos | B3-03 |
| RF-10 | Ver contenido de lecciones desbloqueadas; bloqueadas sin contenido | ✅ | `GET /lecciones/:id`: 403 `LESSON_LOCKED`; la lista de bloqueadas sale en `/cursos/:id/progreso` | B3-06 |
| RF-11 | Inscribirse en curso publicado | ✅ | `POST /cursos/:id/inscripcion` | — |
| RF-12 | Marcar lección de contenido como completada | ✅ | `POST /lecciones/:id/completar` solo contenido, de un curso donde está inscrito | B3-06 |
| RF-13 | "Mis cursos" con % de avance | ✅ | `GET /inscripciones/mias` y `GET /cursos/:id/progreso` | B3-05 |
| RF-14 | CRUD de preguntas y nota mínima | ✅ | `POST /lecciones/:id/preguntas` (solo cuestionarios), `PUT/DELETE /preguntas/:id` | B3-04 |
| RF-15 | Rendir cuestionario y ver nota/aprobado | ✅ | `POST /lecciones/:id/intentos` solo cuestionarios; nota en el servidor | B3-06 |
| RF-16 | Panel: inscritos, progreso promedio, nota promedio, lección de mayor caída | ✅ | `GET /instructor/cursos/:id/resumen` (refactor en funciones cortas) | B4-02 |

## Reglas de negocio (RN) — se validan en el servidor

| Código | Regla | Estado | Situación actual | Tarea |
|---|---|---|---|---|
| RN-01 | Lección accesible solo si la anterior está completada / aprobada | ✅ | Se aplica al leer, completar e intentar (`checkLessonUnlocked`) | B3-06 |
| RN-02 | Respuestas correctas nunca al cliente; calificación en servidor | ✅ | `indiceCorrecto` solo sale al instructor dueño; verificado en smoke | B3-06 |
| RN-03 | Máx. 3 intentos; se guarda la mejor nota | ✅ | `progreso.service.js` | — |
| RN-04 | Sin inscripción duplicada | ✅ | Índice único + validación (409 `ALREADY_ENROLLED`; constraint → 409 `DUPLICATE_ENTRY`) | B2-02 |
| RN-05 | Catálogo solo publicados; no publicar sin ≥1 lección | ✅ | Catálogo y detalle solo publicados; publicar exige ≥1 lección | B3-02 |
| RN-06 | Curso con inscritos no se elimina, solo se archiva | ✅ | 409 `COURSE_HAS_STUDENTS` | — |
| RN-07 | Instructor solo modifica lo suyo | ✅ | `ownsCourse` | — |
| RN-08 | Estudiante solo ve su progreso y notas | ✅ | Progreso filtrado por inscripción del usuario; lección de otro curso rechazada | B3-06 |

## Requisitos técnicos backend (RT-B) — "Diseño de la API" (10) + "Arquitectura y calidad" (10)

| Código | Requisito | Estado | Situación actual | Tarea |
|---|---|---|---|---|
| RT-B01 | Capas routes → controllers → services → modelos | ✅ | Cumple | — |
| RT-B02 | bcrypt, JWT con expiración, middleware de token y rol | ✅ | Cumple | — |
| RT-B03 | Dueño del curso / estudiante inscrito antes de la lección | ✅ | `isEnrolled` (corregido: usa el curso de la lección) y `ownsCourse` en toda ruta de lección | B3-06 |
| RT-B04 | Validar body, params y query con Zod | ✅ | Zod en body, params y query (`req.validated`, ADR-05) | B2-01 |
| RT-B05 | Error centralizado, clase propia, formato `{ error: { code, message, details } }` | ✅ | JSON malformado 400, duplicado 409, 404 de ruta, 429 con `details`, sin stack | B2-02 |
| RT-B06 | helmet, cors con origen del frontend, rate limit en login | ✅ | `cors` solo con `CORS_ORIGIN`; rate limit configurable (solo intentos fallidos) | B1-03 |
| RT-B07 | `.env`, `.env.example`, `.env` en `.gitignore` | ✅ | `docker-compose.yml` usa `${VAR:-valor_dev}`; `.env` ignorado; dos `.env.example` | B1-02 |
| RT-B08 | Migraciones + seed (2 instructores, 3 estudiantes, 3 cursos **publicados** de 5 lecciones con ≥1 cuestionario) | ✅ | Migraciones con Umzug; seed idempotente con 3 cursos publicados | B1-04, B1-05 |
| RT-B09 | Paginación `page`, `limit` y filtros por query | ✅ | `page`/`limit` validados (límite máximo 50) y filtros por query | B2-01 |
| RT-B10 | Swagger en `/api/docs` o Postman con todos los endpoints | ✅ | Swagger por recurso en `src/docs/paths/` y colección Postman regenerada | B5-01 |
| RT-B11 | Dockerfile propio; BD en su contenedor con volumen | ✅ | Dockerfile con lockfile y `USER node`; verificado con `docker compose up --build` | B1-01 |
| RT-B12 | Logs con morgan o pino | ✅ | morgan | — |

## Buenas prácticas obligatorias (pesan como la funcionalidad)

| Práctica | Estado | Nota | Tarea |
|---|---|---|---|
| Funciones cortas, una responsabilidad, sin duplicación | ✅ | `getCourseResumen` dividido; el resto de funciones de servicio ≤ ~30 líneas | B4-02 |
| Códigos HTTP correctos (200, 201, 204, 400, 401, 403, 404, 409, 422, 500) | ✅ | DELETE → 204; intentos → 201; reglas → 422 | B4-01 |
| Ningún secreto en el repositorio | ✅ | Solo valores de desarrollo por defecto, documentados | B1-02 |
| Todo levanta con un solo `docker compose up --build` | ⚠️ | `db` + `api` ✅ verificado; falta el servicio `web` | F-web |

## Entrega

| Ítem | Estado | Tarea |
|---|---|---|
| Monorepo en GitHub con `api/` y `web/`, ramas y PRs | ❌ (no hay git; el frontend está en otra carpeta) | F0-02, F0-03 |
| `docker-compose.yml` con 3 servicios + volumen | ⚠️ (`db` + `api` + volumen ✅; falta `web`) | F-web |
| README completo (compose, seed, variables, usuarios de prueba) | ✅ (falta solo el enlace al video) | B5-02 |
| `.env.example` | ✅ | — |
| Documentación de la API | ✅ | B5-01 |
| Video 5–8 min con enlace en README | ⏳ | Final |
| Tag `v1.0.0` | ⏳ | Final |
