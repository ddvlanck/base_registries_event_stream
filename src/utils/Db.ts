import { PoolClient } from 'pg';

import { pool } from './Postgres';

export default class Db {
  async transaction(f: (client: PoolClient) => any) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      await f(client);

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async getProjectionStatus(feed: string) {
    const client = await pool.connect()
    const PROJECTION_STATUS = `
  SELECT position
    FROM brs.projection_status
   WHERE feed = $1;
  `;

    try {
      return await client.query(PROJECTION_STATUS, [feed])
    } finally {
      client.release()
    }
  }

  async initProjectionStatus(feed: string) {
    const client = await pool.connect()
    const PROJECTION_INIT = `
  INSERT INTO brs.projection_status(feed, position)
       VALUES($1, 0);
  `;

    try {
      return await client.query(PROJECTION_INIT, [feed])
    } finally {
      client.release()
    }
  }

  async setProjectionStatus(feed: string, position: number) {
    const client = await pool.connect()
    const PROJECTION_UPDATE = `
  UPDATE brs.projection_status
     SET position = $1
   WHERE feed = $2;
  `;

    try {
      return await client.query(PROJECTION_UPDATE, [position, feed])
    } finally {
      client.release()
    }
  }

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

export const ADDRESS_QUERY = 'INSERT INTO brs."Addresses"("EventID", "EventName", "Timestamp", "AddressID", "AddressURI", "StreetNameID", "PostalCode", ' +
  '"AddressStatus", ' +
  '"HouseNumber", "FlatNumber", "PositionGeometryMethod", ' +
  '"PositionSpecification", "IsComplete", "OfficiallyAssigned", "AddressPosition") ' +
  'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)';

export const STREETNAME_QUERY = 'INSERT INTO brs."StreetNames" ("EventID", "EventName", "Timestamp", "StreetNameID", "StreetNameURI",' +
  '"GeographicalName", "GeographicalNameLanguage", "Status", "NisCode", "IsComplete") ' +
  'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)';

export const MUNICIPALITY_QUERY = 'INSERT INTO brs."Municipalities" ("EventID", "EventName", "Timestamp", "MunicipalityID", "MunicipalityURI",' +
  '"OfficialLanguage", "GeographicalName", "GeographicalNameLanguage", "Status") ' +
  'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)';
