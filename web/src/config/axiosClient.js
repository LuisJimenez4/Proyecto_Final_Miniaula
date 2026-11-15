import axios from 'axios';
import { getToken } from './session';

// RT-F08: la URL de la API sale solo de VITE_API_URL (Vite la fija al compilar); sin valor de respaldo.
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('Falta la variable VITE_API_URL. Defínela en .env (ver .env.example) y reinicia el servidor.');
}

let unauthorizedHandler = null;

/** AuthProvider registra aquí su logout para que un 401 limpie sesión (almacenamiento y estado). */
export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register'];

const isAuthEndpoint = (url = '') => AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// RT-F03: adjunta el JWT en cada petición.
axiosClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// RT-F03 / RT-F02: un 401 fuera del login cierra la sesión.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isUnauthorized = error.response?.status === 401 && !isAuthEndpoint(error.config?.url);
    if (isUnauthorized && unauthorizedHandler) unauthorizedHandler();
    return Promise.reject(error);
  },
);

export default axiosClient;
