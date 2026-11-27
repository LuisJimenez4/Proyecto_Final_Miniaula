import axiosClient from '../config/axiosClient';

/**
 * Servicio de preguntas de cuestionarios (RF-14). Convención de clase: cada función devuelve new Promise.
 * Las preguntas de una lección salen de `leccion.preguntas` (GET /lecciones/:id); aquí no hay listado.
 */

/** POST /lecciones/:leccionId/preguntas con { enunciado, opciones (2 a 6), indiceCorrecto } · 422 LESSON_NOT_QUIZ. */
export const crearPregunta = (leccionId, preguntaData) => {
  return new Promise((resolve, reject) => {
    axiosClient.post(`/lecciones/${leccionId}/preguntas`, preguntaData)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

/** PUT /preguntas/:id: exige los 3 campos. */
export const actualizarPregunta = (id, preguntaData) => {
  return new Promise((resolve, reject) => {
    axiosClient.put(`/preguntas/${id}`, preguntaData)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

/** DELETE /preguntas/:id → 204 sin cuerpo · 422 QUIZ_WITHOUT_QUESTIONS si es la última de un curso publicado. */
export const eliminarPregunta = (id) => {
  return new Promise((resolve, reject) => {
    axiosClient.delete(`/preguntas/${id}`)
      .then(() => resolve())
      .catch((error) => reject(error));
  });
};

export default {
  crearPregunta,
  actualizarPregunta,
  eliminarPregunta,
};
