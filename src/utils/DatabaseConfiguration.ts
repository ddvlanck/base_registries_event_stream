import { Pool } from 'pg';

import { configuration } from './Configuration';

const databaseConfig = configuration.database;

export const pool = new Pool({
  user: databaseConfig.username,
  password: databaseConfig.password,
  host: databaseConfig.host,
  port: databaseConfig.port,
  database: databaseConfig.database,
});

pool.on('error', (err, client) => {
  console.error('Error: ', err);
});
