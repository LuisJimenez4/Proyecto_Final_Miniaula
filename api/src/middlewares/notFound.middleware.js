import AppError from '../errors/AppError.js';

/** Ruta inexistente → 404 con el formato único de error (RT-B05). */
const notFound = (req, res, next) => {
  next(new AppError(404, 'ROUTE_NOT_FOUND', `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};

export default notFound;
