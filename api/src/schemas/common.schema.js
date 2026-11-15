import { z } from 'zod';
import { PAGINACION } from '../constants/index.js';

const idEntero = (campo) =>
  z.coerce
    .number({ invalid_type_error: `${campo} debe ser un número entero positivo` })
    .int(`${campo} debe ser un número entero positivo`)
    .positive(`${campo} debe ser un número entero positivo`);

/** Params con un id: /cursos/:id, /lecciones/:id, /preguntas/:id. */
export const idParamSchema = z.object({ id: idEntero('El id') });

/** RT-B09: page ≥ 1 y limit entre 1 y el máximo permitido. */
export const paginationQuerySchema = z.object({
  page: z.coerce
    .number({ invalid_type_error: 'page debe ser un número entero' })
    .int('page debe ser un número entero')
    .min(1, 'page debe ser mayor o igual a 1')
    .default(PAGINACION.PAGE_DEFAULT),
  limit: z.coerce
    .number({ invalid_type_error: 'limit debe ser un número entero' })
    .int('limit debe ser un número entero')
    .min(1, 'limit debe ser mayor o igual a 1')
    .max(PAGINACION.LIMIT_MAX, `limit no puede superar ${PAGINACION.LIMIT_MAX}`)
    .default(PAGINACION.LIMIT_DEFAULT),
});
