import { DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';
import { TIPOS_LECCION, NOTA_MINIMA_DEFAULT, valoresDe } from '../constants/index.js';

const Leccion = sequelize.define('Leccion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM(...valoresDe(TIPOS_LECCION)),
    allowNull: false,
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  orden: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  notaMinima: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: NOTA_MINIMA_DEFAULT,
    validate: {
      min: 0,
      max: 100,
    },
  },
  cursoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'lecciones',
  timestamps: false,
});

export default Leccion;
