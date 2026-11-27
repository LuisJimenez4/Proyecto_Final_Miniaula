import axiosClient from '../config/axiosClient';

/**
 * Servicio de Usuario (RF-03). Convención de clase: cada función devuelve new Promise.
 */
export const getPerfil = () => {
  return new Promise((resolve, reject) => {
    axiosClient.get('/users/me')
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

/** PUT /users/me: { nombre, email } siempre; `password` solo si se escribió (nunca cadena vacía). */
export const updatePerfil = (userData) => {
  return new Promise((resolve, reject) => {
    axiosClient.put('/users/me', userData)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

export default {
  getPerfil,
  updatePerfil,
};
