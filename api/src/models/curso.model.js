import { DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';
import { ESTADOS_CURSO, NIVELES, valoresDe } from '../constants/index.js';

const Curso = sequelize.define('Curso', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nivel: {
    type: DataTypes.ENUM(...valoresDe(NIVELES)),
    allowNull: false,
    defaultValue: NIVELES.BASICO,
  },
  estado: {
    type: DataTypes.ENUM(...valoresDe(ESTADOS_CURSO)),
    allowNull: false,
    defaultValue: ESTADOS_CURSO.BORRADOR,
  },
  instructorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  creadoEn: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'cursos',
  timestamps: false,
});

export default Curso;
