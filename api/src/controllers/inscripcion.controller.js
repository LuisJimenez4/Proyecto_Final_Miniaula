import * as inscripcionService from '../services/inscripcion.service.js';
import * as progresoService from '../services/progreso.service.js';

export const enroll = async (req, res, next) => {
  const curso = req.object;
  const result = await inscripcionService.enrollStudent(req.user.id, curso.id);
  res.status(201).json(result);
};

export const getMyEnrollments = async (req, res, next) => {
  const inscripciones = await inscripcionService.getStudentEnrollments(req.user.id);
  res.status(200).json(inscripciones);
};

export const getProgress = async (req, res, next) => {
  const curso = req.object;
  const progreso = await progresoService.getStudentProgress(req.inscripcion.id, curso.id);
  res.status(200).json(progreso);
};

export const markComplete = async (req, res, next) => {
  const leccion = req.object;
  const result = await progresoService.markLessonComplete(req.inscripcion.id, leccion);
  res.status(200).json(result);
};

export const submitAttempt = async (req, res, next) => {
  const leccion = req.object;
  const result = await progresoService.submitQuizAttempt(req.inscripcion.id, leccion, req.body.respuestas);
  res.status(201).json(result);
};
