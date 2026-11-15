import { z } from 'zod';
import { TIPOS_LECCION, valoresDe } from '../constants/index.js';

const titulo = z.string({ required_error: 'El título es obligatorio' }).trim()
  .min(3, 'El título debe tener al menos 3 caracteres')
  .max(200, 'El título no puede superar 200 caracteres');
const contenido = z.string().trim().optional().nullable();
const videoUrl = z.string().url('URL de video inválida').optional().nullable();
const notaMinima = z.number({ invalid_type_error: 'La nota mínima debe ser un número' })
  .int('La nota mínima debe ser un entero')
  .min(0, 'La nota mínima debe estar entre 0 y 100')
  .max(100, 'La nota mínima debe estar entre 0 y 100')
  .optional();

/** RF-08: POST /cursos/:id/lecciones. El contenido es obligatorio en lecciones de tipo contenido. */
export const createLeccionSchema = z.object({
  titulo,
  tipo: z.enum(valoresDe(TIPOS_LECCION), { message: 'El tipo debe ser contenido o cuestionario' }),
  contenido,
  videoUrl,
  notaMinima,
}).strict().refine(
  (data) => data.tipo !== TIPOS_LECCION.CONTENIDO || Boolean(data.contenido),
  { message: 'El contenido es obligatorio para lecciones de tipo contenido', path: ['contenido'] },
);

/** RF-08: PUT /lecciones/:id (el tipo no se puede cambiar). */
export const updateLeccionSchema = z.object({ titulo, contenido, videoUrl, notaMinima }).strict();

/** RF-09: PATCH /cursos/:id/lecciones/orden con la lista completa de ids y sin repetidos. */
export const reorderLeccionesSchema = z.object({
  orden: z.array(z.number({ invalid_type_error: 'Cada id de lección debe ser un número' }).int().positive(),
    { required_error: 'orden es obligatorio' })
    .min(1, 'Debe enviar al menos un id de lección'),
}).strict().refine(
  (data) => new Set(data.orden).size === data.orden.length,
  { message: 'La lista de orden no puede tener ids repetidos', path: ['orden'] },
);
