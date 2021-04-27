import { Pool } from 'pg';

import { configuration } from './Configuration';

const databaseConfig = configuration.database;

export const clientPool = new Pool({
  user: databaseConfig.username,
  password: databaseConfig.password,
  host: databaseConfig.host,
  port: databaseConfig.port,
  database: databaseConfig.database,
});

clientPool.on('error', (err, client) => {
  console.error('Error: ', err);
});
