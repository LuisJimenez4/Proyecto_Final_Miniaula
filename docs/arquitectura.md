# Arquitectura del backend — MiniAula API

## 1. Estructura objetivo del monorepo

```text
miniAula/ (raíz del repo; hoy es la carpeta Backend_miniAula)
├── AGENTS.md            # reglas globales para personas y agentes IA
├── CLAUDE.md            # carga AGENTS.md + MEMORY.md en Claude Code
├── MEMORY.md            # estado vivo: fase, siguiente tarea, decisiones, bitácora
├── README.md            # cómo levantar todo (lo lee el docente)
├── .env.example         # variables de la raíz (docker compose)
├── docker-compose.yml   # db + api + web, volumen de datos
├── .claude/skills/      # skills del proyecto: siguiente-tarea, cerrar-tarea, estado-proyecto
├── odd/                 # un documento por tarea (sistema del docente)
│   ├── README.md        # ciclo de vida de las tareas
│   ├── PLANTILLA.md
│   └── tasks/<ID>-<slug>.md
├── docs/
│   ├── requisitos.md    # trazabilidad RF / RN / RT (estado de cada código)
│   ├── api-contrato.md  # endpoints del PDF vs implementados
│   ├── arquitectura.md  # este archivo
│   └── plan-backend.md  # fases y tareas con criterios de aceptación
├── postman/             # colección exportada (RT-B10)
├── api/                 # backend (este documento)
└── web/                 # frontend React + Vite (pendiente: tarea F0-03)
```

## 2. Estructura de `api/`

Arquitectura **por capas** (no por módulos): es lo que pide RT-B01, lo que se evalúa en el
"recorrido del código" de la defensa y lo que se usó en clase (`expressapi`).

```text
api/
├── AGENTS.md
├── Dockerfile / .dockerignore
├── package.json / package-lock.json     # el lockfile es obligatorio (npm ci) → B1-01
├── .env.example
└── src/
    ├── index.js          # arranque: autentica la BD y levanta el servidor
    ├── app.js            # middlewares globales, monta /api, errorHandler al final
    ├── config/           # env.config.js (única lectura de process.env), db.config.js, cors (B1-03)
    ├── constants/        # (B2-03) ROLES, ESTADOS_CURSO, TIPOS_LECCION, MAX_INTENTOS, paginación
    ├── errors/           # AppError(statusCode, code, message, details)
    ├── utils/            # (B2-03) funciones puras sin Express ni BD (p. ej. paginación)
    ├── models/           # 6 modelos Sequelize + asociaciones en models/index.js (capa de datos)
    ├── schemas/          # Zod: body, params y query por recurso
    ├── middlewares/      # auth, rol, objeto-o-404, dueño, inscrito, validación, rate limit, errores
    ├── routes/           # endpoints REST: solo componen middlewares + controlador
    ├── controllers/      # HTTP: req → service → res (sin lógica ni consultas)
    ├── services/         # reglas de negocio y consultas al ORM
    ├── database/
    │   ├── migrations/   # (B1-04) migraciones versionadas
    │   ├── migrate.js    # ejecuta migraciones pendientes
    │   └── seed.js       # datos de prueba idempotentes
    └── docs/swagger.js   # OpenAPI 3 servido en /api/docs
```

Cada carpeta de `src/` tiene su `AGENTS.md` con las reglas de esa capa.

## 3. Flujo de una petición

```text
HTTP → app.js (helmet, cors, morgan, json)
     → routes/<recurso>.routes.js
         → userLoggedIn → requireRole(...) → schemaValidate(params/query/body)
         → getObjectOr404(Model) → ownsCourse | isEnrolled
     → controllers/<recurso>.controller.js   (lee req, llama 1 servicio, responde)
     → services/<recurso>.service.js         (reglas RN, consultas Sequelize, lanza AppError)
     → models/                               (Sequelize)
     ← errores: cualquier throw/next(err) → errorHandler → { error: { code, message, details } }
```

Orden de middlewares en una ruta: **autenticación → rol → validación → existencia → permiso por recurso → controlador**.
Validar antes de buscar en BD evita consultas con IDs inválidos.

## 4. Decisiones de arquitectura (ADR breves)

| ID | Decisión | Motivo | Estado |
|---|---|---|---|
| ADR-01 | Express 5 + JavaScript con módulos ES (`import/export`) | Lo exige el PDF para Express. El repo de clase usa CommonJS, pero el PDF manda | Vigente |
| ADR-02 | Capas sin carpeta `repositories/`; los modelos Sequelize son la capa de datos | RT-B01 lo permite ("o modelos del ORM"); menos archivos y menos duplicación | Vigente |
| ADR-03 | Rutas según la tabla de endpoints del PDF (por recurso REST), no bajo `/instructor/...` | Se verifican una por una en la defensa | Vigente → B3-xx |
| ADR-04 | Migraciones versionadas en `src/database/migrations/` en lugar de `sync({alter:true})` | RT-B08 pide migraciones; `alter` duplica índices únicos en MySQL en cada arranque | Vigente: **Umzug** (funciona con ESM; las migraciones se cargan con `import()`), frente a sequelize-cli que exige `.cjs` (B1-04) |
| ADR-05 | `schemaValidate(schema, source)` valida `body`, `params` y `query`; en Express 5 `req.query` es de solo lectura, el resultado validado se guarda en `req.validated[source]` | RT-B04 | Vigente (B2-01): `req.body` y `req.params` se reescriben con el dato validado y `req.validated.{body,params,query}` también |
| ADR-06 | Formato único de error y `AppError` como única forma de devolver errores | RT-B05 | Vigente |
| ADR-07 | `GET /lecciones/:id` admite estudiante inscrito o instructor dueño | Ver [api-contrato.md](api-contrato.md) | Aplicada en B3-06 con el middleware `lessonAccess`; pendiente de confirmación del usuario |
| ADR-08 | Express 5 propaga errores de funciones `async`; los controladores no llevan `try/catch` | Menos código repetido | Vigente |
| ADR-10 | Detalle de curso con sesión opcional (`optionalUser`): borradores/archivados solo para el instructor dueño; el resto recibe 404 | RF-05 pide temario sin contenido y el editor necesita ver borradores | Vigente |
| ADR-11 | `Inscripcion.completado` se recalcula (en ambos sentidos) al completar, aprobar, añadir o borrar lecciones | Evita estados obsoletos | Vigente |
| ADR-12 | Reglas añadidas: no publicar con cuestionario sin preguntas; no borrar la última lección/pregunta de un curso publicado | Coherencia con RN-05 y RN-01 | Vigente (justificadas en README) |
| ADR-09 | Nombres de dominio en español (`curso`, `leccion`), funciones de servicio en inglés (`getPublishedCourses`) | Es la convención que ya sigue el código | Vigente |

Nueva decisión → se agrega una fila aquí y una línea en la bitácora de `MEMORY.md`.

## 5. Convenciones de nombres de archivo

| Capa | Patrón | Ejemplo |
|---|---|---|
| Rutas | `<recurso>.routes.js` | `curso.routes.js` |
| Controladores | `<recurso>.controller.js` | `curso.controller.js` |
| Servicios | `<recurso>.service.js` | `progreso.service.js` |
| Modelos | `<entidad>.model.js` | `leccion.model.js` |
| Esquemas | `<recurso>.schema.js` | `curso.schema.js` |
| Middlewares | `<nombre>.middleware.js` | `ownsCourse.middleware.js` |
| Migraciones | `AAAAMMDDHHmm-<descripcion>.js` | `202611150900-crear-usuarios.js` |
