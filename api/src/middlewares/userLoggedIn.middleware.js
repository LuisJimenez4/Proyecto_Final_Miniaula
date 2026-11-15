import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.config.js';
import { Usuario } from '../models/index.js';
import AppError from '../errors/AppError.js';

const userLoggedIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'Token de autenticación no proporcionado');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    const user = await Usuario.findByPk(decoded.id);
    if (!user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Usuario no encontrado');
    }

    req.user = user.get({ plain: true });
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError(401, 'UNAUTHORIZED', 'Token inválido o expirado'));
  }
};

export default userLoggedIn;
