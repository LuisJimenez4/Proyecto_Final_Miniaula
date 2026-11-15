import * as leccionService from '../services/leccion.service.js';

export const getById = async (req, res, next) => {
  const leccion = req.object;
  const result = await leccionService.getLessonDetail(req.user, leccion, req.inscripcion);
  res.status(200).json(result);
};

export const create = async (req, res, next) => {
  const curso = req.object;
  const newLeccion = await leccionService.createLesson(curso.id, req.body);
  res.status(201).json(newLeccion);
};

export const update = async (req, res, next) => {
  const leccion = req.object;
  const updatedLeccion = await leccionService.updateLesson(leccion.id, req.body);
  res.status(200).json(updatedLeccion);
};

export const remove = async (req, res, next) => {
  const leccion = req.object;
  await leccionService.deleteLesson(leccion.id);
  res.status(204).end();
};

export const reorder = async (req, res, next) => {
  const curso = req.object;
  const lecciones = await leccionService.reorderLessons(curso.id, req.body.orden);
  res.status(200).json(lecciones);
};
