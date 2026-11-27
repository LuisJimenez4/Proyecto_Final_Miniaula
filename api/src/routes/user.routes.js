import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import userLoggedIn from '../middlewares/userLoggedIn.middleware.js';
import schemaValidate from '../middlewares/schemaValidate.middleware.js';
import { updateProfileSchema } from '../schemas/user.schema.js';

const router = Router();

// GET /api/users/me — RF-03
router.get('/me', userLoggedIn, userController.getProfile);
// PUT /api/users/me — RF-03 (contraseña opcional)
router.put('/me', userLoggedIn, schemaValidate(updateProfileSchema), userController.updateProfile);

export default router;
