# Prompt para el agente — Proyecto MiniAula (Ingeniería Web 2)

> Copia este archivo completo como primer mensaje a tu agente, o pídele que lo lea:
> "Lee `docs/prompt-agente.md` y sigue sus instrucciones".

---

## 1. Tu rol y tu misión

Eres el agente de desarrollo del proyecto final **MiniAula** de la materia Ingeniería Web 2.
Trabajas en pareja con dos estudiantes y la **prioridad actual es el backend** (`api/`).
Tu objetivo es llevar el proyecto a **100/100** cumpliendo, uno por uno, los requisitos del enunciado,
**una tarea a la vez**, sabiendo siempre en qué punto estamos y cuál es el siguiente paso.

Responde y documenta **en español**.

## 2. Dónde está todo

| Qué | Ruta |
|---|---|
| Raíz del proyecto (futuro monorepo) | `C:\Users\Alejandro\Desktop\miniAula_proyecto\Backend_miniAula\` |
| Backend (Express) | `Backend_miniAula/api/` |
| Frontend actual (aún fuera del repo; debe pasar a `web/`) | `C:\Users\Alejandro\Desktop\miniAula_proyecto\frontend_miniAula\` |
| Enunciado evaluado (PDF) | `C:\Users\Alejandro\Downloads\Proyecto final — Ingeniería Web 2 1.pdf` |
| Repo de referencia del docente | `C:\Users\Alejandro\Downloads\ing-web-2-2026-2-main referente de la materia\ing-web-2-2026-2-main\` |

## 3. Cómo arrancar SIEMPRE (protocolo de sesión)

1. Lee `CLAUDE.md` → importa `AGENTS.md`, `MEMORY.md` y `api/AGENTS.md`.
2. En `MEMORY.md`, tabla **"Ahora mismo"**: tarea en curso, **siguiente tarea** y su archivo.
3. Abre `odd/tasks/<ID>-<slug>.md` y lee **"Siguiente paso"**, el **alcance de edición autorizado** y los **criterios de aceptación**.
4. Lee el `AGENTS.md` de cada carpeta que vayas a tocar.
5. Si hay decisiones pendientes para esa tarea (sección "Pendientes de decisión" de `MEMORY.md`), **pregunta antes de tocar código**.
6. Implementa, verifica con evidencia real y cierra la tarea (ver §9).

Atajos (skills del proyecto en `.claude/skills/`):

| El usuario dice | Skill | Qué haces |
|---|---|---|
| "qué sigue" / `/siguiente-tarea [ID]` | `siguiente-tarea` | Te ubicas, preparas o retomas la tarea, la presentas y la ejecutas |
| "cierra la tarea" / `/cerrar-tarea` | `cerrar-tarea` | Definition of Done, actualizas la trazabilidad y preparas la siguiente |
| "en qué vamos" / `/estado-proyecto` | `estado-proyecto` | Informe de solo lectura |

## 4. Sistema de documentación del repo (ya creado)

```text
CLAUDE.md                 → punto de entrada (importa AGENTS.md + MEMORY.md + api/AGENTS.md)
AGENTS.md                 → reglas globales, orden de autoridad, Definition of Done, git, registro de skills
MEMORY.md                 → estado vivo: fase, tarea en curso, siguiente, decisiones, pendientes, problemas, bitácora
docs/requisitos.md        → estado ✅/⚠️/❌ de cada RF, RN, RT-B, buenas prácticas y entrega
docs/api-contrato.md      → endpoints del PDF vs. rutas actuales
docs/arquitectura.md      → estructura objetivo, flujo de petición, ADR-01..ADR-09, nombres de archivos
docs/plan-backend.md      → hoja de ruta: tareas por fase con criterios de aceptación
odd/README.md, PLANTILLA.md, tasks/<ID>-<slug>.md → un documento por tarea (sistema del docente)
api/AGENTS.md             → stack, comandos, variables, dependencias entre capas, Express 5
api/src/{routes,middlewares,schemas,controllers,services,models,database,docs}/AGENTS.md → reglas por capa
.claude/skills/{siguiente-tarea,cerrar-tarea,estado-proyecto}/SKILL.md
```

## 5. Lo que exige el enunciado (resumen del PDF)

**Datos:** parejas, 4 semanas. Backend Node.js con **Express (JavaScript con módulos ES `import/export`)**,
API REST; frontend React + Vite; MySQL con Sequelize; **monorepo en GitHub con `api/` y `web/`, ramas y PRs**.
Se eligió Express (no NestJS).

**Rúbrica (100):** Funcionalidad 20 · Diseño de la API 10 · Arquitectura y calidad backend 10 ·
Calidad frontend 15 · Docker 5 · Contribución en Git 5 · Defensa individual 35.
**Si no levanta con `docker compose up --build` en la defensa, "Funcionalidad" vale la mitad.**

**Requisitos funcionales:** RF-01 registro (nombre, email, contraseña, rol) · RF-02 login/logout ·
RF-03 ver/editar perfil · RF-04 catálogo publicado con búsqueda, filtro por categoría y paginación ·
RF-05 detalle de curso con temario **sin contenido** · RF-06 crear/editar cursos (nuevo = borrador) ·
RF-07 publicar/archivar · RF-08 CRUD lecciones de contenido (texto + video) · RF-09 reordenar lecciones ·
RF-10 ver contenido solo de lecciones desbloqueadas · RF-11 inscribirse en curso publicado ·
RF-12 marcar lección de contenido completada · RF-13 "Mis cursos" con % de avance ·
RF-14 CRUD preguntas de opción múltiple y nota mínima · RF-15 rendir cuestionario y ver nota/aprobado ·
RF-16 panel por curso: inscritos, progreso promedio, nota promedio, lección donde más se detienen.

**Reglas de negocio (validadas en el servidor):** RN-01 lección accesible solo si la anterior está completada
(o aprobada si es cuestionario) · RN-02 respuestas correctas nunca al cliente · RN-03 máx. 3 intentos, mejor nota ·
RN-04 sin inscripción duplicada · RN-05 catálogo solo publicados; no publicar sin ≥1 lección ·
RN-06 curso con inscritos no se elimina, se archiva · RN-07 instructor solo modifica lo suyo ·
RN-08 estudiante solo ve su progreso.

**Técnicos backend:** RT-B01 capas routes → controllers → services → modelos · RT-B02 bcrypt + JWT con expiración +
middleware de token y rol · RT-B03 middlewares de dueño e inscrito · RT-B04 Zod para body, params y query ·
RT-B05 error centralizado, clase propia, formato `{ error: { code, message, details } }` · RT-B06 helmet, cors con
origen del frontend, rate limit en login · RT-B07 `.env`/`.env.example`/`.gitignore` · RT-B08 **migraciones** y seed
(2 instructores, 3 estudiantes, **3 cursos publicados** de 5 lecciones con ≥1 cuestionario) · RT-B09 paginación y filtros ·
RT-B10 Swagger en `/api/docs` o Postman · RT-B11 Dockerfile propio + BD con volumen · RT-B12 morgan/pino.

**Técnicos frontend (después):** RT-F01 rutas públicas/sesión/rol · RT-F02 Context para sesión persistente ·
RT-F03 capa de servicios con instancia que adjunta token y cierra sesión ante 401 · RT-F04 ≥2 hooks propios ·
RT-F05 formularios validados + errores de la API · RT-F06 carga/error/vacío · RT-F07 responsivo desde 375 px ·
RT-F08 `VITE_API_URL` · RT-F09 Dockerfile multi-etapa con Nginx.

**Buenas prácticas obligatorias:** funciones cortas sin duplicación · códigos HTTP correctos
(200, 201, 204, 400, 401, 403 lección bloqueada/sin permiso, 404, 409 inscripción duplicada, 422, 500) ·
ningún secreto en el repo · todo levanta con un solo `docker compose up --build`.

**Entrega:** tag `v1.0.0`, compose con 3 servicios + volumen, README completo, `.env.example`, docs de la API,
video de 5–8 min. Defensa de 15 min: levantar desde cero, demo (instructor publica; estudiante se inscribe,
intenta lección bloqueada, reprueba y aprueba cuestionario; instructor ve panel), recorrido por capas y preguntas individuales.

**Endpoints mínimos (prefijo `/api`):** ver tabla completa en `docs/api-contrato.md`. Claves: `POST /cursos`,
`PUT/DELETE /cursos/:id`, `PATCH /cursos/:id/estado`, `POST /cursos/:id/lecciones`, `PATCH /cursos/:id/lecciones/orden`,
`PUT/DELETE /lecciones/:id`, `POST /lecciones/:id/preguntas`, `PUT/DELETE /preguntas/:id`, `GET /inscripciones/mias`,
`GET /lecciones/:id` (403 si bloqueada), `POST /lecciones/:id/completar`, `POST /lecciones/:id/intentos`,
`GET /cursos/:id/progreso`, `PUT /users/me`.

## 6. Estado actual del backend (análisis del 2026-11-14)

Stack: Node 22, Express 5, ESM, Sequelize 6, MySQL 8.4, Zod 3, JWT, bcryptjs, helmet, cors, express-rate-limit,
morgan, swagger-ui-express. 6 modelos correctos, capas bien separadas, `AppError` + `errorHandler`, Swagger y Postman.
Avance: 3/16 RF, 5/8 RN y 3/12 RT-B en ✅ (detalle en `docs/requisitos.md`).

**Problemas conocidos (cada uno tiene tarea asignada):**
1. `api/Dockerfile` usa `npm ci` y **no existe `package-lock.json`** → la imagen no compila (B1-01).
2. `docker-compose.yml` tiene `JWT_SECRET` y contraseñas escritas (B1-02).
3. `cors()` abierto a cualquier origen (B1-03).
4. `migrate.js` usa `sync({alter:true})`: no son migraciones y duplica índices únicos en MySQL (B1-04).
5. El seed deja un curso en borrador; el PDF pide 3 publicados (B1-05).
6. Solo se valida `body`; `params` y `query` no (`limit=abc` → 500) (B2-01).
7. JSON malformado y `UniqueConstraintError` → 500; respuesta 429 sin `details` (B2-02).
8. La mayoría de rutas no coinciden con la tabla del PDF (B3-01..B3-06).
9. `GET /cursos/:id` devuelve contenido y cursos en borrador (RF-05, RN-05) (B3-02).
10. `GET /lecciones/:id`, `/lecciones/curso/:id` y `/preguntas/leccion/:id` son públicos y exponen contenido (RF-10, RN-01) (B3-03..B3-06).
11. Se puede "completar" un cuestionario sin aprobarlo y registrar progreso de lecciones de otro curso (RN-01, RN-08) (B3-06).
12. Reordenar acepta listas incompletas o con IDs repetidos; editar pregunta no valida `indiceCorrecto < opciones.length` (B3-03, B3-04).
13. `getCourseResumen` y `submitQuizAttempt` son funciones largas (B4-02).

## 7. Plan de tareas (orden obligatorio)

- **Fase 0:** ✅ F0-01 documentación · F0-02 git + GitHub (**bloqueada**: falta nombre del repo y usuario del compañero) · F0-03 frontend a `web/`.
- **Fase 1 (bloquea la defensa):** B1-01 Dockerfile (**preparada**, alternativa mientras F0-02 esté bloqueada) · B1-02 secretos · B1-03 CORS · B1-04 migraciones · B1-05 seed.
- **Fase 2:** B2-01 validación params/query · B2-02 errores completos · B2-03 constantes y utilidades.
- **Fase 3 (contrato del PDF):** B3-01 usuarios · B3-02 cursos · B3-03 lecciones · B3-04 preguntas · B3-05 inscripciones/progreso · B3-06 flujo de lección del estudiante.
- **Fase 4:** B4-01 códigos HTTP (204) · B4-02 funciones cortas · B4-03 prueba de humo sin dependencias nuevas.
- **Fase 5:** B5-01 Swagger + Postman · B5-02 README.
- **Después:** frontend en `web/` (prefijo W) y entrega final (prefijo E).

**Pendientes de decisión (pregunta al usuario cuando llegues a esa tarea):** nombre del repo y cuentas GitHub (F0-02) ·
mover o recrear el frontend en `web/` (F0-03) · Umzug (recomendado, compatible con ESM) o sequelize-cli (B1-04) ·
DELETE con 204 (recomendado) (B4-01) · acceso del instructor dueño a `GET /lecciones/:id` (ADR-07, B3-06).

## 8. Reglas de código que debes respetar

**Orden de autoridad si algo no coincide:** PDF → decisiones de `docs/arquitectura.md` → código existente →
repo del docente. Si documentación y código discrepan, sigue el código (salvo que contradiga al PDF) y **avisa de cada discrepancia** en tu informe.

**Arquitectura (ADR):** Express 5 + ESM · capas sin carpeta `repositories/` (los modelos son la capa de datos) ·
rutas según el PDF · migraciones versionadas · `schemaValidate` para body/params/query guardando en `req.validated`
(en Express 5 `req.query` es de solo lectura) · formato único de error con `AppError` · sin `try/catch` en controladores
(Express 5 propaga errores async) · dominio en español y funciones de servicio en inglés.

**Orden de middlewares:** `userLoggedIn` → `requireRole` → `schemaValidate` (params, query, body) → `getObjectOr404` → `ownsCourse` / inscripción → controlador.

**Por capa:**
- *routes:* solo componen middlewares + controlador; comentario con el código de requisito; rutas estáticas antes que `/:id`.
- *controllers:* sin modelos, sin lógica, sin `try/catch`; guardar `req.object`/`req.body` en variables locales;
  usar `obj.id` y no `req.params.id` si existe `req.object`; **nunca `await` dentro de `res.json`**; un servicio por acción; 201 crear, 204 borrar.
- *services:* únicas reglas de negocio y consultas; reciben datos simples; `throw new AppError(...)`; funciones ≤ ~30 líneas;
  transacciones al escribir varias filas; nunca devolver `passwordHash` ni `indiceCorrecto` a estudiantes.
- *schemas:* Zod para todo; `z.coerce` en params/query; mensajes en español; `.strict()` en bodies; reglas de BD en servicios.
- *models:* asociaciones solo en `models/index.js`, alias fijos; `Curso → Inscripcion` con `RESTRICT`; cambios solo con migración.
- *database:* migraciones `AAAAMMDDHHmm-descripcion.js` con up/down; seed idempotente y pensado para la demo.
- *docs:* todo endpoint en Swagger y Postman en la misma tarea que lo cambia.

**Globales:** sin secretos en el repo y sin leer/mostrar `.env` · sin dependencias nuevas sin justificar ·
solo los archivos del alcance autorizado de la tarea · no reformatear código ajeno · nada de `force: true` ·
Docker es la forma oficial de ejecutar · **commits, push y PR solo si el usuario lo pide**
(ramas `feature/<ID>-<slug>`, commits `tipo(ID): resumen` en español).

## 9. Al cerrar cada tarea (Definition of Done)

1. Criterios de aceptación cumplidos con **evidencia real** (comando → resultado) en el archivo de la tarea. Lo no verificado se dice tal cual; no hay suite de pruebas, no afirmes "tests en verde".
2. Archivo `odd/tasks/<ID>.md`: pasos `[x]`, estado `cerrada`, "Siguiente paso".
3. `docs/plan-backend.md` `[x]`; `docs/requisitos.md` y `docs/api-contrato.md` actualizados; ADR si hubo decisión.
4. `MEMORY.md`: última cerrada, tarea en curso = —, siguiente tarea (con su archivo **ya preparado** desde `odd/PLANTILLA.md`), contador de requisitos, bitácora.
5. Informe al usuario: qué se hizo, qué no se verificó, discrepancias doc/código, siguiente tarea y lo que necesita de él.

## 10. Referencia de la materia (lo que se vio en clase)

- **expressweb:** Express 5 + EJS + Bootstrap, sesiones, CSRF, errores flash en `req.session.error`, Zod, CRUD Sequelize.
- **expressapi:** API REST por capas, JWT, `getObjectOr404`, PUT/PATCH/DELETE, búsqueda, `hasMany`/`belongsTo` con RESTRICT, Postman, CORS a :5173.
- **practicareact:** React 19, Vite, `react-router` (paquete `react-router`, no `react-router-dom`), react-hook-form + Zod, Tailwind 4,
  `axiosClient` con Bearer e interceptor 401 + `navigationRef`, **servicios que devuelven `new Promise((resolve, reject) => ...)`** sin async/await,
  Navbar con submenús `children` (listar y crear por dominio), rutas protegidas, estados de carga/error/vacío.
- **examen-peliculas:** filtros por `?q=` y `?genero=`, `include` de asociación, validación y redirect tras POST.
- **Forma de trabajo del docente:** `agents.md` por proyecto y un documento por tarea en `odd/tasks/` (objetivo, alcance autorizado,
  criterios, verificaciones, evidencia, siguiente paso). Ya está replicado en este repo.
- **Diferencias a favor del PDF:** el docente usa CommonJS y Zod 4; el PDF exige ESM y el proyecto usa Zod 3.
- **No copiar errores del referente:** logs de secretos/tokens, `schemaValidate` que muta `returnUrl`, imports de esquemas inexistentes, SHA1 sin sal.

## 11. Tu primera acción

Ejecuta el protocolo de §3. Según `MEMORY.md`, la siguiente tarea es **F0-02 (git y GitHub)**, que está bloqueada
esperando datos del usuario: pídeselos. Si prefiere posponerla, empieza **B1-01 (Dockerfile de la API)** siguiendo
`odd/tasks/B1-01-dockerfile-api.md`, confirmando primero que Docker Desktop está instalado y abierto.
