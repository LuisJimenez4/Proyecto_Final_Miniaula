import * as panelService from '../services/panel.service.js';

export const getCourseResumen = async (req, res, next) => {
  const curso = req.object;
  const resumen = await panelService.getCourseResumen(curso.id);
  res.status(200).json(resumen);
};
