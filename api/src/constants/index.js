// Valores fijos del dominio (sin números ni textos mágicos repartidos por el código).

export const ROLES = Object.freeze({
  ESTUDIANTE: 'estudiante',
  INSTRUCTOR: 'instructor',
});

export const ESTADOS_CURSO = Object.freeze({
  BORRADOR: 'borrador',
  PUBLICADO: 'publicado',
  ARCHIVADO: 'archivado',
});

export const NIVELES = Object.freeze({
  BASICO: 'Básico',
  INTERMEDIO: 'Intermedio',
  AVANZADO: 'Avanzado',
});

export const TIPOS_LECCION = Object.freeze({
  CONTENIDO: 'contenido',
  CUESTIONARIO: 'cuestionario',
});

/** RN-03: máximo de intentos por cuestionario. */
export const MAX_INTENTOS = 3;

export const NOTA_MINIMA_DEFAULT = 70;

export const PAGINACION = Object.freeze({
  PAGE_DEFAULT: 1,
  LIMIT_DEFAULT: 10,
  LIMIT_MAX: 50,
});

/** Ventana del rate limit de login (RT-B06). */
export const LOGIN_RATE_WINDOW_MS = 15 * 60 * 1000;

/** Lista de valores de una constante, útil para z.enum y ENUM de Sequelize. */
export const valoresDe = (constante) => Object.values(constante);
