import { BEARER, errores, jsonBody, ok, ref } from '../helpers.js';

const TAG = 'Perfil de usuario';

export default {
  '/users/me': {
    get: {
      tags: [TAG],
      summary: 'Perfil del usuario autenticado (RF-03)',
      security: BEARER,
      responses: { 200: ok('Perfil sin passwordHash', ref('Usuario')), ...errores(401) },
    },
    put: {
      tags: [TAG],
      summary: 'Actualizar el perfil (RF-03). nombre y email son obligatorios; password es opcional',
      security: BEARER,
      requestBody: jsonBody(
        {
          type: 'object',
          required: ['nombre', 'email'],
          properties: {
            nombre: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6, description: 'Opcional: solo si se quiere cambiar' },
          },
        },
        { nombre: 'Ana López', email: 'ana@estudiante.com' },
      ),
      responses: { 200: ok('Perfil actualizado', ref('Usuario')), ...errores(400, 401, 409) },
    },
  },
};
