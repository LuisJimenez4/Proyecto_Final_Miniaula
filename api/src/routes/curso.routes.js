import { Router } from 'express';
import * as cursoController from '../controllers/curso.controller.js';
import * as inscripcionController from '../controllers/inscripcion.controller.js';
import * as leccionController from '../controllers/leccion.controller.js';
import { Curso } from '../models/index.js';
import { ROLES } from '../constants/index.js';
import getObjectOr404 from '../middlewares/getObjectOr404.middleware.js';
import userLoggedIn from '../middlewares/userLoggedIn.middleware.js';
import optionalUser from '../middlewares/optionalUser.middleware.js';
import requireRole from '../middlewares/requireRole.middleware.js';
import ownsCourse from '../middlewares/ownsCourse.middleware.js';
import isEnrolled from '../middlewares/isEnrolled.middleware.js';
import schemaValidate from '../middlewares/schemaValidate.middleware.js';
import { idParamSchema } from '../schemas/common.schema.js';
import {
  cursoQuerySchema,
  createCursoSchema,
  updateCursoSchema,
  updateEstadoCursoSchema,
} from '../schemas/curso.schema.js';
import { createLeccionSchema, reorderLeccionesSchema } from '../schemas/leccion.schema.js';

const router = Router();

// GET /api/cursos — RF-04, RN-05: catálogo público (solo publicados) con q, categoria, page, limit
router.get('/', schemaValidate(cursoQuerySchema, 'query'), cursoController.getAll);

// POST /api/cursos — RF-06: crear curso (borrador)
router.post(
  '/',
  userLoggedIn,
  requireRole(ROLES.INSTRUCTOR),
  schemaValidate(createCursoSchema),
  cursoController.create,
);

// GET /api/cursos/:id — RF-05, RN-05: temario sin contenido (sesión opcional: el instructor dueño ve sus borradores)
router.get(
  '/:id',
  optionalUser,
  schemaValidate(idParamSchema, 'params'),
  getObjectOr404(Curso),
  cursoController.getById,
);

// PUT /api/cursos/:id — RF-06, RN-07
router.put(
  '/:id',
  userLoggedIn,
  requireRole(ROLES.INSTRUCTOR),
  schemaValidate(idParamSchema, 'params'),
  getObjectOr404(Curso),
  ownsCourse,
  schemaValidate(updateCursoSchema),
  cursoController.update,
);

// DELETE /api/cursos/:id — RF-06, RN-06, RN-07
router.delete(
  '/:id',
  userLoggedIn,
  requireRole(ROLES.INSTRUCTOR),
  schemaValidate(idParamSchema, 'params'),
  getObjectOr404(Curso),
  ownsCourse,
  cursoController.remove,
);

// PATCH /api/cursos/:id/estado — RF-07, RN-05, RN-07
router.patch(
  '/:id/estado',
  userLoggedIn,
  requireRole(ROLES.INSTRUCTOR),
  schemaValidate(idParamSchema, 'params'),
  getObjectOr404(Curso),
  ownsCourse,
  schemaValidate(updateEstadoCursoSchema),
  cursoController.updateEstado,
);

// POST /api/cursos/:id/lecciones — RF-08, RN-07
router.post(
  '/:id/lecciones',
  userLoggedIn,
  requireRole(ROLES.INSTRUCTOR),
  schemaValidate(idParamSchema, 'params'),
  getObjectOr404(Curso),
  ownsCourse,
  schemaValidate(createLeccionSchema),
  leccionController.create,
);

// PATCH /api/cursos/:id/lecciones/orden — RF-09, RN-07
router.patch(
  '/:id/lecciones/orden',
  userLoggedIn,
  requireRole(ROLES.INSTRUCTOR),
  schemaValidate(idParamSchema, 'params'),
  getObjectOr404(Curso),
  ownsCourse,
  schemaValidate(reorderLeccionesSchema),
  leccionController.reorder,
);

// POST /api/cursos/:id/inscripcion — RF-11, RN-04
router.post(
  '/:id/inscripcion',
  userLoggedIn,
  requireRole(ROLES.ESTUDIANTE),
  schemaValidate(idParamSchema, 'params'),
  getObjectOr404(Curso),
  inscripcionController.enroll,
);

// GET /api/cursos/:id/progreso — RF-13, RN-01, RN-08
router.get(
  '/:id/progreso',
  userLoggedIn,
  requireRole(ROLES.ESTUDIANTE),
  schemaValidate(idParamSchema, 'params'),
  getObjectOr404(Curso),
  isEnrolled,
  inscripcionController.getProgress,
);

export default router;
