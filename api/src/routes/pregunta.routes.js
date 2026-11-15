import { Router } from 'express';
import * as preguntaController from '../controllers/pregunta.controller.js';
import { Pregunta } from '../models/index.js';
import { ROLES } from '../constants/index.js';
import getObjectOr404 from '../middlewares/getObjectOr404.middleware.js';
import userLoggedIn from '../middlewares/userLoggedIn.middleware.js';
import requireRole from '../middlewares/requireRole.middleware.js';
import ownsCourse from '../middlewares/ownsCourse.middleware.js';
import schemaValidate from '../middlewares/schemaValidate.middleware.js';
import { idParamSchema } from '../schemas/common.schema.js';
import { updatePreguntaSchema } from '../schemas/pregunta.schema.js';

const router = Router();

// PUT /api/preguntas/:id — RF-14, RN-02, RN-07
router.put(
  '/:id',
  userLoggedIn,
  requireRole(ROLES.INSTRUCTOR),
  schemaValidate(idParamSchema, 'params'),
  getObjectOr404(Pregunta),
  ownsCourse,
  schemaValidate(updatePreguntaSchema),
  preguntaController.update,
);

// DELETE /api/preguntas/:id — RF-14, RN-07
router.delete(
  '/:id',
  userLoggedIn,
  requireRole(ROLES.INSTRUCTOR),
  schemaValidate(idParamSchema, 'params'),
  getObjectOr404(Pregunta),
  ownsCourse,
  preguntaController.remove,
);

export default router;
