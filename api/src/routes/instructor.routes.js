import { Router } from 'express';
import * as cursoController from '../controllers/curso.controller.js';
import * as instructorController from '../controllers/instructor.controller.js';
import { Curso } from '../models/index.js';
import { ROLES } from '../constants/index.js';
import getObjectOr404 from '../middlewares/getObjectOr404.middleware.js';
import userLoggedIn from '../middlewares/userLoggedIn.middleware.js';
import requireRole from '../middlewares/requireRole.middleware.js';
import ownsCourse from '../middlewares/ownsCourse.middleware.js';
import schemaValidate from '../middlewares/schemaValidate.middleware.js';
import { idParamSchema } from '../schemas/common.schema.js';

const router = Router();

// Todas las rutas del instructor requieren autenticación y rol de instructor
router.use(userLoggedIn, requireRole(ROLES.INSTRUCTOR));

// GET /api/instructor/cursos — RF-06: cursos del instructor (todos los estados)
router.get('/cursos', cursoController.getInstructorCourses);

// GET /api/instructor/cursos/:id/resumen — RF-16, RN-07: panel con métricas y embudo de caída
router.get(
  '/cursos/:id/resumen',
  schemaValidate(idParamSchema, 'params'),
  getObjectOr404(Curso),
  ownsCourse,
  instructorController.getCourseResumen,
);

export default router;
