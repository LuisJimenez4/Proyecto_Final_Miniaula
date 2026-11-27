import sequelize from '../config/db.config.js';
import Usuario from './usuario.model.js';
import Curso from './curso.model.js';
import Leccion from './leccion.model.js';
import Pregunta from './pregunta.model.js';
import Inscripcion from './inscripcion.model.js';
import Progreso from './progreso.model.js';

// ─── Usuario ↔ Curso ────────────────────────────
Usuario.hasMany(Curso, { foreignKey: 'instructorId', as: 'cursos' });
Curso.belongsTo(Usuario, { foreignKey: 'instructorId', as: 'instructor' });

// ─── Curso ↔ Leccion ────────────────────────────
Curso.hasMany(Leccion, { foreignKey: 'cursoId', as: 'lecciones', onDelete: 'CASCADE' });
Leccion.belongsTo(Curso, { foreignKey: 'cursoId', as: 'curso' });

// ─── Leccion ↔ Pregunta ─────────────────────────
Leccion.hasMany(Pregunta, { foreignKey: 'leccionId', as: 'preguntas', onDelete: 'CASCADE' });
Pregunta.belongsTo(Leccion, { foreignKey: 'leccionId', as: 'leccion' });

// ─── Usuario ↔ Inscripcion ──────────────────────
Usuario.hasMany(Inscripcion, { foreignKey: 'estudianteId', as: 'inscripciones' });
Inscripcion.belongsTo(Usuario, { foreignKey: 'estudianteId', as: 'estudiante' });

// ─── Curso ↔ Inscripcion ────────────────────────
Curso.hasMany(Inscripcion, { foreignKey: 'cursoId', as: 'inscripciones', onDelete: 'RESTRICT' });
Inscripcion.belongsTo(Curso, { foreignKey: 'cursoId', as: 'curso' });

// ─── Inscripcion ↔ Progreso ─────────────────────
Inscripcion.hasMany(Progreso, { foreignKey: 'inscripcionId', as: 'progresos', onDelete: 'CASCADE' });
Progreso.belongsTo(Inscripcion, { foreignKey: 'inscripcionId', as: 'inscripcion' });

// ─── Leccion ↔ Progreso ─────────────────────────
Leccion.hasMany(Progreso, { foreignKey: 'leccionId', as: 'progresos', onDelete: 'CASCADE' });
Progreso.belongsTo(Leccion, { foreignKey: 'leccionId', as: 'leccion' });

export { sequelize, Usuario, Curso, Leccion, Pregunta, Inscripcion, Progreso };
