import { z } from 'zod';
import { ESTADOS_CURSO, NIVELES, valoresDe } from '../constants/index.js';
import { paginationQuerySchema } from './common.schema.js';

const datosCurso = {
  titulo: z.string({ required_error: 'El título es obligatorio' }).trim()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede superar 200 caracteres'),
  descripcion: z.string({ required_error: 'La descripción es obligatoria' }).trim()
    .min(10, 'La descripción debe tener al menos 10 caracteres'),
  categoria: z.string({ required_error: 'La categoría es obligatoria' }).trim()
    .min(2, 'La categoría es obligatoria')
    .max(100, 'La categoría no puede superar 100 caracteres'),
  nivel: z.enum(valoresDe(NIVELES), { message: 'El nivel debe ser Básico, Intermedio o Avanzado' }),
};

/** RF-06: POST /cursos (el curso nace en borrador). */
export const createCursoSchema = z.object({
  ...datosCurso,
  nivel: datosCurso.nivel.default(NIVELES.BASICO),
}).strict();

/** RF-06: PUT /cursos/:id exige el objeto editable completo. */
export const updateCursoSchema = z.object(datosCurso).strict();

/** RF-07: PATCH /cursos/:id/estado. */
export const updateEstadoCursoSchema = z.object({
  estado: z.enum(valoresDe(ESTADOS_CURSO), { message: 'El estado debe ser borrador, publicado o archivado' }),
}).strict();

/** RF-04 / RT-B09: GET /cursos?q=&categoria=&nivel=&page=&limit= */
export const cursoQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().max(100, 'q no puede superar 100 caracteres').optional(),
  categoria: z.string().trim().max(100, 'categoria no puede superar 100 caracteres').optional(),
  nivel: z.enum(valoresDe(NIVELES), { message: 'El nivel debe ser Básico, Intermedio o Avanzado' }).optional(),
});
