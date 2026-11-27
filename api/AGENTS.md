# AGENTS.md — API (backend)

Reglas generales en el [`AGENTS.md` raíz](../AGENTS.md). Arquitectura en [`docs/arquitectura.md`](../docs/arquitectura.md).

## Stack

Node.js 22 · Express 5 · JavaScript ESM · Sequelize 6 + MySQL 8.4 (`mysql2`) · Zod 3 · JWT (`jsonwebtoken`) ·
bcryptjs · helmet · cors · express-rate-limit · morgan · swagger-ui-express.

## Comandos (desde `api/`)

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias y genera/actualiza `package-lock.json` (obligatorio para el Dockerfile) |
| `npm run dev` | Servidor con recarga (`node --watch`) |
| `npm start` | Servidor normal |
| `npm run migrate` | Aplica las migraciones pendientes (Umzug, tabla `SequelizeMeta`); repetirlo no falla |
| `npm run seed` | Carga datos de prueba si la BD está vacía (idempotente) |
| `npm run smoke` | Prueba de humo (`node --test` + `fetch`) contra la API ya levantada (`SMOKE_URL` opcional) |
| `docker compose up --build` (en la raíz) | Forma oficial: levanta BD + API (+ web) |

Solo existe la prueba de humo `npm run smoke` (`api/test/smoke.test.js`); no hay pruebas unitarias. No afirmar más de lo ejecutado.

## Variables de entorno

Se leen **solo** en `src/config/env.config.js` y el resto del código importa `ENV`.
Plantilla: `api/.env.example`. Variable nueva → añadirla a `env.config.js`, a ambos `.env.example`
y a `docker-compose.yml` (con `${VAR:-valor_dev}`). Variables actuales de CORS y rate limit: `CORS_ORIGIN`, `LOGIN_RATE_LIMIT_MAX`.

## Capas y carpetas

| Carpeta | Responsabilidad | Reglas |
|---|---|---|
| `src/config/` | Entorno, conexión a BD, opciones de CORS | Único lugar con `process.env` |
| `src/constants/` | Roles, estados, tipos, límites (B2-03) | Sin lógica |
| `src/errors/` | `AppError(statusCode, code, message, details)` | Única clase de error de negocio |
| `src/utils/` | Funciones puras reutilizables (B2-03) | Sin Express ni Sequelize |
| `src/models/` | Modelos y asociaciones | [AGENTS](src/models/AGENTS.md) |
| `src/schemas/` | Validación Zod | [AGENTS](src/schemas/AGENTS.md) |
| `src/middlewares/` | Auth, permisos, validación, errores | [AGENTS](src/middlewares/AGENTS.md) |
| `src/routes/` | Endpoints | [AGENTS](src/routes/AGENTS.md) |
| `src/controllers/` | HTTP | [AGENTS](src/controllers/AGENTS.md) |
| `src/services/` | Negocio y consultas | [AGENTS](src/services/AGENTS.md) |
| `src/database/` | Migraciones y seed | [AGENTS](src/database/AGENTS.md) |
| `src/docs/` | OpenAPI en `/api/docs` | [AGENTS](src/docs/AGENTS.md) |

Dependencias permitidas entre capas (de arriba hacia abajo, nunca al revés):

```text
routes → middlewares, schemas, controllers
controllers → services
services → models, errors, constants, utils
middlewares → models (solo para cargar/verificar), errors, config
```

## Particularidades de Express 5

- Los errores lanzados en funciones `async` llegan solos al `errorHandler`: **no** usar `try/catch` en controladores.
- `req.query` es de solo lectura: el middleware de validación guarda lo validado en `req.validated` (ADR-05).
- El `errorHandler` va siempre al final de `app.js`.

## Seguridad (RT-B06)

- Nunca devolver `passwordHash` ni `indiceCorrecto` a un estudiante.
- Toda ruta no pública lleva `userLoggedIn` y, si aplica, `requireRole`.
- Toda modificación de curso/lección/pregunta pasa por `ownsCourse` (RN-07).
- Toda acción del estudiante sobre una lección pasa por la verificación de inscripción (RT-B03).
