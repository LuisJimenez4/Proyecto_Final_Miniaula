import { BEARER, errores, idParam, jsonBody, ok, ref, lista } from '../helpers.js';

const CATALOGO = 'Cursos';
const INSTRUCTOR = 'Cursos (instructor)';

const datosCurso = {
  titulo: { type: 'string', minLength: 3, maxLength: 200 },
  descripcion: { type: 'string', minLength: 10 },
  categoria: { type: 'string' },
  nivel: { type: 'string', enum: ['Básico', 'Intermedio', 'Avanzado'] },
};
const ejemploCurso = {
  titulo: 'Node.js desde cero',
  descripcion: 'Aprende a construir APIs con Node.js y Express.',
  categoria: 'Programación',
  nivel: 'Básico',
};

const query = (name, description, schema) => ({ name, in: 'query', description, schema });

export default {
  '/cursos': {
    get: {
      tags: [CATALOGO],
      summary: 'Catálogo público: solo cursos publicados (RF-04, RN-05)',
      parameters: [
        query('q', 'Busca en título y descripción', { type: 'string' }),
        query('categoria', 'Categoría exacta', { type: 'string' }),
        query('nivel', 'Nivel', { type: 'string', enum: ['Básico', 'Intermedio', 'Avanzado'] }),
        query('page', 'Página (≥ 1)', { type: 'integer', default: 1 }),
        query('limit', 'Tamaño de página (1-50)', { type: 'integer', default: 10 }),
      ],
      responses: {
        200: ok('Página de cursos', {
          type: 'object',
          properties: {
            cursos: lista('Curso'),
            total: { type: 'integer' },
            page: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        }),
        ...errores(400),
      },
    },
    post: {
      tags: [INSTRUCTOR],
      summary: 'Crear un curso en borrador (RF-06)',
      security: BEARER,
      requestBody: jsonBody({ type: 'object', required: ['titulo', 'descripcion', 'categoria'], properties: datosCurso }, ejemploCurso),
      responses: { 201: ok('Curso creado', ref('Curso')), ...errores(400, 401, 403) },
    },
  },
  '/cursos/{id}': {
    get: {
      tags: [CATALOGO],
      summary: 'Detalle del curso con temario SIN contenido ni preguntas (RF-05). '
        + 'Si es borrador/archivado solo lo ve su instructor dueño (enviando token); para el resto es 404',
      parameters: [idParam()],
      responses: { 200: ok('Curso con lecciones (id, titulo, tipo, orden)', ref('CursoDetalle')), ...errores(400, 404) },
    },
    put: {
      tags: [INSTRUCTOR],
      summary: 'Editar el curso; exige el objeto completo (RF-06, RN-07)',
      security: BEARER,
      parameters: [idParam()],
      requestBody: jsonBody({ type: 'object', required: ['titulo', 'descripcion', 'categoria', 'nivel'], properties: datosCurso }, ejemploCurso),
      responses: { 200: ok('Curso actualizado', ref('Curso')), ...errores(400, 401, 403, 404) },
    },
    delete: {
      tags: [INSTRUCTOR],
      summary: 'Eliminar un curso sin inscritos (RF-06, RN-06). Con inscritos se archiva',
      security: BEARER,
      parameters: [idParam()],
      responses: { 204: ok('Eliminado, sin cuerpo'), ...errores(400, 401, 403, 404, 409) },
    },
  },
  '/cursos/{id}/estado': {
    patch: {
      tags: [INSTRUCTOR],
      summary: 'Publicar, archivar o devolver a borrador (RF-07, RN-05). Publicar exige ≥ 1 lección y '
        + 'cuestionarios con preguntas (regla añadida)',
      security: BEARER,
      parameters: [idParam()],
      requestBody: jsonBody(
        { type: 'object', required: ['estado'], properties: { estado: { type: 'string', enum: ['borrador', 'publicado', 'archivado'] } } },
        { estado: 'publicado' },
      ),
      responses: { 200: ok('Curso con el nuevo estado', ref('Curso')), ...errores(400, 401, 403, 404, 422) },
    },
  },
  '/cursos/{id}/lecciones': {
    post: {
      tags: ['Lecciones (instructor)'],
      summary: 'Crear una lección al final del curso (RF-08, RN-07)',
      security: BEARER,
      parameters: [idParam()],
      requestBody: jsonBody(
        {
          type: 'object',
          required: ['titulo', 'tipo'],
          properties: {
            titulo: { type: 'string' },
            tipo: { type: 'string', enum: ['contenido', 'cuestionario'] },
            contenido: { type: 'string', description: 'Obligatorio si tipo = contenido' },
            videoUrl: { type: 'string', nullable: true },
            notaMinima: { type: 'integer', minimum: 0, maximum: 100, description: 'Solo cuestionarios (por defecto 70)' },
          },
        },
        { titulo: 'Introducción', tipo: 'contenido', contenido: 'Bienvenido al curso' },
      ),
      responses: { 201: ok('Lección creada', ref('Leccion')), ...errores(400, 401, 403, 404) },
    },
  },
  '/cursos/{id}/lecciones/orden': {
    patch: {
      tags: ['Lecciones (instructor)'],
      summary: 'Reordenar con la lista COMPLETA de ids, sin repetidos (RF-09). RN-01 usa siempre el orden actual',
      security: BEARER,
      parameters: [idParam()],
      requestBody: jsonBody(
        { type: 'object', required: ['orden'], properties: { orden: { type: 'array', items: { type: 'integer' } } } },
        { orden: [3, 1, 2] },
      ),
      responses: { 200: ok('Temario en el nuevo orden', { type: 'array', items: ref('LeccionResumen') }), ...errores(400, 401, 403, 404) },
    },
  },
  '/cursos/{id}/inscripcion': {
    post: {
      tags: ['Inscripciones y progreso'],
      summary: 'Inscribirse en un curso publicado (RF-11, RN-04)',
      security: BEARER,
      parameters: [idParam()],
      responses: { 201: ok('Inscripción creada', ref('Inscripcion')), ...errores(400, 401, 403, 404, 409) },
    },
  },
  '/cursos/{id}/progreso': {
    get: {
      tags: ['Inscripciones y progreso'],
      summary: 'Progreso propio: todas las lecciones con desbloqueo, intentos y mejor nota; sin contenido (RF-13, RN-01, RN-08)',
      security: BEARER,
      parameters: [idParam()],
      responses: { 200: ok('Estado de cada lección', { type: 'array', items: ref('ProgresoLeccion') }), ...errores(400, 401, 403, 404) },
    },
  },
};
