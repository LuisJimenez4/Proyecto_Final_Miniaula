import axiosClient from '../config/axiosClient';

/**
 * Servicio de lecciones (RF-08, RF-09, RF-10). Convención de clase: cada función devuelve new Promise.
 * El temario de un curso sale de `curso.lecciones` (GET /cursos/:id); aquí no hay listado por curso.
 */

/**
 * GET /lecciones/:id. Estudiante inscrito: contenido, preguntas SIN indiceCorrecto y `progreso` (403 LESSON_LOCKED si está bloqueada).
 * Instructor dueño: contenido y preguntas CON indiceCorrecto.
 */
export const getLeccionById = (id) => {
  return new Promise((resolve, reject) => {
    axiosClient.get(`/lecciones/${id}`)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

/** POST /cursos/:cursoId/lecciones. Contenido: { titulo, tipo, contenido, videoUrl? }. Cuestionario: { titulo, tipo, notaMinima }. */
export const crearLeccion = (cursoId, leccionData) => {
  return new Promise((resolve, reject) => {
    axiosClient.post(`/cursos/${cursoId}/lecciones`, leccionData)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

/** PATCH /cursos/:cursoId/lecciones/orden con { orden: [ids de TODAS las lecciones] } → [{ id, titulo, tipo, orden }]. */
export const reordenarLecciones = (cursoId, orden) => {
  return new Promise((resolve, reject) => {
    axiosClient.patch(`/cursos/${cursoId}/lecciones/orden`, { orden })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

/** PUT /lecciones/:id con exactamente { titulo, contenido, videoUrl, notaMinima } (sin `tipo`; videoUrl vacío → null). */
export const actualizarLeccion = (id, leccionData) => {
  return new Promise((resolve, reject) => {
    axiosClient.put(`/lecciones/${id}`, leccionData)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

/** DELETE /lecciones/:id → 204 sin cuerpo · 422 COURSE_EMPTY si es la última de un curso publicado. */
export const eliminarLeccion = (id) => {
  return new Promise((resolve, reject) => {
    axiosClient.delete(`/lecciones/${id}`)
      .then(() => resolve())
      .catch((error) => reject(error));
  });
};

export default {
  getLeccionById,
  crearLeccion,
  reordenarLecciones,
  actualizarLeccion,
  eliminarLeccion,
};
