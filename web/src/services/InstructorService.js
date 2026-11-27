import axiosClient from '../config/axiosClient';

/**
 * Servicio de gestión de cursos del instructor (RF-06, RF-07, RF-16).
 * Convención de clase: cada función devuelve new Promise.
 */
export const getCursosInstructor = () => {
  return new Promise((resolve, reject) => {
    axiosClient.get('/instructor/cursos')
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

/** POST /cursos: solo { titulo, descripcion, categoria, nivel }; nace en borrador. */
export const crearCurso = (cursoData) => {
  return new Promise((resolve, reject) => {
    axiosClient.post('/cursos', cursoData)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

/** PUT /cursos/:id: exige los 4 campos. */
export const actualizarCurso = (id, cursoData) => {
  return new Promise((resolve, reject) => {
    axiosClient.put(`/cursos/${id}`, cursoData)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

/** PATCH /cursos/:id/estado → 422 COURSE_EMPTY / QUIZ_WITHOUT_QUESTIONS al publicar. */
export const cambiarEstadoCurso = (id, estado) => {
  return new Promise((resolve, reject) => {
    axiosClient.patch(`/cursos/${id}/estado`, { estado })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

/** DELETE /cursos/:id → 204 sin cuerpo · 409 COURSE_HAS_STUDENTS. */
export const eliminarCurso = (id) => {
  return new Promise((resolve, reject) => {
    axiosClient.delete(`/cursos/${id}`)
      .then(() => resolve())
      .catch((error) => reject(error));
  });
};

export const getResumenCurso = (id) => {
  return new Promise((resolve, reject) => {
    axiosClient.get(`/instructor/cursos/${id}/resumen`)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

export default {
  getCursosInstructor,
  crearCurso,
  actualizarCurso,
  cambiarEstadoCurso,
  eliminarCurso,
  getResumenCurso,
};
