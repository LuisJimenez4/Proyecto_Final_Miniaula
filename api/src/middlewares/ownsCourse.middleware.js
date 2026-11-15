import AppError from '../errors/AppError.js';
import { Curso, Leccion } from '../models/index.js';

const forbidden = () => new AppError(403, 'FORBIDDEN_NOT_OWNER', 'No tienes permiso para modificar este recurso');

const ownerOfCourse = async (cursoId) => (await Curso.findByPk(cursoId))?.instructorId;

const ownerOfLesson = async (leccionId) => {
  const leccion = await Leccion.findByPk(leccionId);
  return leccion ? ownerOfCourse(leccion.cursoId) : undefined;
};

/** Instructor dueño del curso al que pertenece el objeto: curso, lección (→ curso) o pregunta (→ lección → curso). */
const resolveOwnerId = async (obj) => {
  if (obj.instructorId !== undefined) return obj.instructorId;
  if (obj.cursoId !== undefined) return ownerOfCourse(obj.cursoId);
  if (obj.leccionId !== undefined) return ownerOfLesson(obj.leccionId);
  return undefined;
};

/** RN-07: solo el instructor dueño modifica sus cursos, lecciones y preguntas. */
const ownsCourse = async (req, res, next) => {
  try {
    const ownerId = await resolveOwnerId(req.object);
    if (ownerId !== req.user.id) throw forbidden();
    next();
  } catch (error) {
    next(error);
  }
};

export default ownsCourse;
