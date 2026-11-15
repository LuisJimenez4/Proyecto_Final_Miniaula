# AGENTS.md — models/

Modelos Sequelize: son la **capa de datos** (ADR-02, no hay `repositories/`).

## Modelo del PDF (6 entidades, no cambiar sin justificar en el README)

| Modelo | Tabla | Campos | Restricciones |
|---|---|---|---|
| `Usuario` | `usuarios` | id, nombre, email, passwordHash, rol, creadoEn | email único; rol `estudiante`/`instructor` |
| `Curso` | `cursos` | id, titulo, descripcion, categoria, nivel, estado, instructorId, creadoEn | estado `borrador`/`publicado`/`archivado`, por defecto `borrador` |
| `Leccion` | `lecciones` | id, titulo, tipo, contenido, videoUrl, orden, notaMinima, cursoId | tipo `contenido`/`cuestionario` |
| `Pregunta` | `preguntas` | id, enunciado, opciones (JSON), indiceCorrecto, leccionId | |
| `Inscripcion` | `inscripciones` | id, estudianteId, cursoId, fechaInscripcion, completado | único (estudianteId, cursoId) |
| `Progreso` | `progresos` | id, inscripcionId, leccionId, completada, intentos, mejorNota, actualizadoEn | único (inscripcionId, leccionId) |

## Reglas

- Un archivo por modelo `<entidad>.model.js`; **todas** las asociaciones en `models/index.js`, que exporta
  `sequelize` y los 6 modelos. Importar siempre desde `models/index.js`.
- Alias de asociación en español y fijos (`instructor`, `lecciones`, `preguntas`, `inscripciones`, `progresos`,
  `curso`, `leccion`, `estudiante`, `inscripcion`). No renombrar: los usan servicios y frontend.
- `timestamps: false`; las fechas del PDF son columnas propias (`creadoEn`, `actualizadoEn`, `fechaInscripcion`).
- Integridad: `Curso → Inscripcion` con `RESTRICT` (RN-06); el resto de hijos con `CASCADE`.
- Los modelos no contienen reglas de negocio ni consultas de alto nivel.
- Cualquier cambio de columnas o índices requiere una **migración nueva** (B1-04); nunca `sync({force|alter})`.
