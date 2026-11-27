import { Inscripcion, Curso, Usuario, Leccion, Progreso } from '../models/index.js';
import AppError from '../errors/AppError.js';
import { ESTADOS_CURSO } from '../constants/index.js';

/** RN-04: un estudiante no puede inscribirse dos veces (409). */
export async function enrollStudent(estudianteId, cursoId) {
  const curso = await Curso.findByPk(cursoId);
  if (!curso) {
    throw new AppError(404, 'COURSE_NOT_FOUND', 'Curso no encontrado');
  }
  if (curso.estado !== ESTADOS_CURSO.PUBLICADO) {
    throw new AppError(422, 'COURSE_NOT_PUBLISHED', 'Solo puedes inscribirte en cursos publicados');
  }

  const existing = await Inscripcion.findOne({ where: { estudianteId, cursoId } });
  if (existing) {
    throw new AppError(409, 'ALREADY_ENROLLED', 'Ya estás inscrito en este curso');
  }

  return Inscripcion.create({ estudianteId, cursoId });
}

const withProgressPercentage = (inscripcion) => {
  const data = inscripcion.toJSON();
  const totalLecciones = data.curso?.lecciones?.length || 0;
  const completadas = data.progresos?.filter((p) => p.completada).length || 0;
  const progresoPorcentaje = totalLecciones > 0 ? Math.round((completadas / totalLecciones) * 100) : 0;

  delete data.curso.lecciones;
  delete data.progresos;
  return { ...data, progresoPorcentaje, completadas, totalLecciones };
};

/** RF-11, RN-08: inscripciones del estudiante autenticado con su porcentaje de avance. */
export async function getStudentEnrollments(estudianteId) {
  const inscripciones = await Inscripcion.findAll({
    where: { estudianteId },
    include: [
      {
        model: Curso,
        as: 'curso',
        attributes: ['id', 'titulo', 'descripcion', 'categoria', 'nivel', 'estado'],
        include: [
          { model: Usuario, as: 'instructor', attributes: ['nombre'] },
          { model: Leccion, as: 'lecciones', attributes: ['id'] },
        ],
      },
      { model: Progreso, as: 'progresos', attributes: ['leccionId', 'completada'] },
    ],
    order: [['fechaInscripcion', 'DESC']],
  });

  return inscripciones.map(withProgressPercentage);
}
