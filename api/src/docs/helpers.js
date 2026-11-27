// Piezas reutilizables para describir endpoints OpenAPI sin repetir texto.

export const BEARER = [{ BearerAuth: [] }];

const MENSAJES_ERROR = {
  400: 'Datos inválidos (VALIDATION_ERROR, INVALID_JSON, INVALID_LESSON_ORDER)',
  401: 'Sin token o token inválido/expirado (UNAUTHORIZED)',
  403: 'Sin permiso (FORBIDDEN, FORBIDDEN_NOT_OWNER, NOT_ENROLLED, LESSON_LOCKED, MAX_ATTEMPTS_REACHED)',
  404: 'El recurso no existe (NOT_FOUND, COURSE_NOT_FOUND, LESSON_NOT_FOUND, QUESTION_NOT_FOUND)',
  409: 'Conflicto (ALREADY_ENROLLED, COURSE_HAS_STUDENTS, DUPLICATE_EMAIL, DUPLICATE_ENTRY)',
  422: 'Regla de negocio incumplida (COURSE_EMPTY, QUIZ_WITHOUT_QUESTIONS, LESSON_NOT_QUIZ, LESSON_NOT_CONTENT)',
  429: 'Demasiados intentos fallidos de login (RATE_LIMIT)',
};

/** Respuestas de error con el esquema común { error: { code, message, details } }. */
export const errores = (...codigos) =>
  Object.fromEntries(
    codigos.map((codigo) => [
      codigo,
      {
        description: MENSAJES_ERROR[codigo],
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
    ]),
  );

export const ok = (description, schema) => ({
  description,
  ...(schema && { content: { 'application/json': { schema } } }),
});

export const ref = (nombre) => ({ $ref: `#/components/schemas/${nombre}` });
export const lista = (nombre) => ({ type: 'array', items: ref(nombre) });

export const idParam = (nombre = 'id', descripcion = 'Identificador numérico') => ({
  name: nombre,
  in: 'path',
  required: true,
  description: descripcion,
  schema: { type: 'integer', minimum: 1, example: 1 },
});

export const jsonBody = (schema, example) => ({
  required: true,
  content: { 'application/json': { schema, ...(example && { example }) } },
});
