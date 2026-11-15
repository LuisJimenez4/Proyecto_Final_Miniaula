import bcrypt from 'bcryptjs';
import { Usuario } from '../models/index.js';
import AppError from '../errors/AppError.js';

/**
 * Get a user profile by ID (excluding passwordHash).
 */
export async function getProfile(userId) {
  const user = await Usuario.findByPk(userId, {
    attributes: { exclude: ['passwordHash'] },
  });

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  }

  return user;
}

/**
 * Update a user profile.
 */
export async function updateProfile(userId, data) {
  const user = await Usuario.findByPk(userId);
  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  }

  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }

  if (data.email && data.email !== user.email) {
    const existing = await Usuario.findOne({ where: { email: data.email } });
    if (existing) {
      throw new AppError(409, 'DUPLICATE_EMAIL', 'Ya existe un usuario con ese correo electrónico');
    }
  }

  await user.update(data);

  const { passwordHash: _, ...userData } = user.toJSON();
  return userData;
}
