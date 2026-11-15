# Contrato de la API — endpoints mínimos del PDF vs. implementación

Prefijo de todas las rutas: `/api`. La columna **PDF** es obligatoria y manda sobre el código actual.
Cuando una ruta se migre, se actualiza su fila (columna "Actual" y "Estado") en la misma tarea.

| Método | Ruta (PDF) | Acceso | Actual en el código | Estado | Tarea |
|---|---|---|---|---|---|
| POST | `/auth/register` | Público | igual | ✅ | — |
| POST | `/auth/login` | Público (rate limit) | igual | ✅ | — |
| GET | `/users/me` | Autenticado | igual | ✅ | — |
| PUT | `/users/me` | Autenticado | igual al PDF | ✅ | B3-01 |
| GET | `/cursos?categoria=&q=&page=&limit=` | Público (solo publicados) | igual al PDF | ✅ | B3-02 |
| GET | `/cursos/:id` | Público (temario **sin contenido**) | igual al PDF | ✅ | B3-02 |
| POST | `/cursos` | Instructor | igual al PDF | ✅ | B3-02 |
| PUT | `/cursos/:id` | Instructor dueño | igual al PDF | ✅ | B3-02 |
| DELETE | `/cursos/:id` | Instructor dueño | igual al PDF | ✅ | B3-02 |
| PATCH | `/cursos/:id/estado` | Instructor dueño | igual al PDF | ✅ | B3-02 |
| GET | `/instructor/cursos` | Instructor | igual | ✅ | — |
| POST | `/cursos/:id/lecciones` | Instructor dueño | igual al PDF | ✅ | B3-03 |
| PUT | `/lecciones/:id` | Instructor dueño | igual al PDF | ✅ | B3-03 |
| DELETE | `/lecciones/:id` | Instructor dueño | igual al PDF | ✅ | B3-03 (204) |
| PATCH | `/cursos/:id/lecciones/orden` | Instructor dueño | igual al PDF | ✅ | B3-03 |
| POST | `/lecciones/:id/preguntas` | Instructor dueño | igual al PDF | ✅ | B3-04 |
| PUT | `/preguntas/:id` | Instructor dueño | igual al PDF | ✅ | B3-04 |
| DELETE | `/preguntas/:id` | Instructor dueño | igual al PDF | ✅ | B3-04 (204) |
| POST | `/cursos/:id/inscripcion` | Estudiante | igual | ✅ | — |
| GET | `/inscripciones/mias` | Estudiante | igual al PDF | ✅ | B3-05 |
| GET | `/lecciones/:id` | Estudiante inscrito (403 si bloqueada) o instructor dueño (ADR-07) | igual al PDF | ✅ | B3-06 |
| POST | `/lecciones/:id/completar` | Estudiante inscrito | igual al PDF | ✅ | B3-06 |
| POST | `/lecciones/:id/intentos` | Estudiante inscrito | igual al PDF | ✅ | B3-06 |
| GET | `/cursos/:id/progreso` | Estudiante inscrito | igual al PDF | ✅ | B3-05 |
| GET | `/instructor/cursos/:id/resumen` | Instructor dueño | igual | ✅ | — |

## Rutas extra y rutas eliminadas

| Ruta | Decisión | Estado |
|---|---|---|
| `GET /health` | Conservada (comprobación de que la API levantó) | ✅ |
| `GET /instructor/cursos` y `GET /instructor/cursos/:id/resumen` | Del PDF; conservadas | ✅ |
| `GET /inscripciones/:id`, `/inscripciones/:id/progreso`, `/inscripciones/:id/lecciones/...` | Eliminadas; sustituidas por `/cursos/:id/progreso` y `/lecciones/:id/...` | ✅ |
| `GET /lecciones/curso/:cursoId` y `GET /preguntas/leccion/:leccionId` (públicas) | Eliminadas: exponían contenido y preguntas sin control | ✅ |
| `/instructor/cursos` (POST, PATCH, DELETE, estado) | Eliminadas; el CRUD vive en `/cursos` | ✅ |

## Decisión: lectura de lecciones por el instructor (ADR-07, aplicada)

`GET /lecciones/:id` admite **estudiante inscrito** (sin `indiceCorrecto`, con RN-01 y su progreso) **o instructor dueño**
(con `indiceCorrecto`, para el editor). Lo resuelve el middleware `lessonAccess`. Pendiente solo la confirmación del usuario.

## Decisiones de contrato

- `GET /cursos/:id` acepta sesión opcional: un borrador/archivado solo lo ve su instructor dueño; para el resto responde 404.
- `POST /lecciones/:id/intentos` responde **201** (se crea un intento); `completar` responde 200 y es idempotente.
- Orden de middlewares en rutas con recurso: `userLoggedIn → requireRole → params → getObjectOr404 → ownsCourse/isEnrolled → body`
  (así lo hace el código; ver discrepancia anotada en `MEMORY.md`).

## Formato de respuestas

- Éxito: el recurso o `{ ...datos }` directamente; listados paginados: `{ items|cursos, total, page, totalPages }`.
- Error (RT-B05): `{ "error": { "code": "STRING_CODE", "message": "texto", "details": [] | null } }`.
- Códigos: 200 lectura/edición · 201 creación · 204 borrado sin cuerpo · 400 validación · 401 sin token ·
  403 sin permiso o lección bloqueada · 404 no existe · 409 duplicado/conflicto · 422 regla de negocio
  (p. ej. publicar sin lecciones) · 429 rate limit · 500 inesperado.
