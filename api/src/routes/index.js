import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import cursoRoutes from './curso.routes.js';
import leccionRoutes from './leccion.routes.js';
import preguntaRoutes from './pregunta.routes.js';
import inscripcionRoutes from './inscripcion.routes.js';
import instructorRoutes from './instructor.routes.js';
import { swaggerUi, swaggerSpec } from '../docs/swagger.js';

const router = Router();

// Endpoint de verificación de salud
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Documentación interactiva Swagger UI en /api/docs (RT-B10)
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Módulos de la API REST
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cursos', cursoRoutes);
router.use('/lecciones', leccionRoutes);
router.use('/preguntas', preguntaRoutes);
router.use('/inscripciones', inscripcionRoutes);
router.use('/instructor', instructorRoutes);

export default router;
