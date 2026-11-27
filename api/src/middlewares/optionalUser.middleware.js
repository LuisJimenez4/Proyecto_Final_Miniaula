import userLoggedIn from './userLoggedIn.middleware.js';

/** Ruta pública con sesión opcional: si llega un token se valida (y deja `req.user`); si no, sigue anónima. */
const optionalUser = (req, res, next) => {
  if (!req.headers.authorization) return next();
  return userLoggedIn(req, res, next);
};

export default optionalUser;
