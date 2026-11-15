import { Op } from 'sequelize';
import { Inscripcion, Leccion, Progreso } from '../models/index.js';
import { TIPOS_LECCION } from '../constants/index.js';

const hasCompleted = (inscripcion, leccionId) =>
  (inscripcion.progresos || []).some((p) => p.leccionId === leccionId && p.completada === true);

/** Porcentaje medio de lecciones completadas por inscrito (0 si no hay lecciones ni inscritos). */
const averageProgress = (inscripciones, totalLecciones) => {
  if (totalLecciones === 0 || inscripciones.length === 0) return 0;
  const suma = inscripciones.reduce((acc, insc) => {
    const completadas = (insc.progresos || []).filter((p) => p.completada).length;
    return acc + (completadas / totalLecciones) * 100;
  }, 0);
  return Math.round(suma / inscripciones.length);
};

/** Promedio de la mejor nota de todos los intentos en cuestionarios del curso. */
const averageQuizGrade = async (lecciones, inscripciones) => {
  const cuestionarioIds = lecciones.filter((l) => l.tipo === TIPOS_LECCION.CUESTIONARIO).map((l) => l.id);
  if (cuestionarioIds.length === 0 || inscripciones.length === 0) return 0;

  const progresos = await Progreso.findAll({
    where: {
      leccionId: cuestionarioIds,
      mejorNota: { [Op.ne]: null },
      inscripcionId: inscripciones.map((insc) => insc.id),
    },
  });
  if (progresos.length === 0) return 0;
  return Math.round(progresos.reduce((suma, p) => suma + p.mejorNota, 0) / progresos.length);
};

/** Embudo: la lección 1 la alcanzan todos; la N, quienes completaron la N-1. */
const buildFunnel = (lecciones, inscripciones) =>
  lecciones.map((leccion, i) => ({
    leccionId: leccion.id,
    titulo: leccion.titulo,
    orden: leccion.orden,
    llegaron: i === 0
      ? inscripciones.length
      : inscripciones.filter((insc) => hasCompleted(insc, lecciones[i - 1].id)).length,
  }));

/** Lección de mayor caída: el paso entre dos lecciones consecutivas donde más estudiantes se detuvieron. */
const findBiggestDrop = (embudo) => {
  let resultado = null;
  let maxCaida = 0;
  for (let i = 0; i < embudo.length - 1; i++) {
    const caida = embudo[i].llegaron - embudo[i + 1].llegaron;
    if (caida > maxCaida) {
      maxCaida = caida;
      const { leccionId, titulo, orden } = embudo[i + 1];
      resultado = { leccionId, titulo, orden, detenidos: caida };
    }
  }
  return resultado;
};

/** RF-16: métricas del panel del instructor para un curso. */
export async function getCourseResumen(cursoId) {
  const lecciones = await Leccion.findAll({ where: { cursoId }, order: [['orden', 'ASC']] });
  const inscripciones = await Inscripcion.findAll({
    where: { cursoId },
    include: [{ model: Progreso, as: 'progresos' }],
  });

  const avancePorLeccion = buildFunnel(lecciones, inscripciones);
  return {
    inscritos: inscripciones.length,
    completaron: inscripciones.filter((insc) => insc.completado).length,
    progresoPromedio: averageProgress(inscripciones, lecciones.length),
    notaPromedio: await averageQuizGrade(lecciones, inscripciones),
    avancePorLeccion,
    leccionMayorCaida: findBiggestDrop(avancePorLeccion),
  };
}
