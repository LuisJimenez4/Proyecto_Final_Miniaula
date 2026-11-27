import { z } from 'zod';

const datosPregunta = z.object({
  enunciado: z.string({ required_error: 'El enunciado es obligatorio' }).trim()
    .min(5, 'El enunciado debe tener al menos 5 caracteres'),
  opciones: z.array(z.string().trim().min(1, 'Las opciones no pueden estar vacías'), { required_error: 'Las opciones son obligatorias' })
    .min(2, 'Debe haber al menos 2 opciones')
    .max(6, 'No puede haber más de 6 opciones'),
  indiceCorrecto: z.number({ required_error: 'indiceCorrecto es obligatorio', invalid_type_error: 'indiceCorrecto debe ser un número' })
    .int('indiceCorrecto debe ser un entero')
    .min(0, 'El índice debe ser mayor o igual a 0'),
}).strict();

const indiceDentroDeOpciones = {
  check: (data) => data.indiceCorrecto < data.opciones.length,
  config: { message: 'El índice correcto debe ser menor que el número de opciones', path: ['indiceCorrecto'] },
};

/** RF-14 / RN-02: POST /lecciones/:id/preguntas. */
export const createPreguntaSchema = datosPregunta.refine(indiceDentroDeOpciones.check, indiceDentroDeOpciones.config);

/** RF-14: PUT /preguntas/:id exige el objeto completo y vuelve a validar el índice. */
export const updatePreguntaSchema = createPreguntaSchema;

/** RF-15: POST /lecciones/:id/intentos. */
export const submitIntentosSchema = z.object({
  respuestas: z.array(z.object({
    preguntaId: z.number().int().positive('preguntaId debe ser un entero positivo'),
    indiceSeleccionado: z.number().int().min(0, 'indiceSeleccionado debe ser mayor o igual a 0'),
  }).strict(), { required_error: 'respuestas es obligatorio' }).min(1, 'Debe enviar al menos una respuesta'),
}).strict();
