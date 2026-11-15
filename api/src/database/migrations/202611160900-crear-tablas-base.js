import { DataTypes, Sequelize } from 'sequelize';

const id = { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true };
const ahora = { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') };

const fk = (tabla, onDelete) => ({
  type: DataTypes.INTEGER,
  allowNull: false,
  references: { model: tabla, key: 'id' },
  onUpdate: 'CASCADE',
  onDelete,
});

const crearUsuarios = (qi) => qi.createTable('usuarios', {
  id,
  nombre: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  rol: { type: DataTypes.ENUM('estudiante', 'instructor'), allowNull: false },
  creadoEn: ahora,
});

const crearCursos = (qi) => qi.createTable('cursos', {
  id,
  titulo: { type: DataTypes.STRING, allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: false },
  categoria: { type: DataTypes.STRING, allowNull: false },
  nivel: { type: DataTypes.ENUM('Básico', 'Intermedio', 'Avanzado'), allowNull: false, defaultValue: 'Básico' },
  estado: { type: DataTypes.ENUM('borrador', 'publicado', 'archivado'), allowNull: false, defaultValue: 'borrador' },
  instructorId: fk('usuarios', 'RESTRICT'),
  creadoEn: ahora,
});

const crearLecciones = (qi) => qi.createTable('lecciones', {
  id,
  titulo: { type: DataTypes.STRING, allowNull: false },
  tipo: { type: DataTypes.ENUM('contenido', 'cuestionario'), allowNull: false },
  contenido: { type: DataTypes.TEXT, allowNull: true },
  videoUrl: { type: DataTypes.STRING, allowNull: true },
  orden: { type: DataTypes.INTEGER, allowNull: false },
  notaMinima: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 70 },
  cursoId: fk('cursos', 'CASCADE'),
});

const crearPreguntas = (qi) => qi.createTable('preguntas', {
  id,
  enunciado: { type: DataTypes.TEXT, allowNull: false },
  opciones: { type: DataTypes.JSON, allowNull: false },
  indiceCorrecto: { type: DataTypes.INTEGER, allowNull: false },
  leccionId: fk('lecciones', 'CASCADE'),
});

const crearInscripciones = async (qi) => {
  await qi.createTable('inscripciones', {
    id,
    estudianteId: fk('usuarios', 'RESTRICT'),
    cursoId: fk('cursos', 'RESTRICT'),
    fechaInscripcion: ahora,
    completado: { type: DataTypes.BOOLEAN, defaultValue: false },
  });
  await qi.addIndex('inscripciones', ['estudianteId', 'cursoId'], { unique: true, name: 'inscripciones_estudiante_curso_unico' });
};

const crearProgresos = async (qi) => {
  await qi.createTable('progresos', {
    id,
    inscripcionId: fk('inscripciones', 'CASCADE'),
    leccionId: fk('lecciones', 'CASCADE'),
    completada: { type: DataTypes.BOOLEAN, defaultValue: false },
    intentos: { type: DataTypes.INTEGER, defaultValue: 0 },
    mejorNota: { type: DataTypes.FLOAT, allowNull: true, defaultValue: null },
    actualizadoEn: ahora,
  });
  await qi.addIndex('progresos', ['inscripcionId', 'leccionId'], { unique: true, name: 'progresos_inscripcion_leccion_unico' });
};

/** RT-B08: crea las 6 tablas con sus FKs e índices únicos (equivalente a models/). */
export async function up({ context: qi }) {
  await crearUsuarios(qi);
  await crearCursos(qi);
  await crearLecciones(qi);
  await crearPreguntas(qi);
  await crearInscripciones(qi);
  await crearProgresos(qi);
}

export async function down({ context: qi }) {
  for (const tabla of ['progresos', 'inscripciones', 'preguntas', 'lecciones', 'cursos', 'usuarios']) {
    await qi.dropTable(tabla);
  }
}
