import * as cursoService from '../services/curso.service.js';

export const getAll = async (req, res, next) => {
  const query = req.validated.query;
  const cursos = await cursoService.getPublishedCourses(query);
  res.status(200).json(cursos);
};

export const getById = async (req, res, next) => {
  const curso = req.object;
  const result = await cursoService.getCourseDetail(curso.id, req.user);
  res.status(200).json(result);
};

export const getInstructorCourses = async (req, res, next) => {
  const cursos = await cursoService.getInstructorCourses(req.user.id);
  res.status(200).json(cursos);
};

export const create = async (req, res, next) => {
  const newCurso = await cursoService.createCourse(req.user.id, req.body);
  res.status(201).json(newCurso);
};

export const update = async (req, res, next) => {
  const curso = req.object;
  const updatedCurso = await cursoService.updateCourse(curso.id, req.body);
  res.status(200).json(updatedCurso);
};

export const updateEstado = async (req, res, next) => {
  const curso = req.object;
  const updatedCurso = await cursoService.updateCourseStatus(curso.id, req.body.estado);
  res.status(200).json(updatedCurso);
};

export const remove = async (req, res, next) => {
  const curso = req.object;
  await cursoService.deleteCourse(curso.id);
  res.status(204).end();
};
