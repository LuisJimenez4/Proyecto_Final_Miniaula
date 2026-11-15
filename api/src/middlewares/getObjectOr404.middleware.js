import AppError from '../errors/AppError.js';

const getObjectOr404 = (Model, paramName = 'id', options = {}) => {
  return async (req, res, next) => {
    try {
      const instance = await Model.findByPk(req.params[paramName], options);
      if (!instance) {
        throw new AppError(404, 'NOT_FOUND', `${Model.name} no encontrado`);
      }
      req.object = instance;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default getObjectOr404;
