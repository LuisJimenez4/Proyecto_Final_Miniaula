import * as authService from '../services/auth.service.js';

export const register = async (req, res, next) => {
  const result = await authService.register(req.body);
  res.status(201).json({ message: 'Usuario registrado exitosamente', user: result });
};

export const login = async (req, res, next) => {
  const result = await authService.login(req.body);
  res.status(200).json({ message: 'Inicio de sesión exitoso', token: result.token, user: result.user });
};
