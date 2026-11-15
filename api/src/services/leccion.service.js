import { Leccion, Pregunta, Curso } from '../models/index.js';
import sequelize from '../config/db.config.js';
import AppError from '../errors/AppError.js';
import { ESTADOS_CURSO, NOTA_MINIMA_DEFAULT, ROLES, TIPOS_LECCION } from '../constants/index.js';
import * as progresoService from './progreso.service.js';

const lessonNotFound = () => new AppError(404, 'LESSON_NOT_FOUND', 'Lección no encontrada');

const STUDENT_QUESTION_FIELDS = ['id', 'enunciado', 'opciones', 'leccionId'];

const findLessonWithQuestions = (lessonId, { withAnswers }) =>
  Leccion.findByPk(lessonId, {
    include: [{
      model: Pregunta,
      as: 'preguntas',
      attributes: withAnswers ? undefined : STUDENT_QUESTION_FIELDS,
    }],
    order: [[{ model: Pregunta, as: 'preguntas' }, 'id', 'ASC']],
  });

/**
 * RF-10, RN-01, RN-02, RT-B03: lección completa para quien ya pasó el middleware de acceso.
 * Estudiante inscrito: 403 LESSON_LOCKED si está bloqueada y preguntas SIN indiceCorrecto.
 * Instructor dueño (ADR-07): contenido y preguntas con indiceCorrecto, para el editor.
 */
export async function getLessonDetail(user, leccion, inscripcion) {
  if (user.rol === ROLES.INSTRUCTOR) {
    return findLessonWithQuestions(leccion.id, { withAnswers: true });
  }

  await progresoService.checkLessonUnlocked(inscripcion.id, leccion);
  const [detalle, progreso] = await Promise.all([
    findLessonWithQuestions(leccion.id, { withAnswers: false }),
    progresoService.getLessonProgress(inscripcion.id, leccion),
  ]);
  return { ...detalle.toJSON(), progreso };
}

const resolveNotaMinima = (tipo, notaMinima) =>
  tipo === TIPOS_LECCION.CUESTIONARIO ? (notaMinima ?? NOTA_MINIMA_DEFAULT) : null;

/** RF-08: crea una lección al final del curso (orden automático) y recalcula `completado` de los inscritos. */
export async function createLesson(cursoId, data) {
  return sequelize.transaction(async (transaction) => {
    const maxOrden = await Leccion.max('orden', { where: { cursoId }, transaction });
    const leccion = await Leccion.create({
      ...data,
      notaMinima: resolveNotaMinima(data.tipo, data.notaMinima),
      cursoId,
      orden: (maxOrden || 0) + 1,
    }, { transaction });

    await progresoService.refreshCourseCompletion(cursoId, transaction);
    return leccion;
  });
}

const assertContentPresent = (leccion, data) => {
  if (leccion.tipo === TIPOS_LECCION.CONTENIDO && !data.contenido) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Datos de entrada inválidos',
      ['contenido: El contenido es obligatorio para lecciones de tipo contenido']);
  }
};

/** RF-08: edita la lección completa; el tipo no cambia. */
export async function updateLesson(lessonId, data) {
  const leccion = await Leccion.findByPk(lessonId);
  if (!leccion) throw lessonNotFound();
  assertContentPresent(leccion, data);

  return leccion.update({
    titulo: data.titulo,
    contenido: data.contenido ?? null,
    videoUrl: data.videoUrl ?? null,
    notaMinima: resolveNotaMinima(leccion.tipo, data.notaMinima ?? leccion.notaMinima),
  });
}

/** Regla añadida (RN-05): un curso publicado no puede quedarse sin lecciones. */
const assertNotLastOfPublishedCourse = async (leccion) => {
  const curso = await Curso.findByPk(leccion.cursoId);
  if (curso.estado !== ESTADOS_CURSO.PUBLICADO) return;

  const total = await Leccion.count({ where: { cursoId: leccion.cursoId } });
  if (total <= 1) {
    throw new AppError(422, 'COURSE_EMPTY',
      'No se puede eliminar la última lección de un curso publicado; archívalo o añade otra lección antes');
  }
};

/**
 * RF-08: elimina la lección (y su progreso en cascada), cierra el hueco de orden y recalcula
 * `completado` de los inscritos, todo dentro de una transacción.
 */
export async function deleteLesson(lessonId) {
  const leccion = await Leccion.findByPk(lessonId);
  if (!leccion) throw lessonNotFound();
  await assertNotLastOfPublishedCourse(leccion);

  await sequelize.transaction(async (transaction) => {
    const { cursoId, orden } = leccion;
    await leccion.destroy({ transaction });
    await Leccion.update(
      { orden: sequelize.literal('orden - 1') },
      { where: { cursoId, orden: { [sequelize.Sequelize.Op.gt]: orden } }, transaction },
    );
    await progresoService.refreshCourseCompletion(cursoId, transaction);
  });
}

const assertSameLessons = (lecciones, ordenIds) => {
  const existentes = new Set(lecciones.map((l) => l.id));
  const completa = ordenIds.length === existentes.size && ordenIds.every((id) => existentes.has(id));
  if (!completa) {
    throw new AppError(400, 'INVALID_LESSON_ORDER',
      'La lista debe contener exactamente todas las lecciones del curso, sin repetir ni añadir otras');
  }
};

/**
 * RF-09: reordena con la lista completa de ids. RN-01 se evalúa siempre con el orden actual,
 * así que el desbloqueo de quienes ya avanzaron se recalcula con el nuevo orden.
 */
export async function reorderLessons(cursoId, ordenIds) {
  const lecciones = await Leccion.findAll({ where: { cursoId }, attributes: ['id'] });
  assertSameLessons(lecciones, ordenIds);

  await sequelize.transaction(async (transaction) => {
    for (const [index, id] of ordenIds.entries()) {
      await Leccion.update({ orden: index + 1 }, { where: { id, cursoId }, transaction });
    }
  });

  return Leccion.findAll({ where: { cursoId }, attributes: ['id', 'titulo', 'tipo', 'orden'], order: [['orden', 'ASC']] });
}
