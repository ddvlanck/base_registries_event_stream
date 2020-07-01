import { Pool } from 'pg';

import { configuration } from '../utils/Configuration';

const databaseConfig = configuration.database;

const pool = new Pool({
  user: databaseConfig.username,
  password: databaseConfig.password,
  host: databaseConfig.host,
  port: databaseConfig.port,
  database: databaseConfig.database,
});

pool.on('error', (err, client) => {
  console.error('Error: ', err);
});

export default class Db {
  async insertValues(query: string, values: Array<any>, handlerName: string) {
    pool
      .query(query, values)
      .then(_ => console.log('[' + handlerName + ']: inserted event with ID ' + values[0]))
      .catch(err => console.error('Error executing query', err.stack))
  }

  async update(query: string, values: Array<any>, handlerName: string) {
    pool
      .query(query, values)
      .then(_ => console.log('[' + handlerName + ']: added ' + values[0] + ' as PURI for all records with ID ' + values[1]))
      .catch(err => console.error('Error executing query', err.stack))
  }

  async getRowsForAddressID(addressID: string): Promise<Number> {
    const query = 'SELECT * FROM brs."Addresses" WHERE "AddressID" = $1 ORDER BY "EventID" asc';
    const value = [addressID];

    return new Promise(resolve => {
      pool
        .query(query, value)
        .then(res => resolve(res.rows.length))
        .catch(err => console.error('Error executing query', err.stack))
    })
  }
}

export const db = new Db();
