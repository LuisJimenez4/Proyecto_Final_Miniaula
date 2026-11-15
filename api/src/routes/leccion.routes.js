import { Router } from 'express';
import * as leccionController from '../controllers/leccion.controller.js';
import * as preguntaController from '../controllers/pregunta.controller.js';
import * as inscripcionController from '../controllers/inscripcion.controller.js';
import { Leccion } from '../models/index.js';
import { ROLES } from '../constants/index.js';
import getObjectOr404 from '../middlewares/getObjectOr404.middleware.js';
import userLoggedIn from '../middlewares/userLoggedIn.middleware.js';
import requireRole from '../middlewares/requireRole.middleware.js';
import ownsCourse from '../middlewares/ownsCourse.middleware.js';
import isEnrolled from '../middlewares/isEnrolled.middleware.js';
import lessonAccess from '../middlewares/lessonAccess.middleware.js';
import schemaValidate from '../middlewares/schemaValidate.middleware.js';
import { idParamSchema } from '../schemas/common.schema.js';
import { updateLeccionSchema } from '../schemas/leccion.schema.js';
import { createPreguntaSchema, submitIntentosSchema } from '../schemas/pregunta.schema.js';

const router = Router();

// GET /api/lecciones/:id — RF-10, RN-01, RN-02, RT-B03: estudiante inscrito (403 si bloqueada) o instructor dueño
router.get(
  '/:id',
  userLoggedIn,
  schemaValidate(idParamSchema, 'params'),
  getObjectOr404(Leccion),
  lessonAccess,
  leccionController.getById,
);

// PUT /api/lecciones/:id — RF-08, RN-07
router.put(
  '/:id',
  userLoggedIn,
  requireRole(ROLES.INSTRUCTOR),
  schemaValidate(idParamSchema, 'params'),
  getObjectOr404(Leccion),
  ownsCourse,
  schemaValidate(updateLeccionSchema),
  leccionController.update,
);

// DELETE /api/lecciones/:id — RF-08, RN-07
router.delete(
  '/:id',
  userLoggedIn,
  requireRole(ROLES.INSTRUCTOR),
  schemaValidate(idParamSchema, 'params'),
  getObjectOr404(Leccion),
  ownsCourse,
  leccionController.remove,
);

// POST /api/lecciones/:id/preguntas — RF-14, RN-02, RN-07
router.post(
  '/:id/preguntas',
  userLoggedIn,
  requireRole(ROLES.INSTRUCTOR),
  schemaValidate(idParamSchema, 'params'),
  getObjectOr404(Leccion),
  ownsCourse,
  schemaValidate(createPreguntaSchema),
  preguntaController.create,
);

// POST /api/lecciones/:id/completar — RF-12, RN-01, RT-B03
router.post(
  '/:id/completar',
  userLoggedIn,
  requireRole(ROLES.ESTUDIANTE),
  schemaValidate(idParamSchema, 'params'),
  getObjectOr404(Leccion),
  isEnrolled,
  inscripcionController.markComplete,
);

// POST /api/lecciones/:id/intentos — RF-15, RN-01, RN-02, RN-03, RT-B03
router.post(
  '/:id/intentos',
  userLoggedIn,
  requireRole(ROLES.ESTUDIANTE),
  schemaValidate(idParamSchema, 'params'),
  getObjectOr404(Leccion),
  isEnrolled,
  schemaValidate(submitIntentosSchema),
  inscripcionController.submitAttempt,
);

export default router;
