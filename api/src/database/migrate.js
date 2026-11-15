import { pathToFileURL } from 'node:url';
import { Umzug, SequelizeStorage } from 'umzug';
import sequelize from '../config/db.config.js';

/** ADR-04 / RT-B08: migraciones versionadas (Umzug); la tabla SequelizeMeta evita repetirlas. */
const umzug = new Umzug({
  migrations: {
    glob: ['migrations/*.js', { cwd: import.meta.dirname }],
    // Las migraciones son módulos ES: se cargan con import() dinámico, no con require().
    resolve: ({ name, path, context }) => ({
      name,
      up: async () => (await import(pathToFileURL(path).href)).up({ context }),
      down: async () => (await import(pathToFileURL(path).href)).down({ context }),
    }),
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');
    await umzug.up();
    console.log('✅ Migraciones al día.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    process.exit(1);
  }
}

migrate();
