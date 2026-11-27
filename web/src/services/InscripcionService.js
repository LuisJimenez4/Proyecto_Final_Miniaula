import axiosClient from '../config/axiosClient';

/**
 * Servicio de Inscripciones y Progreso del Estudiante (RF-11 a RF-13, RF-15).
 * Convención de clase: cada función devuelve new Promise.
 */

/** GET /inscripciones/mias → [{ id, cursoId, completado, curso, progresoPorcentaje, completadas, totalLecciones }] */
export const getMisInscripciones = () => {
  return new Promise((resolve, reject) => {
    axiosClient.get('/inscripciones/mias')
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

/** GET /cursos/:cursoId/progreso → [{ leccionId, titulo, tipo, orden, desbloqueada, completada, intentos, intentosRestantes, mejorNota }] */
export const getProgresoCurso = (cursoId) => {
  return new Promise((resolve, reject) => {
    axiosClient.get(`/cursos/${cursoId}/progreso`)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

/** POST /lecciones/:id/completar (solo lecciones de contenido). */
export const completarLeccion = (leccionId) => {
  return new Promise((resolve, reject) => {
    axiosClient.post(`/lecciones/${leccionId}/completar`)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

/** POST /lecciones/:id/intentos → 201 { nota, aprobado, notaMinima, intentos, intentosRestantes, mejorNota, completada }. */
export const enviarIntento = (leccionId, respuestas) => {
  return new Promise((resolve, reject) => {
    axiosClient.post(`/lecciones/${leccionId}/intentos`, { respuestas })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

export default {
  getMisInscripciones,
  getProgresoCurso,
  completarLeccion,
  enviarIntento,
};
