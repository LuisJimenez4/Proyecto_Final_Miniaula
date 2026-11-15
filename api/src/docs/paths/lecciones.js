import { BEARER, errores, idParam, jsonBody, ok, ref } from '../helpers.js';

const edicion = 'Lecciones (instructor)';
const estudiante = 'Lecciones (estudiante)';

export default {
  '/lecciones/{id}': {
    get: {
      tags: [estudiante],
      summary: 'Abrir una lección (RF-10, RN-01, RN-02, RT-B03). Estudiante inscrito: 403 LESSON_LOCKED si la anterior no está '
        + 'completada y preguntas SIN indiceCorrecto. Instructor dueño (ADR-07): contenido y preguntas CON indiceCorrecto',
      security: BEARER,
      parameters: [idParam()],
      responses: { 200: ok('Lección con contenido y preguntas', ref('LeccionDetalle')), ...errores(400, 401, 403, 404) },
    },
    put: {
      tags: [edicion],
      summary: 'Editar la lección (RF-08, RN-07); el tipo no cambia',
      security: BEARER,
      parameters: [idParam()],
      requestBody: jsonBody(
        {
          type: 'object',
          required: ['titulo'],
          properties: {
            titulo: { type: 'string' },
            contenido: { type: 'string', nullable: true },
            videoUrl: { type: 'string', nullable: true },
            notaMinima: { type: 'integer', minimum: 0, maximum: 100 },
          },
        },
        { titulo: 'Introducción (v2)', contenido: 'Texto actualizado' },
      ),
      responses: { 200: ok('Lección actualizada', ref('Leccion')), ...errores(400, 401, 403, 404) },
    },
    delete: {
      tags: [edicion],
      summary: 'Eliminar la lección, su progreso y reordenar el resto (RF-08). No se permite borrar la última de un curso publicado',
      security: BEARER,
      parameters: [idParam()],
      responses: { 204: ok('Eliminada, sin cuerpo'), ...errores(400, 401, 403, 404, 422) },
    },
  },
  '/lecciones/{id}/preguntas': {
    post: {
      tags: ['Preguntas'],
      summary: 'Añadir una pregunta a un cuestionario (RF-14, RN-02, RN-07). indiceCorrecto debe ser < opciones.length',
      security: BEARER,
      parameters: [idParam()],
      requestBody: jsonBody(
        {
          type: 'object',
          required: ['enunciado', 'opciones', 'indiceCorrecto'],
          properties: {
            enunciado: { type: 'string' },
            opciones: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 6 },
            indiceCorrecto: { type: 'integer', minimum: 0 },
          },
        },
        { enunciado: '¿Qué palabra declara una constante?', opciones: ['var', 'let', 'const'], indiceCorrecto: 2 },
      ),
      responses: { 201: ok('Pregunta creada', ref('PreguntaInstructor')), ...errores(400, 401, 403, 404, 422) },
    },
  },
  '/lecciones/{id}/completar': {
    post: {
      tags: [estudiante],
      summary: 'Completar una lección de contenido (RF-12, RN-01, RT-B03). Idempotente; los cuestionarios responden 422',
      security: BEARER,
      parameters: [idParam()],
      responses: { 200: ok('Progreso de la lección', ref('Progreso')), ...errores(400, 401, 403, 404, 422) },
    },
  },
  '/lecciones/{id}/intentos': {
    post: {
      tags: [estudiante],
      summary: 'Enviar un intento de cuestionario (RF-15, RN-01, RN-02, RN-03). Máximo 3; se guarda la mejor nota. '
        + 'La nota se calcula en el servidor',
      security: BEARER,
      parameters: [idParam()],
      requestBody: jsonBody(
        {
          type: 'object',
          required: ['respuestas'],
          properties: {
            respuestas: {
              type: 'array',
              items: {
                type: 'object',
                required: ['preguntaId', 'indiceSeleccionado'],
                properties: { preguntaId: { type: 'integer' }, indiceSeleccionado: { type: 'integer', minimum: 0 } },
              },
            },
          },
        },
        { respuestas: [{ preguntaId: 1, indiceSeleccionado: 2 }] },
      ),
      responses: { 201: ok('Resultado del intento', ref('ResultadoIntento')), ...errores(400, 401, 403, 404, 422) },
    },
  },
};
