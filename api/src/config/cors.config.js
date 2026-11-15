import { ENV } from './env.config.js';

/** RT-B06: solo el origen del frontend configurado recibe cabeceras CORS. */
export const corsOptions = {
  origin: ENV.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
