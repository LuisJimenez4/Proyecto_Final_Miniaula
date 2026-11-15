import { DataTypes } from 'sequelize';
import sequelize from '../config/db.config.js';

const Progreso = sequelize.define('Progreso', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  inscripcionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  leccionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  completada: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  intentos: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  mejorNota: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: null,
  },
  actualizadoEn: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'progresos',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['inscripcionId', 'leccionId'],
    },
  ],
});

export default Progreso;
