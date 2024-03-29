import type { PoolClient } from 'pg';
import { pool } from './DatabaseConfiguration';
const QueryStream = require('pg-query-stream');

export const enum DbTable {
  Municipality = 'brs.municipalities',
  PostalInformation = 'brs.postal_information',
  StreetName = 'brs.street_names',
  Address = 'brs.addresses'
}

export default class DatabaseQueries {
  // #region "SELECT queries"

  public async getDistinctGeneratedAtTimesWithIndexNumber(table: DbTable, size: number): Promise<any> {
    const client = await pool.connect();

    const DISTINCT_GENERATED_AT_TIME_QUERY = `
      SELECT record_generated_time, index_number
      FROM (
        SELECT record_generated_time, index_number, row_number() OVER (ORDER BY record_generated_time ASC) - 1 rownr
        FROM ${table}
        GROUP BY record_generated_time, index_number
      ) AS distinctGeneratedAtTimes
      WHERE rownr % ${size} = 0
      ORDER BY index_number ASC`;

    try {
      return client.query(DISTINCT_GENERATED_AT_TIME_QUERY);
    } finally {
      client.release();
    }
  }

  public async getClosestFragment(
    table: DbTable,
    generatedAtTime: string,
    distinctGeneratedAtTimes: string[],
  ): Promise<any> {
    const client = await pool.connect();

    const CLOSEST_FRAGMENT_QUERY = `
      SELECT MAX(record_generated_time) AS time
      FROM ${table}
      WHERE record_generated_time <= $1
      AND record_generated_time = ANY ($2)`;

    try {
      return client.query(CLOSEST_FRAGMENT_QUERY, [generatedAtTime, distinctGeneratedAtTimes]);
    } finally {
      client.release();
    }
  }

  public async getAddressItems(startIndex: number, pageSize: number): Promise<any> {
    const client = await pool.connect();

    const ADDRESS_QUERY = `
      SELECT *, 
        brs.address_streetname.persistent_identifier AS streetname_puri,
        brs.address_municipality.persistent_identifier AS municipality_puri,
        brs.address_municipality.municipality_name AS municipality_name
      FROM (
        SELECT * FROM brs.addresses
        WHERE index_number BETWEEN ${startIndex} AND ${startIndex + pageSize - 1}
        ORDER BY index_number ASC) AS T1
      INNER JOIN brs.address_streetname ON T1.streetname_id = brs.address_streetname.streetname_id
      INNER JOIN brs.address_municipality ON brs.address_streetname.nis_code = brs.address_municipality.nis_code
      ORDER BY index_number ASC`;

    try {
      return client.query(ADDRESS_QUERY);
    } finally {
      client.release();
    }
  }

  public async getMunicipalityItems(startIndex: number, pageSize: number): Promise<any> {
    const client = await pool.connect();

    const MUNICIPALITY_QUERY = `
      SELECT *
      FROM brs.municipalities
      WHERE index_number BETWEEN ${startIndex} AND ${startIndex + pageSize - 1}
      ORDER BY index_number ASC`;

    try {
      return client.query(MUNICIPALITY_QUERY);
    } finally {
      client.release();
    }
  }

  public async getPostalInfoItems(startIndex: number, pageSize: number): Promise<any> {
    const client = await pool.connect();

    const MUNICIPALITY_QUERY = `
      SELECT *
      FROM brs.postal_information
      WHERE index_number BETWEEN ${startIndex} AND ${startIndex + pageSize - 1}
      ORDER BY index_number ASC`;

    try {
      return client.query(MUNICIPALITY_QUERY);
    } finally {
      client.release();
    }
  }

  public async getStreetNameItems(startIndex: number, pageSize: number): Promise<any> {
    const client = await pool.connect();

    const STREETNAME_QUERY = `
      SELECT *
      FROM brs.street_names
      WHERE index_number BETWEEN ${startIndex} AND ${startIndex + pageSize - 1}
      ORDER BY index_number ASC`;

    try {
      return client.query(STREETNAME_QUERY);
    } finally {
      client.release();
    }
  }

  public async getVersionObject(table: DbTable, objectId: string, versionTimestamp: string): Promise<any> {
    const client = await pool.connect();

    const VERSION_OBJECT_QUERY = `
      SELECT *
      FROM ${table}
      WHERE object_id = $1 and record_generated_time = $2`;

    try {
      return client.query(VERSION_OBJECT_QUERY, [objectId, versionTimestamp]);
    } finally {
      client.release();
    }
  }

  public async getAddressVersionObject(objectId: string, versionTimestamp: string): Promise<any> {
    const client = await pool.connect();

    const ADDRESS_VERSION_OBJECT_QUERY = `
      SELECT *,
        brs.address_streetname.persistent_identifier AS streetname_puri,
        brs.address_municipality.persistent_identifier AS municipality_puri,
        brs.address_municipality.municipality_name AS municipality_name
      FROM (
        SELECT * FROM brs.addresses
        WHERE object_id = $1 and record_generated_time = $2) AS T1
      INNER JOIN brs.address_streetname ON T1.streetname_id = brs.address_streetname.streetname_id
      INNER JOIN brs.address_municipality ON brs.address_streetname.nis_code = brs.address_municipality.nis_code`;

    try {
      return client.query(ADDRESS_VERSION_OBJECT_QUERY, [objectId, versionTimestamp]);
    } finally {
      client.release();
    }
  }

  // #endregion "Select queries"

  // #region "Database utils"

  public async transaction(func: (client: PoolClient) => any): Promise<any> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      await func(client);

      await client.query('COMMIT');
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async getProjectionStatus(feed: string): Promise<any> {
    const client = await pool.connect();

    const PROJECTION_STATUS = `
      SELECT position
        FROM brs.projection_status
      WHERE feed = $1;`;

    try {
      return await client.query(PROJECTION_STATUS, [feed]);
    } finally {
      client.release();
    }
  }

  public async initProjectionStatus(feed: string): Promise<any> {
    const client = await pool.connect();

    const PROJECTION_INIT = `
      INSERT INTO brs.projection_status(feed, position)
          VALUES($1, 0);`;

    try {
      return await client.query(PROJECTION_INIT, [feed]);
    } finally {
      client.release();
    }
  }

  public async setProjectionStatus(client: PoolClient, feed: string, position: number): Promise<any> {
    const PROJECTION_UPDATE = `
      UPDATE brs.projection_status
        SET position = $1
      WHERE feed = $2;`;

    return await client.query(PROJECTION_UPDATE, [position, feed]);
  }

  public getIndexRange(page: number, pageSize: number): number[] {
    let low = 0;
    let high = 0;

    if (page === 1) {
      low = page;
    } else {
      low = ((page - 1) * pageSize) + 1;
    }

    high = page * pageSize;
    return [low, high];
  }

  // #endregion "Database utils"

  // #region "Insert queries"

  public async addAddress(
    client: PoolClient,
    eventId: number,
    eventName: string,
    addressId: string,
    timestamp: string,
    objectId: number | null,
    objectUri: string,
    streetnameId: string,
    postalCode: string,
    houseNumber: string,
    boxNumber: string,
    addressStatus: string,
    addressPosition: string,
    positionGeometryMethod: string,
    positionSpecification: string,
    officiallyAssigned: boolean,
    versionCanBePublished: boolean,
    indexNumber: number,
    recordTimestamp: string,
  ): Promise<any> {
    const ADD_ADDRESS = `
      INSERT INTO brs.addresses(
        "event_id",
        "event_name",
        "address_id",
        "timestamp",
        "object_id",
        "object_uri",
        "streetname_id",
        "postal_code",
        "house_number",
        "box_number",
        "address_status",
        "address_geometry",
        "position_geometry_method",
        "position_specification",
        "officially_assigned",
        "event_can_be_published",
        "index_number",
        "record_generated_time")
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`;

    return await client.query(
      ADD_ADDRESS,
      [
        eventId,
        eventName,
        addressId,
        timestamp,
        objectId,
        objectUri,
        streetnameId,
        postalCode,
        houseNumber,
        boxNumber,
        addressStatus,
        addressPosition,
        positionGeometryMethod,
        positionSpecification,
        officiallyAssigned,
        versionCanBePublished,
        indexNumber,
        recordTimestamp,
      ],
    );
  }

  public async setAddressPersistentId(
    client: PoolClient,
    addressId: string,
    objectId: number,
    objectUri: string,
  ): Promise<any> {
    const SET_OBJECTID = `
      UPDATE brs.addresses
         SET object_id = $1, object_uri = $2
       WHERE address_id = $3`;

    return await client.query(SET_OBJECTID, [objectId, objectUri, addressId]);
  }

  public async addressWasRemoved(
    client: PoolClient,
    addressId: string,
  ): Promise<any> {
    const ADDRESS_WAS_REMOVED = `
        UPDATE brs.addresses
          SET event_can_be_published = 'false'
        WHERE address_id = $1`;

    return await client.query(ADDRESS_WAS_REMOVED, [addressId]);
  }

  public async addStreetName(
    client: PoolClient,
    eventId: number,
    eventName: string,
    timestamp: string,
    streetNameId: string,
    objectId: string | null,
    objectUri: string,
    geographicalNames: string,
    straatNameStatus: string,
    homonym: string | null,
    nisCode: number,
    indexNumber: number,
    recordTimestamp: string,
  ): Promise<any> {
    const ADD_STREET_NAME = `
      INSERT INTO brs.street_names(
        "event_id",
        "event_name",
        "timestamp",
        "street_name_id",
        "object_id",
        "object_uri",
        "geographical_name",
        "street_name_status",
        "homonym",
        "nis_code",
        "index_number",
        "record_generated_time")
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`;

    return await client.query(
      ADD_STREET_NAME,
      [
        eventId,
        eventName,
        timestamp,
        streetNameId,
        objectId,
        objectUri,
        geographicalNames,
        straatNameStatus,
        homonym,
        nisCode,
        indexNumber,
        recordTimestamp,
      ],
    );
  }

  public async setStreetNamePersistentId(
    client: PoolClient,
    streetNameId: string,
    objectId: number,
    objectUri: string,
  ): Promise<any> {
    const SET_OBJECTID = `
      UPDATE brs.street_names
         SET object_id = $1, object_uri = $2
       WHERE street_name_id = $3`;

    return await client.query(SET_OBJECTID, [objectId, objectUri, streetNameId]);
  }

  public async addMunicipality(
    client: PoolClient,
    eventId: number,
    eventName: string,
    timestamp: string,
    municipalityId: string,
    objectId: number | null,
    objectUri: string,
    officialLanguages: string[],
    facilityLanguages: string[],
    municipalityNames: string,
    status: string,
    indexNumber: number,
    recordTimestamp: string,
  ): Promise<any> {
    const ADD_MUNICIPALITY = `
      INSERT INTO brs.municipalities(
        "event_id",
        "event_name",
        "timestamp",
        "municipality_id",
        "object_id",
        "object_uri",
        "official_language",
        "facility_language",
        "municipality_name",
        "status",
        "index_number",
        "record_generated_time")
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`;

    return await client.query(
      ADD_MUNICIPALITY,
      [
        eventId,
        eventName,
        timestamp,
        municipalityId,
        objectId,
        objectUri,
        officialLanguages,
        facilityLanguages,
        municipalityNames,
        status,
        indexNumber,
        recordTimestamp,
      ],
    );
  }

  public async addPostalInformation(
    client: PoolClient,
    eventId: number,
    eventName: string,
    timestamp: string,
    postalCode: number,
    objectId: number | null,
    objectUri: string,
    postalNames: any,
    status: string,
    indexNumber: number,
    recordTimestamp: string,
  ): Promise<any> {
    const ADD_POSTAL_INFO = `
      INSERT INTO brs.postal_information(
        "event_id",
        "event_name",
        "timestamp",
        "postal_code",
        "object_id",
        "object_uri",
        "postal_names",
        "status",
        "index_number",
        "record_generated_time")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`;

    return await client.query(
      ADD_POSTAL_INFO,
      [
        eventId,
        eventName,
        timestamp,
        postalCode,
        objectId,
        objectUri,
        postalNames,
        status,
        indexNumber,
        recordTimestamp,
      ],
    );
  }

  public async updateAddressMunicipalityTable(
    client: PoolClient,
    municipalityId: string,
    objectUri: string,
    objectId: string,
    municipalityName: string | null,
    eventId: number,
    timestamp: string,
  ): Promise<any> {
    const UPDATE_ADDRESS_MUNICIPALITY = `
      INSERT INTO brs.address_municipality(
        "municipality_id",
        "persistent_identifier",
        "nis_code",
        "event_id",
        "timestamp",
        "municipality_name") 
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT ("municipality_id") DO UPDATE
      SET persistent_identifier = EXCLUDED.persistent_identifier,
       nis_code = EXCLUDED.nis_code,
       event_id = EXCLUDED.event_id,
       timestamp = EXCLUDED.timestamp,
       municipality_name = EXCLUDED.municipality_name`;

    return await client.query(
      UPDATE_ADDRESS_MUNICIPALITY,
      [
        municipalityId,
        objectUri,
        objectId,
        eventId,
        timestamp,
        municipalityName,
      ],
    );
  }

  public async updateAddressStreetnameTable(
    client: PoolClient,
    streetNameId: string,
    objectUri: string,
    nisCode: string,
    eventId: number,
    timestamp: string,
  ): Promise<any> {
    const UPDATE_ADDRESS_STREETNAME = `
      INSERT INTO brs.address_streetname(
        "streetname_id",
        "persistent_identifier",
        "nis_code",
        "event_id",
        "timestamp") 
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT ("streetname_id") DO UPDATE
      SET nis_code = EXCLUDED.nis_code,
          persistent_identifier = EXCLUDED.persistent_identifier,
          event_id = EXCLUDED.event_id,
          timestamp = EXCLUDED.timestamp`;

    return await client.query(
      UPDATE_ADDRESS_STREETNAME,
      [
        streetNameId,
        objectUri,
        nisCode,
        eventId,
        timestamp,
      ],
    );
  }
}

// #endregion "Insert queries"

export const db = new DatabaseQueries();
