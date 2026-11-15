import { Progreso, Leccion, Inscripcion, Pregunta } from '../models/index.js';
import sequelize from '../config/db.config.js';
import AppError from '../errors/AppError.js';
import { MAX_INTENTOS, TIPOS_LECCION } from '../constants/index.js';
import { calculateScore } from '../utils/score.js';

const getOrderedLessons = (cursoId, options = {}) =>
  Leccion.findAll({ where: { cursoId }, order: [['orden', 'ASC']], ...options });

const lockedError = () =>
  new AppError(403, 'LESSON_LOCKED', 'Debes completar o aprobar la lección anterior para desbloquear esta lección');

/**
 * RN-01: la primera lección siempre está abierta; las demás exigen la anterior completada
 * (aprobada si es cuestionario), según el orden actual del curso.
 */
export async function checkLessonUnlocked(inscripcionId, leccion) {
  const lecciones = await getOrderedLessons(leccion.cursoId);
  const index = lecciones.findIndex((l) => l.id === leccion.id);
  if (index <= 0) return true;

  const anterior = await Progreso.findOne({ where: { inscripcionId, leccionId: lecciones[index - 1].id } });
  if (!anterior?.completada) throw lockedError();
  return true;
}

const assertType = (leccion, tipo, code, message) => {
  if (leccion.tipo !== tipo) throw new AppError(422, code, message);
};

const lockProgress = async (inscripcionId, leccionId, transaction) => {
  await Progreso.findOrCreate({
    where: { inscripcionId, leccionId },
    defaults: { completada: false, intentos: 0, mejorNota: null },
    transaction,
  });
  return Progreso.findOne({ where: { inscripcionId, leccionId }, transaction, lock: transaction.LOCK.UPDATE });
};

/** Recalcula Inscripcion.completado: verdadero solo si todas las lecciones del curso están completadas. */
export async function updateEnrollmentCompletion(inscripcionId, transaction) {
  const inscripcion = await Inscripcion.findByPk(inscripcionId, { transaction });
  if (!inscripcion) return;

  const total = await Leccion.count({ where: { cursoId: inscripcion.cursoId }, transaction });
  const completadas = await Progreso.count({ where: { inscripcionId, completada: true }, transaction });
  await inscripcion.update({ completado: total > 0 && completadas >= total }, { transaction });
}

/** Recalcula `completado` de todos los inscritos de un curso (al añadir o borrar lecciones). */
export async function refreshCourseCompletion(cursoId, transaction) {
  const inscripciones = await Inscripcion.findAll({ where: { cursoId }, attributes: ['id'], transaction });
  for (const { id } of inscripciones) {
    await updateEnrollmentCompletion(id, transaction);
  }
}

/** RF-12 / RN-01: completa una lección de tipo contenido (idempotente). */
export async function markLessonComplete(inscripcionId, leccion) {
  assertType(leccion, TIPOS_LECCION.CONTENIDO, 'LESSON_NOT_CONTENT',
    'Solo las lecciones de contenido se completan; los cuestionarios se aprueban con un intento');
  await checkLessonUnlocked(inscripcionId, leccion);

  return sequelize.transaction(async (transaction) => {
    const progreso = await lockProgress(inscripcionId, leccion.id, transaction);
    await progreso.update({ completada: true, actualizadoEn: new Date() }, { transaction });
    await updateEnrollmentCompletion(inscripcionId, transaction);
    return progreso;
  });
}

const loadQuiz = async (leccion) => {
  assertType(leccion, TIPOS_LECCION.CUESTIONARIO, 'LESSON_NOT_QUIZ', 'Solo los cuestionarios admiten intentos');
  const preguntas = await Pregunta.findAll({ where: { leccionId: leccion.id } });
  if (preguntas.length === 0) {
    throw new AppError(422, 'QUIZ_WITHOUT_QUESTIONS', 'Este cuestionario todavía no tiene preguntas');
  }
  return preguntas;
};

/** RN-03: aplica un intento; guarda la mejor nota y completa la lección si alcanza la nota mínima. */
const applyAttempt = async (progreso, leccion, nota, transaction) => {
  const mejorNota = progreso.mejorNota === null ? nota : Math.max(progreso.mejorNota, nota);
  await progreso.update({
    intentos: progreso.intentos + 1,
    mejorNota,
    completada: progreso.completada || mejorNota >= leccion.notaMinima,
    actualizadoEn: new Date(),
  }, { transaction });
};

/** RN-02, RN-03: envía un intento de cuestionario (máx. 3) y devuelve la nota calculada en el servidor. */
export async function submitQuizAttempt(inscripcionId, leccion, respuestas) {
  const preguntas = await loadQuiz(leccion);
  await checkLessonUnlocked(inscripcionId, leccion);

  return sequelize.transaction(async (transaction) => {
    const progreso = await lockProgress(inscripcionId, leccion.id, transaction);
    if (progreso.intentos >= MAX_INTENTOS) {
      throw new AppError(403, 'MAX_ATTEMPTS_REACHED',
        `Has alcanzado el límite máximo de ${MAX_INTENTOS} intentos para este cuestionario`);
    }

    const nota = calculateScore(preguntas, respuestas);
    await applyAttempt(progreso, leccion, nota, transaction);
    await updateEnrollmentCompletion(inscripcionId, transaction);

    return {
      nota,
      aprobado: nota >= leccion.notaMinima,
      notaMinima: leccion.notaMinima,
      intentos: progreso.intentos,
      intentosRestantes: MAX_INTENTOS - progreso.intentos,
      mejorNota: progreso.mejorNota,
      completada: progreso.completada,
    };
  });
}

const isUnlocked = (lecciones, index, progresoMap) =>
  index === 0 || progresoMap.get(lecciones[index - 1].id)?.completada === true;

const toProgressItem = (leccion, desbloqueada, progreso) => ({
  leccionId: leccion.id,
  titulo: leccion.titulo,
  tipo: leccion.tipo,
  orden: leccion.orden,
  desbloqueada,
  completada: progreso?.completada ?? false,
  intentos: progreso?.intentos ?? 0,
  intentosRestantes: leccion.tipo === TIPOS_LECCION.CUESTIONARIO ? MAX_INTENTOS - (progreso?.intentos ?? 0) : null,
  mejorNota: progreso?.mejorNota ?? null,
});

/** RF-13, RN-01, RN-08: todas las lecciones del curso con su estado; nunca incluye contenido ni respuestas. */
export async function getStudentProgress(inscripcionId, cursoId) {
  const lecciones = await getOrderedLessons(cursoId, { attributes: ['id', 'titulo', 'tipo', 'orden'] });
  const progresos = await Progreso.findAll({ where: { inscripcionId } });
  const progresoMap = new Map(progresos.map((p) => [p.leccionId, p]));

  return lecciones.map((leccion, index) =>
    toProgressItem(leccion, isUnlocked(lecciones, index, progresoMap), progresoMap.get(leccion.id)));
}

/** Estado de una sola lección para el estudiante (intentos y mejor nota). */
export async function getLessonProgress(inscripcionId, leccion) {
  const progreso = await Progreso.findOne({ where: { inscripcionId, leccionId: leccion.id } });
  return toProgressItem(leccion, true, progreso);
}
