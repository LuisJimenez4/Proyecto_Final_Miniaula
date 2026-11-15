import { Pregunta, Leccion, Curso } from '../models/index.js';
import AppError from '../errors/AppError.js';
import { ESTADOS_CURSO, TIPOS_LECCION } from '../constants/index.js';

const questionNotFound = () => new AppError(404, 'QUESTION_NOT_FOUND', 'Pregunta no encontrada');

/** RF-14: las preguntas solo existen en lecciones de tipo cuestionario. */
export async function createQuestion(leccionId, data) {
  const leccion = await Leccion.findByPk(leccionId);
  if (!leccion) throw new AppError(404, 'LESSON_NOT_FOUND', 'Lección no encontrada');
  if (leccion.tipo !== TIPOS_LECCION.CUESTIONARIO) {
    throw new AppError(422, 'LESSON_NOT_QUIZ', 'Solo se pueden añadir preguntas a lecciones de tipo cuestionario');
  }
  return Pregunta.create({ ...data, leccionId });
}

/** RF-14, RN-02: PUT con el objeto completo (el índice ya se validó contra las opciones). */
export async function updateQuestion(questionId, data) {
  const pregunta = await Pregunta.findByPk(questionId);
  if (!pregunta) throw questionNotFound();
  return pregunta.update(data);
}

/** Regla añadida: un cuestionario de un curso publicado no puede quedarse sin preguntas. */
const assertNotLastOfPublishedQuiz = async (pregunta) => {
  const leccion = await Leccion.findByPk(pregunta.leccionId);
  const curso = await Curso.findByPk(leccion.cursoId);
  if (curso.estado !== ESTADOS_CURSO.PUBLICADO) return;

  const total = await Pregunta.count({ where: { leccionId: pregunta.leccionId } });
  if (total <= 1) {
    throw new AppError(422, 'QUIZ_WITHOUT_QUESTIONS',
      'No se puede eliminar la última pregunta de un cuestionario de un curso publicado');
  }
};

/** RF-14: elimina una pregunta. */
export async function deleteQuestion(questionId) {
  const pregunta = await Pregunta.findByPk(questionId);
  if (!pregunta) throw questionNotFound();
  await assertNotLastOfPublishedQuiz(pregunta);
  await pregunta.destroy();
}
