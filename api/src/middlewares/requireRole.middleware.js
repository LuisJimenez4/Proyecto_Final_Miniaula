import AppError from '../errors/AppError.js';

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return next(new AppError(403, 'FORBIDDEN', 'No tienes permiso para acceder a este recurso'));
    }
    next();
  };
};

export default requireRole;
