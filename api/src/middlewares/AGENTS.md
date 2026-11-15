# AGENTS.md — middlewares/

Funciones `(req, res, next)` reutilizables. Archivo: `<nombre>.middleware.js`, export default.

## Middlewares existentes

| Middleware | Qué hace | Deja en `req` | Error |
|---|---|---|---|
| `userLoggedIn` | Verifica `Authorization: Bearer <jwt>` y carga el usuario | `req.user` (objeto plano) | 401 `UNAUTHORIZED` |
| `requireRole(...roles)` | Comprueba `req.user.rol` | — | 403 `FORBIDDEN` |
| `schemaValidate(schema, source)` | Valida `body` / `params` / `query` con Zod | dato validado (ver ADR-05) | 400 `VALIDATION_ERROR` |
| `getObjectOr404(Model, param)` | Busca por PK | `req.object` | 404 `NOT_FOUND` |
| `ownsCourse` | El instructor es dueño del curso del objeto (curso, lección o pregunta) | — | 403 `FORBIDDEN_NOT_OWNER` |
| `isEnrolled` | El estudiante está inscrito en el curso (el de `req.object.cursoId` o, si no hay, `req.params.id`) | `req.inscripcion` | 403 `NOT_ENROLLED` |
| `lessonAccess` | `GET /lecciones/:id`: instructor → `ownsCourse`; estudiante → `isEnrolled` | `req.inscripcion` (estudiante) | 403 |
| `optionalUser` | Ruta pública con sesión opcional: valida el token solo si llega | `req.user` (si hay token) | 401 |
| `notFound` | Ruta inexistente con el formato único de error | — | 404 `ROUTE_NOT_FOUND` |
| `rateLimiter` | Limita intentos **fallidos** de login (RT-B06); máximo en `LOGIN_RATE_LIMIT_MAX` | — | 429 `RATE_LIMIT` (con `details`) |
| `errorHandler` | Convierte cualquier error al formato único (RT-B05) | — | — |

## Reglas

- Los errores se pasan con `next(new AppError(...))` o `throw` dentro de `async`; nunca `res.status(...).json` directo
  (excepto `errorHandler` y el `handler` del rate limiter).
- Un middleware hace **una** comprobación. Si hace falta otra, se crea otro middleware.
- Los middlewares de permiso pueden consultar modelos solo para verificar; la lógica de negocio va en `services/`.
- `errorHandler` es el único que decide el formato `{ error: { code, message, details } }` y nunca expone el stack.
- Express 5: no asignar sobre `req.query`.
