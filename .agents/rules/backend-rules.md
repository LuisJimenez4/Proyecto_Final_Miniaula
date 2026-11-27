# Reglas del backend (Express / Node.js) — MiniAula

Resumen obligatorio para cualquier rol que toque `api/`. El detalle por capa está en `api/src/<capa>/AGENTS.md`.
Fuente: PDF del proyecto (códigos RT-B) + decisiones de `docs/arquitectura.md`. Máximo 150 líneas.

## 1. Stack fijo (no cambiar)

Node.js 22 · Express 5 · JavaScript con **módulos ES** (`import/export`, nunca `require`) · Sequelize 6 + MySQL 8.4 ·
Zod · JWT con expiración · bcryptjs · helmet · cors · express-rate-limit · morgan · Swagger en `/api/docs`.
Dependencia nueva solo con justificación escrita en la tarea y lockfile actualizado.

## 2. Arquitectura por capas (RT-B01)

```text
routes → middlewares → schemas → controllers → services → models
```

| Capa | Hace | Nunca hace |
|---|---|---|
| routes | Compone middlewares + un controlador | Lógica, consultas |
| middlewares | Una comprobación: token, rol, validación, existencia, dueño, inscripción | Reglas de negocio |
| schemas | Valida body, params y query con Zod (mensajes en español) | Consultar la BD |
| controllers | `req` → un servicio → `res` | Importar modelos, `try/catch`, `await` dentro de `res.json` |
| services | Reglas RN y consultas Sequelize, lanza `AppError` | Recibir `req`/`res` |
| models | Definición y asociaciones (en `models/index.js`) | Lógica |

Orden de middlewares en cada ruta:
`userLoggedIn → requireRole → schemaValidate(params/query/body) → getObjectOr404 → ownsCourse | inscripción → controlador`.

## 3. Contrato de la API

- Rutas y métodos **exactamente** como la tabla del PDF (`docs/api-contrato.md`), prefijo `/api`.
- Errores siempre `{ "error": { "code", "message", "details" } }` mediante `AppError` + `errorHandler` (RT-B05).
- Códigos HTTP: 200 lectura/edición · 201 creación · 204 borrado · 400 validación · 401 sin token ·
  403 sin permiso o **lección bloqueada** · 404 no existe · 409 duplicado (inscripción) · 422 regla (publicar sin lecciones) · 500.
- Listados con `page`, `limit` y filtros por query, validados (RT-B09).

## 4. Reglas de negocio que no se pueden romper (servidor)

| Código | Regla |
|---|---|
| RN-01 | Lección accesible solo si la anterior está completada (aprobada si es cuestionario) |
| RN-02 | `indiceCorrecto` nunca sale al estudiante; la nota se calcula en el servidor |
| RN-03 | Máximo 3 intentos por cuestionario; se guarda la mejor nota |
| RN-04 | Sin inscripción duplicada (409) |
| RN-05 | Catálogo solo publicados; no publicar sin ≥1 lección |
| RN-06 | Curso con inscritos no se elimina, se archiva |
| RN-07 | El instructor solo modifica sus cursos, lecciones y preguntas |
| RN-08 | El estudiante solo ve su propio progreso y notas |

## 5. Seguridad y configuración (RT-B02, B06, B07)

- Contraseñas con bcrypt; nunca devolver `passwordHash`.
- JWT con expiración; `userLoggedIn` + `requireRole` en toda ruta no pública.
- `ownsCourse` en toda modificación de curso/lección/pregunta; verificación de inscripción en toda acción del estudiante sobre una lección.
- helmet, CORS solo con el origen del frontend, rate limit en login.
- `process.env` solo en `src/config/env.config.js`. Sin secretos en archivos versionados; solo `.env.example`.

## 6. Base de datos (RT-B08)

- Cambios de esquema solo con **migraciones** versionadas; nunca `sync({ force | alter })`.
- Seed idempotente: 2 instructores, 3 estudiantes, 3 cursos **publicados** de 5 lecciones con ≥1 cuestionario.
- Escrituras de varias filas relacionadas dentro de una transacción.

## 7. Calidad (se evalúa como la funcionalidad)

- Funciones cortas (~30 líneas máx.), una responsabilidad, sin lógica duplicada.
- Constantes para roles, estados, tipos, `MAX_INTENTOS` y límites de paginación (sin números mágicos).
- Comentario con el código de requisito en rutas (`// RF-08, RN-07`) y en servicios (`/** RN-03: ... */`).
- Nombres: dominio en español (`curso`, `leccion`), funciones de servicio en inglés con verbo.

## 8. Docker y verificación (RT-B11, RT-B12)

- Todo debe levantar con `docker compose up --build`; la API ejecuta migraciones y seed al arrancar.
- Logs de peticiones con morgan.
- Verificar con evidencia real (curl/Postman/smoke). No hay suite de pruebas: no afirmar "tests en verde".
- Cambiar un endpoint obliga a actualizar Swagger y la colección de Postman en la misma tarea.

## 9. Lo que NO se hace

- Editar archivos fuera del alcance autorizado de `odd/tasks/<ID>.md`.
- Reformatear código ajeno a la tarea.
- Commits, push o PR sin que el usuario lo pida.
- Copiar del repo del docente: CommonJS, SHA1, logs de secretos o tokens.
