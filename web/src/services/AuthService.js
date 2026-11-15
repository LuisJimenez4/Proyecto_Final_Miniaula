import axiosClient from '../config/axiosClient';

/**
 * Servicio de Autenticación
 * Cumple con la regla del docente: Retornar new Promise explícita
 */
export const login = (credentials) => {
  return new Promise((resolve, reject) => {
    axiosClient.post('/auth/login', credentials)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

export const register = (userData) => {
  return new Promise((resolve, reject) => {
    axiosClient.post('/auth/register', userData)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

export const getMe = () => {
  return new Promise((resolve, reject) => {
    axiosClient.get('/users/me')
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};

export default {
  login,
  register,
  getMe,
};
