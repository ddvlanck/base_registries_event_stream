import { Pool } from 'pg';

import { configuration } from '../utils/Configuration';

const databaseConfig = configuration.database;

export const pool = new Pool({
  user: databaseConfig.user,
  password: databaseConfig.password,
  host: databaseConfig.host,
  port: databaseConfig.port,
  database: databaseConfig.database,
});

pool.on('error', (err, client) => {
  console.error('Error: ', err);
});

export default class Db {
  async insertValues(query: string, values: Array<any>, handlerName) {
    pool
      .query(query, values)
      .then(res => console.log('[' + handlerName + ']: inserted event with ID ' + values[0]))
      .catch(err => console.error('Error executing query', err.stack))
  }

  async update(query, values, handlerName) {
    pool.connect((err, client, done) => {
      if (err) throw err;

      client.query(query, values, (err, res) => {
        done();

        if (err) console.log(err.stack)

        console.log('[' + handlerName + ']: added ' + values[0] + ' as PURI for all records with ID ' + values[1]);
      })
    });
  }

  async getRowsForAddressID(addressID: string): Promise<Number> {
    const query = 'SELECT * FROM brs."Addresses" WHERE "AddressID" = $1 ORDER BY "EventID" asc';
    const value = [addressID];

    return new Promise(resolve => {
      pool.connect((err, client, done) => {
        if (err) throw err;

        client.query(query, value, (err, res) => {
          done();

          if (err) console.log(err.stack)

          resolve(res.rows.length);
        })
      })
    })
  }
}

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




