import axiosClient from '../config/axiosClient';

/**
 * Servicio de Cursos y Catálogo (RF-04, RF-05, RF-11). Convención de clase: cada función devuelve new Promise.
 */

/** GET /cursos?page&limit&q&categoria&nivel → { cursos, total, page, totalPages }. No envía claves vacías. */
export const getCursos = (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );

  return new Promise((resolve, reject) => {
    axiosClient.get('/cursos', { params: cleanParams })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

/** GET /cursos/:id → curso con instructor { id, nombre } y temario sin contenido. */
export const getCursoById = (id) => {
  return new Promise((resolve, reject) => {
    axiosClient.get(`/cursos/${id}`)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

export const inscribirseCurso = (id) => {
  return new Promise((resolve, reject) => {
    axiosClient.post(`/cursos/${id}/inscripcion`)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

export default {
  getCursos,
  getCursoById,
  inscribirseCurso,
};
