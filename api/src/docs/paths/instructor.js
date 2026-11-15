import { BEARER, errores, idParam, ok, lista } from '../helpers.js';

const TAG = 'Panel del instructor';

export default {
  '/instructor/cursos': {
    get: {
      tags: [TAG],
      summary: 'Mis cursos (todos los estados) con totalLecciones y totalInscripciones',
      security: BEARER,
      responses: { 200: ok('Cursos del instructor', lista('Curso')), ...errores(401, 403) },
    },
  },
  '/instructor/cursos/{id}/resumen': {
    get: {
      tags: [TAG],
      summary: 'Panel de un curso propio: inscritos, completaron, progreso y nota promedio, avance por lección y lección de mayor caída (RF-16, RN-07)',
      security: BEARER,
      parameters: [idParam()],
      responses: {
        200: ok('Métricas del curso', {
          type: 'object',
          properties: {
            inscritos: { type: 'integer' },
            completaron: { type: 'integer' },
            progresoPromedio: { type: 'integer' },
            notaPromedio: { type: 'integer' },
            avancePorLeccion: { type: 'array', items: { type: 'object' } },
            leccionMayorCaida: { type: 'object', nullable: true },
          },
        }),
        ...errores(400, 401, 403, 404),
      },
    },
  },
};
