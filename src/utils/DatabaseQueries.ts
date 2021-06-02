import {PoolClient} from 'pg';
import {pool} from './DatabaseConfiguration';
const QueryStream = require('pg-query-stream');

export default class DatabaseQueries {

  //#region "SELECT queries"

  async getAddressesPaged(page: number, pageSize: number) {
    const client = await pool.connect();

    const ADDRESSES_PAGED = `
      SELECT event_name,
        brs.addresses.timestamp AS timestamp,
        object_uri,
        postal_code,
        house_number,
        box_number,
        address_status,
        address_geometry,
        position_geometry_method,
        position_specification,
        officially_assigned,
        brs.address_streetname.persistent_identifier AS streetname_puri,
        brs.address_municipality.persistent_identifier AS municipality_puri,
        brs.address_municipality.municipality_name AS municipality_name
       FROM brs.addresses
       INNER JOIN brs.address_streetname ON brs.addresses.streetname_id = brs.address_streetname.streetname_id
       INNER JOIN brs.address_municipality ON brs.address_streetname.nis_code = brs.address_municipality.nis_code
       WHERE event_can_be_published = 'true'
       ORDER BY brs.addresses.event_id ASC
       LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;

    try {
      const query = new QueryStream(ADDRESSES_PAGED);
      return client.query(query);
    } finally {
      client.release();
    }
  }

  async getStreetNamesPaged(page: number, pageSize: number) {
    const client = await pool.connect();

    const STREET_NAMES_PAGED = `
      SELECT *
        FROM brs.street_names
       ORDER BY event_id ASC
       LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;

    try {
      const query = new QueryStream(STREET_NAMES_PAGED);
      return client.query(query);
    } finally {
      client.release();
    }
  }

  async getPostalInformationPaged(page: number, pageSize: number) {
    const client = await pool.connect();

    const POSTAL_INFORMATION_PAGED = `
      SELECT *
        FROM brs.postal_information
       ORDER BY event_id ASC
       LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;

    try {
      const query = new QueryStream(POSTAL_INFORMATION_PAGED);
      return client.query(query);
    } finally {
      client.release();
    }
  }

  async getMunicipalitiesPaged(page: number, pageSize: number) {
    const client = await pool.connect();

    const MUNICIPALITIES_PAGED = `
        SELECT *
        FROM brs.municipalities
        ORDER BY event_id ASC
        LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;

    try {
      const query = new QueryStream(MUNICIPALITIES_PAGED);
      return client.query(query);
    } finally {
      client.release();
    }
  }

  async getParcelsPaged(page: number, pageSize: number){
    const client = await pool.connect();
    const PARCELS_PAGED = `
        SELECT *
        FROM brs.parcels
        ORDER BY timestamp ASC, event_id ASC
        LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;

    try {
      const query = new QueryStream(PARCELS_PAGED);
      return client.query(query);
    } finally {
      client.release();
    }

  }

  async getBuildingsPaged(page: number, pageSize: number) {
    const client = await pool.connect();

    const BUILDINGS_PAGED = `
      SELECT *
        FROM brs.buildings
       ORDER BY timestamp asc, event_id ASC
       LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;

    try {
      const query = new QueryStream(BUILDINGS_PAGED);
      return client.query(query);
    } finally {
      client.release();
    }
  }

  async getBuildingUnitForBuildingVersion(unitId: string, eventId: number) {
    const client = await pool.connect();

    const BUILDING_UNITS = `
      SELECT *
        FROM brs.building_units
       WHERE event_id = $1 AND building_unit_id = $2
       ORDER BY event_id ASC`;

    try {
      const query = new QueryStream(BUILDING_UNITS, [eventId, unitId]);
      return client.query(query);
    } finally {
      client.release();
    }
  }

  //#endregion "Select queries"

  //#region "Database utils"

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

  async initProjectionStatus(feed: string) {
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

  async setProjectionStatus(client: PoolClient, feed: string, position: number) {
    const PROJECTION_UPDATE = `
      UPDATE brs.projection_status
        SET position = $1
      WHERE feed = $2;`;

    return await client.query(PROJECTION_UPDATE, [position, feed]);
  }

  //#endregion "Database utils"

  //#region "Insert queries"

  async addAddress(
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
    versionCanBePublished: boolean) {

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
        "event_can_be_published")
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`;

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
        versionCanBePublished
      ]);
  }

  async setAddressPersistentId(
    client: PoolClient,
    addressId: string,
    objectId: number,
    objectUri: string) {

    const SET_OBJECTID = `
      UPDATE brs.addresses
         SET object_id = $1, object_uri = $2
       WHERE address_id = $3`;

    return await client.query(SET_OBJECTID, [objectId, objectUri, addressId]);
  }

  async addressWasRemoved(
    client: PoolClient,
    addressId: string) {

      const ADDRESS_WAS_REMOVED = `
        UPDATE brs.addresses
          SET event_can_be_published = 'false'
        WHERE address_id = $1`;

      return await client.query(ADDRESS_WAS_REMOVED, [addressId]);  
    }

  async addStreetName(
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
    nisCode: number) {

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
        "nis_code")
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`;

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
        nisCode
      ]);
  }

  async setStreetNamePersistentId(
    client: PoolClient,
    streetNameId: string,
    objectId: number,
    objectUri: string) {

    const SET_OBJECTID = `
      UPDATE brs.street_names
         SET object_id = $1, object_uri = $2
       WHERE street_name_id = $3`;

    return await client.query(SET_OBJECTID, [objectId, objectUri, streetNameId]);
  }

  async addMunicipality(
    client: PoolClient,
    eventId: number,
    eventName: string,
    timestamp: string,
    municipalityId: string,
    objectId: number | null,
    objectUri: string,
    officialLanguages: Array<string>,
    facilityLanguages: Array<string>,
    municipalityNames: string,
    status: string) {

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
        "status")
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`;

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
        status
      ]
    )
  }

  async addPostalInformation(
    client: PoolClient,
    eventId: number,
    eventName: string,
    timestamp: string,
    postalCode: number,
    objectId: number | null,
    objectUri: string,
    postalNames: any,
    status: string) {

    const ADD_POSTAL_INFO = `
      INSERT INTO brs.postal_information(
        "event_id",
        "event_name",
        "timestamp",
        "postal_code",
        "object_id",
        "object_uri",
        "postal_names",
        "status")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`;

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
        status
      ]
    );
  }

  async updateAddressMunicipalityTable(
    client: PoolClient,
    municipalityId: string,
    objectUri: string,
    objectId: string,
    municipalityName: string | null,
    eventId: number,
    timestamp: string
  ) {
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
        municipalityName
      ]
    )
  }

  async updateAddressStreetnameTable(
    client: PoolClient,
    streetNameId: string,
    objectUri: string,
    nisCode: string,
    eventId: number,
    timestamp: string
  ){
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
        timestamp
      ]
    )      

  }
}

//#endregion "Insert queries"

export const db = new DatabaseQueries();
