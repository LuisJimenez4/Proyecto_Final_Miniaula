import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/index.js';
import { ENV } from '../config/env.config.js';
import AppError from '../errors/AppError.js';

/**
 * Register a new user.
 */
export async function register({ nombre, email, password, rol }) {
  const existing = await Usuario.findOne({ where: { email } });
  if (existing) {
    throw new AppError(409, 'DUPLICATE_EMAIL', 'Ya existe un usuario con ese correo electrónico');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await Usuario.create({ nombre, email, passwordHash, rol });

  const { passwordHash: _, ...userData } = user.toJSON();
  return userData;
}

/**
 * Authenticate a user and return a JWT.
 */
export async function login({ email, password }) {
  const user = await Usuario.findOne({ where: { email } });
  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Credenciales inválidas');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Credenciales inválidas');
  }

  const token = jwt.sign(
    { id: user.id, rol: user.rol },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN },
  );

  return {
    token,
    user: {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    },
  };
}
