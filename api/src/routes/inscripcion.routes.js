import { Router } from 'express';
import * as inscripcionController from '../controllers/inscripcion.controller.js';
import { ROLES } from '../constants/index.js';
import userLoggedIn from '../middlewares/userLoggedIn.middleware.js';
import requireRole from '../middlewares/requireRole.middleware.js';

const router = Router();

// GET /api/inscripciones/mias — RF-11, RN-08: inscripciones del estudiante autenticado con % de avance
router.get('/mias', userLoggedIn, requireRole(ROLES.ESTUDIANTE), inscripcionController.getMyEnrollments);

export default router;
