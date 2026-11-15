import { ok } from '../helpers.js';

export default {
  '/health': {
    get: {
      tags: ['Sistema'],
      summary: 'Verificación de salud (usada para comprobar que la API levantó)',
      responses: {
        200: ok('API activa', {
          type: 'object',
          properties: { status: { type: 'string', example: 'ok' }, timestamp: { type: 'string', format: 'date-time' } },
        }),
      },
    },
  },
};
