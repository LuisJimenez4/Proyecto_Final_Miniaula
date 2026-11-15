import { z } from 'zod';

/** RF-03: PUT /users/me con nombre y email; la contraseña es opcional. */
export const updateProfileSchema = z.object({
  nombre: z.string({ required_error: 'El nombre es obligatorio' }).trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres'),
  email: z.string({ required_error: 'El email es obligatorio' }).trim().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100).optional(),
}).strict();
