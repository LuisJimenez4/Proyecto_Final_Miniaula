import app from './app.js';
import { ENV } from './config/env.config.js';
import { sequelize } from './models/index.js';

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    app.listen(ENV.PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${ENV.PORT}`);
      console.log(`📚 Entorno: ${ENV.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
}

start();
