import { Op, literal } from 'sequelize';
import { Curso, Usuario, Leccion, Inscripcion, Pregunta } from '../models/index.js';
import AppError from '../errors/AppError.js';
import { ESTADOS_CURSO, TIPOS_LECCION } from '../constants/index.js';
import { getPagination, buildPageMeta } from '../utils/pagination.js';
import { escapeLike } from '../utils/search.js';

const TOTAL_LECCIONES = [literal('(SELECT COUNT(*) FROM lecciones WHERE lecciones.cursoId = Curso.id)'), 'totalLecciones'];

const courseNotFound = () => new AppError(404, 'COURSE_NOT_FOUND', 'Curso no encontrado');

const buildCatalogFilter = ({ q, categoria, nivel }) => {
  const where = { estado: ESTADOS_CURSO.PUBLICADO };
  if (q) {
    const patron = `%${escapeLike(q)}%`;
    where[Op.or] = [{ titulo: { [Op.like]: patron } }, { descripcion: { [Op.like]: patron } }];
  }
  if (categoria) where.categoria = categoria;
  if (nivel) where.nivel = nivel;
  return where;
};

/** RF-04, RN-05: catálogo público (solo publicados) con búsqueda `q`, filtros y paginación. */
export async function getPublishedCourses({ page, limit, q, categoria, nivel }) {
  const { count, rows } = await Curso.findAndCountAll({
    where: buildCatalogFilter({ q, categoria, nivel }),
    attributes: { include: [TOTAL_LECCIONES] },
    include: [{ model: Usuario, as: 'instructor', attributes: ['id', 'nombre'] }],
    order: [['creadoEn', 'DESC'], ['id', 'DESC']],
    ...getPagination({ page, limit }),
  });

  return { cursos: rows, ...buildPageMeta(count, { page, limit }) };
}

const canViewCourse = (curso, user) =>
  curso.estado === ESTADOS_CURSO.PUBLICADO || curso.instructorId === user?.id;

/**
 * RF-05, RN-05: detalle con temario (id, título, tipo, orden) SIN contenido ni preguntas.
 * Un curso no publicado solo lo ve su instructor dueño; para el resto responde 404.
 */
export async function getCourseDetail(courseId, user) {
  const curso = await Curso.findByPk(courseId, {
    include: [
      { model: Usuario, as: 'instructor', attributes: ['id', 'nombre'] },
      { model: Leccion, as: 'lecciones', attributes: ['id', 'titulo', 'tipo', 'orden'] },
    ],
    order: [[{ model: Leccion, as: 'lecciones' }, 'orden', 'ASC']],
  });
  if (!curso || !canViewCourse(curso, user)) throw courseNotFound();
  return curso;
}

/** Cursos del instructor con totales de lecciones e inscritos. */
export async function getInstructorCourses(instructorId) {
  return Curso.findAll({
    where: { instructorId },
    attributes: {
      include: [
        TOTAL_LECCIONES,
        [literal('(SELECT COUNT(*) FROM inscripciones WHERE inscripciones.cursoId = Curso.id)'), 'totalInscripciones'],
      ],
    },
    order: [['creadoEn', 'DESC'], ['id', 'DESC']],
  });
}

/** RF-06: crea un curso en estado borrador. */
export async function createCourse(instructorId, data) {
  return Curso.create({ ...data, instructorId, estado: ESTADOS_CURSO.BORRADOR });
}

/** RF-06: edita el curso completo. */
export async function updateCourse(courseId, data) {
  const curso = await Curso.findByPk(courseId);
  if (!curso) throw courseNotFound();
  return curso.update(data);
}

const findEmptyQuizzes = async (lecciones) => {
  const cuestionarios = lecciones.filter((l) => l.tipo === TIPOS_LECCION.CUESTIONARIO);
  if (cuestionarios.length === 0) return [];

  const conPreguntas = await Pregunta.findAll({
    where: { leccionId: cuestionarios.map((l) => l.id) },
    attributes: ['leccionId'],
    group: ['leccionId'],
  });
  const ids = new Set(conPreguntas.map((p) => p.leccionId));
  return cuestionarios.filter((l) => !ids.has(l.id));
};

/**
 * RN-05: un curso solo se publica con al menos una lección.
 * Regla añadida: tampoco con cuestionarios sin preguntas (nadie podría aprobarlos y bloquearían el curso).
 */
const assertPublishable = async (courseId) => {
  const lecciones = await Leccion.findAll({ where: { cursoId: courseId }, attributes: ['id', 'titulo', 'tipo'] });
  if (lecciones.length === 0) {
    throw new AppError(422, 'COURSE_EMPTY', 'No se puede publicar un curso sin al menos una lección');
  }

  const vacios = await findEmptyQuizzes(lecciones);
  if (vacios.length > 0) {
    throw new AppError(422, 'QUIZ_WITHOUT_QUESTIONS', 'No se puede publicar: hay cuestionarios sin preguntas',
      vacios.map((l) => l.titulo));
  }
};

/** RF-07, RN-05: cambia el estado (borrador / publicado / archivado). */
export async function updateCourseStatus(courseId, newEstado) {
  const curso = await Curso.findByPk(courseId);
  if (!curso) throw courseNotFound();

  if (newEstado === ESTADOS_CURSO.PUBLICADO) await assertPublishable(courseId);
  return curso.update({ estado: newEstado });
}

/** RF-06, RN-06: un curso con inscritos no se elimina, se archiva (409). */
export async function deleteCourse(courseId) {
  const curso = await Curso.findByPk(courseId);
  if (!curso) throw courseNotFound();

  const inscritos = await Inscripcion.count({ where: { cursoId: courseId } });
  if (inscritos > 0) {
    throw new AppError(409, 'COURSE_HAS_STUDENTS', 'Un curso con estudiantes inscritos no puede eliminarse, solo archivarse');
  }
  await curso.destroy();
}
