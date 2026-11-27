# MiniAula — Backend API REST

API REST para la plataforma de cursos cortos **MiniAula** (LMS), con **Node.js 22**, **Express 5**, **JavaScript (ES Modules)**,
**Sequelize 6**, **MySQL 8.4** y **Zod**. Proyecto final de Ingeniería Web 2.

> Video de la defensa (5–8 min): _pendiente de enlazar_.

---

## 🚀 Cómo levantarlo

### Con Docker (forma oficial)

Requiere solo Docker Desktop abierto:

```bash
docker compose up --build
```

Levanta MySQL 8.4 (con volumen `mysql_data`) y la API en `http://localhost:3000`. Al arrancar, la API aplica las
**migraciones** y el **seed** (ambos idempotentes) y luego inicia el servidor. No hace falta crear ningún archivo `.env`:
`docker-compose.yml` usa valores **de desarrollo** por defecto (`${VAR:-valor}`).

Para empezar desde cero: `docker compose down -v && docker compose up --build`.

| Comprobación | URL |
|---|---|
| Salud | `GET http://localhost:3000/api/health` |
| Swagger UI | `http://localhost:3000/api/docs` |
| Postman | importar `postman/miniaula.postman_collection.json` |

### Variables de entorno

Opcionales: copiar `.env.example` a `.env` (junto a `docker-compose.yml`) para cambiar los valores. `.env` nunca se versiona.

| Variable | Por defecto (solo desarrollo) | Para qué |
|---|---|---|
| `DB_NAME`, `DB_PASSWORD` | `miniaula`, `dev_root_password` | Base de datos y contraseña de root |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | `dev_only_jwt_secret_change_me`, `24h` | Firma y expiración del token |
| `CORS_ORIGIN` | `http://localhost:5173` | Único origen del frontend que recibe cabeceras CORS |
| `LOGIN_RATE_LIMIT_MAX` | `10` | Intentos **fallidos** de login por 15 min (los exitosos no cuentan) |
| `DB_HOST_PORT` | `3306` | Puerto del host para MySQL (cámbialo si el 3306 está ocupado) |
| `NODE_ENV` | `production` | Entorno |

### Ejecución local (sin Docker)

```bash
cd api
cp .env.example .env     # ajustar DB_PASSWORD y JWT_SECRET
npm install
npm run migrate          # aplica las migraciones pendientes (Umzug)
npm run seed             # carga datos de prueba si la BD está vacía
npm run dev              # servidor con recarga
```

### Prueba de humo

Con la API levantada: `cd api && npm run smoke` recorre el flujo de la defensa (registro, curso, lecciones, cuestionario,
bloqueo 403, intentos, panel) y las reglas RN-01 a RN-08. `SMOKE_URL` cambia la URL base.

---

## 👥 Cuentas de prueba (seed)

Todas con contraseña `password123` (datos de prueba, no secretos):

| Rol | Email |
|---|---|
| Instructor | `garcia@miniaula.com` (cursos *JavaScript Fundamentos* y *React Avanzado*), `martinez@miniaula.com` (*Diseño UX/UI*) |
| Estudiante | `ana@estudiante.com`, `carlos@estudiante.com`, `maria@estudiante.com` |

El seed crea 3 cursos **publicados** de 5 lecciones (contenido, cuestionario, contenido, cuestionario, contenido) con 4 preguntas
por cuestionario y nota mínima 70: se puede reprobar (≤ 2 aciertos) y luego aprobar.

---

## 🏛️ Arquitectura

```text
routes → middlewares (auth / rol / Zod / existencia / dueño / inscripción) → controllers (HTTP) → services (negocio + Sequelize) → models
```

| Carpeta (`api/src/`) | Responsabilidad |
|---|---|
| `routes/` | Endpoints; solo componen middlewares y un controlador |
| `middlewares/` | `userLoggedIn`, `optionalUser`, `requireRole`, `schemaValidate`, `getObjectOr404`, `ownsCourse`, `isEnrolled`, `lessonAccess`, rate limit, `notFound`, `errorHandler` |
| `schemas/` | Zod para `body`, `params` y `query` (mensajes en español) |
| `controllers/` | `req` → un servicio → `res`; sin consultas ni `try/catch` |
| `services/` | Reglas de negocio (RN) y consultas; lanzan `AppError` |
| `models/`, `database/` | 6 modelos; migraciones (`migrations/`) y seed |
| `constants/`, `utils/` | Roles, estados, `MAX_INTENTOS`, paginación y cálculo de nota |
| `docs/` | OpenAPI dividido por recurso (`docs/paths/`) servido en `/api/docs` |

Errores siempre como `{ "error": { "code", "message", "details" } }`.

---

## 📋 Reglas de negocio

| Regla | Dónde |
|---|---|
| **RN-01** Lección accesible solo si la anterior está completada (aprobada si es cuestionario) | `progreso.service.js` (`checkLessonUnlocked`) |
| **RN-02** `indiceCorrecto` nunca llega al estudiante; la nota se calcula en el servidor | `leccion.service.js`, `utils/score.js` |
| **RN-03** Máx. 3 intentos; se guarda la mejor nota (transacción con bloqueo de fila) | `progreso.service.js` (`submitQuizAttempt`) |
| **RN-04** Sin inscripción duplicada (índice único + 409) | `inscripcion.service.js` |
| **RN-05** Catálogo y detalle solo publicados; publicar exige ≥ 1 lección | `curso.service.js` |
| **RN-06** Curso con inscritos no se elimina (409), se archiva | `curso.service.js` |
| **RN-07** El instructor solo modifica lo suyo | `ownsCourse.middleware.js` |
| **RN-08** El estudiante solo ve su progreso | rutas `/inscripciones/mias` y `/cursos/:id/progreso` |

## 🧭 Decisiones técnicas (para la defensa)

- **Migraciones con Umzug** (funciona con ES Modules; sequelize-cli exige CommonJS). Nunca se usa `sync()`.
- **`GET /cursos/:id` nunca devuelve contenido ni preguntas.** El contenido solo sale de `GET /lecciones/:id`, para el
  estudiante inscrito (sin respuestas) o el instructor dueño (con respuestas, para su editor).
- **Lecciones bloqueadas:** `GET /cursos/:id/progreso` las lista con `desbloqueada: false` y sin contenido; abrirlas responde 403 `LESSON_LOCKED`.
- **Reordenar** exige la lista completa; el desbloqueo siempre se calcula con el orden actual.
- **Borrar o añadir lecciones** recalcula `completado` de los inscritos, dentro de una transacción.
- **Rate limit de login** solo cuenta intentos fallidos y su máximo es configurable.
- **Tres intentos agotados** dejan el cuestionario (y por RN-01 el curso) sin avanzar para ese estudiante, tal como pide el enunciado.
- **Reglas añadidas** (no están en el enunciado; se justifican por coherencia con RN-05): no se publica un curso con cuestionarios
  sin preguntas (nadie podría aprobarlos), y no se borra la última lección ni la última pregunta de un curso publicado (422).
- **Logout:** el JWT no guarda estado en el servidor; cerrar sesión consiste en descartar el token en el cliente.
- **CORS:** `cors` responde solo con el origen configurado en `CORS_ORIGIN`.

## 📊 Panel del instructor (RF-16)

`GET /api/instructor/cursos/:id/resumen` devuelve `inscritos`, `completaron`, `progresoPromedio`, `notaPromedio`,
`avancePorLeccion` (cuántos alumnos llegaron a cada lección) y `leccionMayorCaida` (el paso con más alumnos detenidos).
