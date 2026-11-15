import swaggerUi from 'swagger-ui-express';
import auth from './paths/auth.js';
import usuarios from './paths/usuarios.js';
import cursos from './paths/cursos.js';
import lecciones from './paths/lecciones.js';
import preguntas from './paths/preguntas.js';
import inscripciones from './paths/inscripciones.js';
import instructor from './paths/instructor.js';
import sistema from './paths/sistema.js';

const fecha = { type: 'string', format: 'date-time' };

const schemas = {
  ErrorResponse: {
    type: 'object',
    properties: {
      error: {
        type: 'object',
        properties: {
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          message: { type: 'string', example: 'Datos de entrada inválidos' },
          details: { nullable: true, description: 'Lista de textos, objeto con datos extra o null', example: ['titulo: El título es obligatorio'] },
        },
      },
    },
  },
  Usuario: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      nombre: { type: 'string', example: 'Prof. García' },
      email: { type: 'string', example: 'garcia@miniaula.com' },
      rol: { type: 'string', enum: ['estudiante', 'instructor'] },
      creadoEn: fecha,
    },
  },
  Curso: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      titulo: { type: 'string', example: 'JavaScript Fundamentos' },
      descripcion: { type: 'string' },
      categoria: { type: 'string', example: 'Programación' },
      nivel: { type: 'string', enum: ['Básico', 'Intermedio', 'Avanzado'] },
      estado: { type: 'string', enum: ['borrador', 'publicado', 'archivado'] },
      instructorId: { type: 'integer' },
      totalLecciones: { type: 'integer', description: 'Solo en listados' },
      creadoEn: fecha,
    },
  },
  LeccionResumen: {
    type: 'object',
    description: 'Temario: nunca incluye contenido ni preguntas',
    properties: {
      id: { type: 'integer' },
      titulo: { type: 'string' },
      tipo: { type: 'string', enum: ['contenido', 'cuestionario'] },
      orden: { type: 'integer' },
    },
  },
  CursoDetalle: {
    allOf: [
      { $ref: '#/components/schemas/Curso' },
      {
        type: 'object',
        properties: {
          instructor: { type: 'object', properties: { id: { type: 'integer' }, nombre: { type: 'string' } } },
          lecciones: { type: 'array', items: { $ref: '#/components/schemas/LeccionResumen' } },
        },
      },
    ],
  },
  Leccion: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      titulo: { type: 'string' },
      tipo: { type: 'string', enum: ['contenido', 'cuestionario'] },
      contenido: { type: 'string', nullable: true },
      videoUrl: { type: 'string', nullable: true },
      orden: { type: 'integer' },
      notaMinima: { type: 'integer', nullable: true, description: 'Solo cuestionarios' },
      cursoId: { type: 'integer' },
    },
  },
  Pregunta: {
    type: 'object',
    description: 'Vista del estudiante: sin indiceCorrecto (RN-02)',
    properties: {
      id: { type: 'integer' },
      enunciado: { type: 'string' },
      opciones: { type: 'array', items: { type: 'string' } },
      leccionId: { type: 'integer' },
    },
  },
  PreguntaInstructor: {
    allOf: [
      { $ref: '#/components/schemas/Pregunta' },
      { type: 'object', properties: { indiceCorrecto: { type: 'integer', description: 'Solo para el instructor dueño' } } },
    ],
  },
  LeccionDetalle: {
    allOf: [
      { $ref: '#/components/schemas/Leccion' },
      {
        type: 'object',
        properties: {
          preguntas: { type: 'array', items: { $ref: '#/components/schemas/Pregunta' } },
          progreso: { $ref: '#/components/schemas/ProgresoLeccion' },
        },
      },
    ],
  },
  Inscripcion: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      estudianteId: { type: 'integer' },
      cursoId: { type: 'integer' },
      fechaInscripcion: fecha,
      completado: { type: 'boolean' },
    },
  },
  Progreso: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      inscripcionId: { type: 'integer' },
      leccionId: { type: 'integer' },
      completada: { type: 'boolean' },
      intentos: { type: 'integer' },
      mejorNota: { type: 'number', nullable: true },
    },
  },
  ProgresoLeccion: {
    type: 'object',
    properties: {
      leccionId: { type: 'integer' },
      titulo: { type: 'string' },
      tipo: { type: 'string' },
      orden: { type: 'integer' },
      desbloqueada: { type: 'boolean' },
      completada: { type: 'boolean' },
      intentos: { type: 'integer' },
      intentosRestantes: { type: 'integer', nullable: true, description: 'Solo cuestionarios (máximo 3)' },
      mejorNota: { type: 'number', nullable: true },
    },
  },
  ResultadoIntento: {
    type: 'object',
    properties: {
      nota: { type: 'integer', example: 100 },
      aprobado: { type: 'boolean' },
      notaMinima: { type: 'integer', example: 70 },
      intentos: { type: 'integer' },
      intentosRestantes: { type: 'integer' },
      mejorNota: { type: 'number' },
      completada: { type: 'boolean' },
    },
  },
};

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'MiniAula API',
    version: '1.0.0',
    description: 'API REST de MiniAula, plataforma de cursos cortos. Usuarios de prueba (contraseña password123): '
      + 'garcia@miniaula.com y martinez@miniaula.com (instructores); ana@, carlos@ y maria@estudiante.com (estudiantes).',
  },
  servers: [{ url: '/api', description: 'API local' }],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token obtenido en POST /auth/login',
      },
    },
    schemas,
  },
  paths: { ...sistema, ...auth, ...usuarios, ...cursos, ...lecciones, ...preguntas, ...inscripciones, ...instructor },
};

export { swaggerUi };
