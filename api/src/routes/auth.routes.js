import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import schemaValidate from '../middlewares/schemaValidate.middleware.js';
import rateLimiter from '../middlewares/rateLimiter.middleware.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post('/register', schemaValidate(registerSchema), authController.register);
router.post('/login', rateLimiter, schemaValidate(loginSchema), authController.login);

export default router;
