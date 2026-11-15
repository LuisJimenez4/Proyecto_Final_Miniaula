# AGENTS.md — services/

Único lugar con **reglas de negocio** (RN-01..RN-08) y **consultas Sequelize**.

## Reglas

- Archivo `<recurso>.service.js`; funciones exportadas con nombre, en inglés y con verbo (`getPublishedCourses`, `enrollStudent`).
- Reciben datos simples (IDs, objetos validados), nunca `req` ni `res`.
- Los errores se lanzan con `throw new AppError(status, 'CODIGO', 'Mensaje en español')`.
- Una función = una responsabilidad. Si pasa de ~30 líneas, extraer funciones auxiliares (no exportadas) (B4-02).
- Sin lógica duplicada: si dos servicios necesitan lo mismo (p. ej. "¿está desbloqueada la lección?"),
  se exporta desde un servicio y el otro lo importa.
- Las operaciones que escriben varias filas que deben quedar coherentes (reordenar, borrar y reordenar,
  intento + progreso + completado) usan `sequelize.transaction()`.
- Nunca devolver `passwordHash`; a estudiantes nunca `indiceCorrecto` (usar `attributes` explícitos).
- Comentario JSDoc de una línea con la regla que implementa: `/** RN-03: máximo 3 intentos, mejor nota. */`

## Mapa de reglas → servicio

| Regla | Servicio |
|---|---|
| RN-01 desbloqueo secuencial | `progreso.service.js` (`checkLessonUnlocked`) |
| RN-02 respuestas ocultas / nota en servidor | `leccion.service.js` (`getLessonDetail`), `utils/score.js`; `curso.service.js` nunca devuelve preguntas |
| RN-03 3 intentos, mejor nota | `progreso.service.js` (`submitQuizAttempt`) |
| RN-04 sin inscripción doble | `inscripcion.service.js` |
| RN-05 catálogo / publicar | `curso.service.js` |
| RN-06 no borrar con inscritos | `curso.service.js` |
| RN-07 dueño | `middlewares/ownsCourse` (verificación) |
| RN-08 privacidad del estudiante | `inscripcion.service.js`, `progreso.service.js` (filtrar por `req.user.id`) |
| RF-16 panel | `panel.service.js` |

## Códigos de error usados

401 `UNAUTHORIZED`/`INVALID_CREDENTIALS` · 403 `LESSON_LOCKED`/`MAX_ATTEMPTS_REACHED`/`FORBIDDEN*` ·
404 `*_NOT_FOUND`/`ROUTE_NOT_FOUND` · 409 `ALREADY_ENROLLED`/`DUPLICATE_EMAIL`/`DUPLICATE_ENTRY`/`COURSE_HAS_STUDENTS` ·
422 `COURSE_EMPTY`/`QUIZ_WITHOUT_QUESTIONS`/`LESSON_NOT_QUIZ`/`LESSON_NOT_CONTENT` · 400 `INVALID_JSON`/`INVALID_LESSON_ORDER` · 429 `RATE_LIMIT`.
Código nuevo → añadirlo aquí y en Swagger.
