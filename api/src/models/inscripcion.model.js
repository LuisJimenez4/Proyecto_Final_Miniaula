import { DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';

const Inscripcion = sequelize.define('Inscripcion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  estudianteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cursoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fechaInscripcion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  completado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'inscripciones',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['estudianteId', 'cursoId'],
    },
  ],
});

export default Inscripcion;
