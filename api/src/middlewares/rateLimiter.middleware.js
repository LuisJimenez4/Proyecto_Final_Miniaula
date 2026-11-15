import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env.config.js';
import { LOGIN_RATE_WINDOW_MS } from '../constants/index.js';
import AppError from '../errors/AppError.js';

/**
 * RT-B06: limita el login. Solo cuentan los intentos fallidos (skipSuccessfulRequests) para no
 * bloquear una demo con muchos inicios de sesión correctos; el máximo es configurable (LOGIN_RATE_LIMIT_MAX).
 */
const loginLimiter = rateLimit({
  windowMs: LOGIN_RATE_WINDOW_MS,
  limit: ENV.LOGIN_RATE_LIMIT_MAX,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    const minutos = Math.ceil(LOGIN_RATE_WINDOW_MS / 60000);
    next(new AppError(429, 'RATE_LIMIT', `Demasiados intentos de inicio de sesión. Intenta de nuevo en ${minutos} minutos.`, {
      limit: options.limit,
      windowMinutes: minutos,
    }));
  },
});

export default loginLimiter;
