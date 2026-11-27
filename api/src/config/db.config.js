import { Sequelize } from 'sequelize';
import { ENV } from './env.config.js';

const sequelize = new Sequelize(ENV.DB_NAME, ENV.DB_USER, ENV.DB_PASSWORD, {
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  dialect: 'mysql',
  logging: ENV.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: false,
    underscored: false,
  },
});

export default sequelize;
