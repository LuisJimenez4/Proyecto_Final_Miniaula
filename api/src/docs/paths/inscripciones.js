import { BEARER, errores, ok } from '../helpers.js';

export default {
  '/inscripciones/mias': {
    get: {
      tags: ['Inscripciones y progreso'],
      summary: 'Mis inscripciones con porcentaje de avance (RF-11, RN-08)',
      security: BEARER,
      responses: {
        200: ok('Inscripciones del estudiante autenticado', {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              cursoId: { type: 'integer' },
              completado: { type: 'boolean' },
              progresoPorcentaje: { type: 'integer', example: 40 },
              completadas: { type: 'integer' },
              totalLecciones: { type: 'integer' },
              curso: { type: 'object', description: 'Datos básicos del curso' },
            },
          },
        }),
        ...errores(401, 403),
      },
    },
  },
};
