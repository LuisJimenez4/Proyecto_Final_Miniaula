import { ROLES } from '../constants/index.js';
import ownsCourse from './ownsCourse.middleware.js';
import isEnrolled from './isEnrolled.middleware.js';

/** GET /lecciones/:id (ADR-07): el instructor debe ser dueño del curso; el estudiante, estar inscrito. */
const lessonAccess = (req, res, next) =>
  (req.user.rol === ROLES.INSTRUCTOR ? ownsCourse(req, res, next) : isEnrolled(req, res, next));

export default lessonAccess;
