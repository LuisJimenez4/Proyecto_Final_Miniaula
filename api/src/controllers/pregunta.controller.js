import * as preguntaService from '../services/pregunta.service.js';

export const create = async (req, res, next) => {
  const leccion = req.object;
  const newPregunta = await preguntaService.createQuestion(leccion.id, req.body);
  res.status(201).json(newPregunta);
};

export const update = async (req, res, next) => {
  const pregunta = req.object;
  const updatedPregunta = await preguntaService.updateQuestion(pregunta.id, req.body);
  res.status(200).json(updatedPregunta);
};

export const remove = async (req, res, next) => {
  const pregunta = req.object;
  await preguntaService.deleteQuestion(pregunta.id);
  res.status(204).end();
};
