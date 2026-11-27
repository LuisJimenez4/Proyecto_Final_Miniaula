import { BEARER, errores, idParam, jsonBody, ok, ref } from '../helpers.js';

const TAG = 'Preguntas';

export default {
  '/preguntas/{id}': {
    put: {
      tags: [TAG],
      summary: 'Editar una pregunta con el objeto completo (RF-14, RN-07). Se vuelve a validar indiceCorrecto < opciones.length',
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
      responses: { 200: ok('Pregunta actualizada', ref('PreguntaInstructor')), ...errores(400, 401, 403, 404) },
    },
    delete: {
      tags: [TAG],
      summary: 'Eliminar una pregunta (RF-14, RN-07). No se permite borrar la última de un cuestionario de un curso publicado',
      security: BEARER,
      parameters: [idParam()],
      responses: { 204: ok('Eliminada, sin cuerpo'), ...errores(400, 401, 403, 404, 422) },
    },
  },
};
