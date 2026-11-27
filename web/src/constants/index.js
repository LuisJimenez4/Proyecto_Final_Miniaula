// Valores de dominio compartidos; deben coincidir con los de la API (api/src/constants).

export const NIVELES = ['Básico', 'Intermedio', 'Avanzado'];

export const ESTADOS_CURSO = {
  BORRADOR: 'borrador',
  PUBLICADO: 'publicado',
  ARCHIVADO: 'archivado',
};

export const TIPOS_LECCION = {
  CONTENIDO: 'contenido',
  CUESTIONARIO: 'cuestionario',
};

export const ROLES = {
  ESTUDIANTE: 'estudiante',
  INSTRUCTOR: 'instructor',
};

/** Lista única para el filtro del catálogo y el editor de cursos. */
export const CATEGORIAS = [
  'Programación',
  'Diseño',
  'Negocios',
  'Marketing',
  'Ciencia de Datos',
  'Inteligencia Artificial',
  'Idiomas',
  'Habilidades Blandas',
];

export const CATALOGO_PAGE_SIZE = 9;

export const NOTA_MINIMA_DEFAULT = 70;

/** Códigos de error de la API con los que la interfaz decide qué mostrar. */
export const ERROR_CODES = {
  LESSON_LOCKED: 'LESSON_LOCKED',
  NOT_ENROLLED: 'NOT_ENROLLED',
  ALREADY_ENROLLED: 'ALREADY_ENROLLED',
  MAX_ATTEMPTS_REACHED: 'MAX_ATTEMPTS_REACHED',
  COURSE_EMPTY: 'COURSE_EMPTY',
  QUIZ_WITHOUT_QUESTIONS: 'QUIZ_WITHOUT_QUESTIONS',
  COURSE_HAS_STUDENTS: 'COURSE_HAS_STUDENTS',
  COURSE_NOT_FOUND: 'COURSE_NOT_FOUND',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_LESSON_ORDER: 'INVALID_LESSON_ORDER',
  LESSON_NOT_CONTENT: 'LESSON_NOT_CONTENT',
  LESSON_NOT_QUIZ: 'LESSON_NOT_QUIZ',
  FORBIDDEN_NOT_OWNER: 'FORBIDDEN_NOT_OWNER',
  RATE_LIMIT: 'RATE_LIMIT',
  NETWORK_ERROR: 'NETWORK_ERROR',
};
