import { errores, jsonBody, ok, ref } from '../helpers.js';

const TAG = 'Autenticación';

export default {
  '/auth/register': {
    post: {
      tags: [TAG],
      summary: 'Registrar un usuario (RF-01)',
      requestBody: jsonBody(
        {
          type: 'object',
          required: ['nombre', 'email', 'password', 'rol'],
          properties: {
            nombre: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            rol: { type: 'string', enum: ['estudiante', 'instructor'] },
          },
        },
        { nombre: 'Laura Pérez', email: 'laura@estudiante.com', password: 'password123', rol: 'estudiante' },
      ),
      responses: { 201: ok('Usuario creado (sin passwordHash)', ref('Usuario')), ...errores(400, 409) },
    },
  },
  '/auth/login': {
    post: {
      tags: [TAG],
      summary: 'Iniciar sesión y obtener el token JWT (RF-02). Rate limit: solo cuentan los intentos fallidos',
      requestBody: jsonBody(
        {
          type: 'object',
          required: ['email', 'password'],
          properties: { email: { type: 'string' }, password: { type: 'string' } },
        },
        { email: 'garcia@miniaula.com', password: 'password123' },
      ),
      responses: {
        200: ok('Token JWT y datos del usuario', {
          type: 'object',
          properties: { message: { type: 'string' }, token: { type: 'string' }, user: ref('Usuario') },
        }),
        ...errores(400, 401, 429),
      },
    },
  },
};
