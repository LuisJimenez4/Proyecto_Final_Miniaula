import AppError from '../errors/AppError.js';
import { Inscripcion } from '../models/index.js';

/**
 * RT-B03: el estudiante debe estar inscrito en el curso.
 * El curso sale de la lección cargada (`req.object.cursoId`) o, en rutas /cursos/:id/..., de `req.params.id`.
 */
const isEnrolled = async (req, res, next) => {
  try {
    const cursoId = req.object?.cursoId ?? req.params.id;

    const inscripcion = await Inscripcion.findOne({
      where: { estudianteId: req.user.id, cursoId },
    });

    if (!inscripcion) {
      throw new AppError(403, 'NOT_ENROLLED', 'No estás inscrito en este curso');
    }

    req.inscripcion = inscripcion;
    next();
  } catch (error) {
    next(error);
  }
};

export default isEnrolled;
