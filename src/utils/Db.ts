import { PoolClient } from 'pg';

import { pool } from './Postgres';

export default class Db {
  async getAddressPaged(objectId: number, page: number, pageSize: number) {
    const client = await pool.connect();

    const ADDRESSES_PAGED = `
      SELECT *
        FROM brs.addresses
       WHERE object_id = $1
       ORDER BY timestamp ASC, event_id ASC
       LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;

    try {
      return await client.query(ADDRESSES_PAGED, [objectId]);
    } finally {
      client.release();
    }
  }

  async getAddressesPaged(page: number, pageSize: number) {
    const client = await pool.connect();

    const ADDRESSES_PAGED = `
      SELECT *
        FROM brs.addresses
       ORDER BY timestamp ASC, event_id ASC
       LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;

    try {
      return await client.query(ADDRESSES_PAGED);
    } finally {
      client.release();
    }
  }

  async getStreetNamesPaged(page: number, pageSize: number) {
    const client = await pool.connect();

    const STREET_NAMES_PAGED = `
      SELECT *
        FROM brs.street_names
       ORDER BY timestamp ASC, event_id ASC
       LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;

    try {
      return await client.query(STREET_NAMES_PAGED);
    } finally {
      client.release();
    }
  }

  async getPostalInformationsPaged(page: number, pageSize: number) {
    const client = await pool.connect();

    const POSTAL_INFORMATIONS_PAGED = `
      SELECT *
        FROM brs.postal_information
       ORDER BY timestamp ASC, event_id ASC
       LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;

    try {
      return await client.query(POSTAL_INFORMATIONS_PAGED);
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
       LIMIT ${pageSize} OFFSET ${(page-1) * pageSize}`;

    try {
      return await client.query(BUILDINGS_PAGED);
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
      return await client.query(BUILDING_UNITS, [eventId, unitId]);
    } finally {
      client.release();
    }
  }

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
    complete: boolean,
    officiallyAssigned: boolean) {

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
        "address_position",
        "position_geometry_method",
        "position_specification",
        "complete",
        "officially_assigned")
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
        complete,
        officiallyAssigned
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

  async addStreetName(
    client: PoolClient,
    eventId: number,
    eventName: string,
    timestamp: string,
    streetNameId: string,
    objectId: string | null,
    objectUri: string,
    geographicalName: string,
    geographicalNameLanguage: string,
    straatNameStatus: string,
    nisCode: number,
    isComplete: boolean) {

    const ADD_STREET_NAME = `
      INSERT INTO brs.street_names(
        "event_id",
        "event_name",
        "timestamp",
        "street_name_id",
        "object_id",
        "object_uri",
        "geographical_name",
        "geographical_name_language",
        "street_name_status",
        "nis_code",
        "complete")
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`;

    return await client.query(
      ADD_STREET_NAME,
      [
        eventId,
        eventName,
        timestamp,
        streetNameId,
        objectId,
        objectUri,
        geographicalName,
        geographicalNameLanguage,
        straatNameStatus,
        nisCode,
        isComplete
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
    geographicalNames: Array<string>,
    geographicalNameLanguages: Array<string>,
    status: string) {

    const ADD_MUNICIPALITY = `
      INSERT INTO brs.municipalities(
        "event_id",
        "event_name",
        "timestamp",
        "municipality_id",
        "object_id",
        "object_uri",
        "official_languages",
        "facility_languages",
        "geographical_names",
        "geographical_name_languages",
        "status")
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`;

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
        geographicalNames,
        geographicalNameLanguages,
        status
      ]
    )
  }

  async addPostalInformation(
    client: PoolClient,
    eventId: number,
    eventName: string,
    timestamp: string,
    postalId: number,
    objectId: number | null,
    objectUri: string,
    postalNames: Array<string>,
    postalNameLanguage: Array<string>,
    nisCode: number,
    status: string) {

    const ADD_POSTAL_INFO = `
      INSERT INTO brs.postal_information(
        "event_id",
        "event_name",
        "timestamp",
        "postal_id",
        "object_id",
        "object_uri",
        "postal_names",
        "postal_names_language",
        "nis_code",
        "status")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`;

    return await client.query(
      ADD_POSTAL_INFO,
      [
        eventId,
        eventName,
        timestamp,
        postalId,
        objectId,
        objectUri,
        postalNames,
        postalNameLanguage,
        nisCode,
        status
      ]
    );
  }

  async addBuilding(
    client: PoolClient,
    eventId: number,
    eventName: string,
    buildingId: string,
    timestamp: string,
    objectId: number | null,
    objectUri: string,
    buildingStatus: string,
    geometryMethod: string,
    geometryPolygon: string,
    buildingUnitsIDs: Array<string>,
    complete: boolean) {

    const ADD_BUILDING = `
      INSERT INTO brs.buildings(
        "event_id",
        "event_name",
        "timestamp",
        "building_id",
        "object_id",
        "object_uri",
        "building_status",
        "geometry_method",
        "geometry_polygon",
        "building_units",
        "complete")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`;

    return await client.query(
      ADD_BUILDING,
      [
        eventId,
        eventName,
        timestamp,
        buildingId,
        objectId,
        objectUri,
        buildingStatus,
        geometryMethod,
        geometryPolygon,
        buildingUnitsIDs,
        complete
      ]
    )
  }

  async setBuildingPersistentId(
    client: PoolClient,
    buildingId: string,
    objectId: number,
    objectUri: string) {

    const SET_OBJECTID = `
      UPDATE brs.buildings
         SET object_id = $1, object_uri = $2
       WHERE building_id = $3`;

    return await client.query(SET_OBJECTID, [objectId, objectUri, buildingId]);
  }

  async addBuildingUnit(
    client: PoolClient,
    eventId: number,
    buildingUnitId: string,
    buildingId: string,
    buildingUnitObjectId: number | null,
    buildingUnitObjectUri: string,
    buildingUnitStatus: string,
    positionGeometryMethod: string,
    geometryPoint: string,
    unitFunction: string,
    complete: boolean) {

    const ADD_BUILDING_UNIT = `
      INSERT INTO brs.building_units(
        "building_unit_id",
        "event_id",
        "building_id",
        "object_id",
        "object_uri",
        "building_unit_status",
        "position_geometry_method",
        "geometry_point",
        "function",
        "complete")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`

    return await client.query(
      ADD_BUILDING_UNIT,
      [
        buildingUnitId,
        eventId,
        buildingId,
        buildingUnitObjectId,
        buildingUnitObjectUri,
        buildingUnitStatus,
        positionGeometryMethod,
        geometryPoint,
        unitFunction,
        complete
      ]
    )
  }

  async setBuildingUnitPersistentId(
    client: PoolClient,
    buildingUnitId: string,
    objectId: number,
    objectUri: string) {

    const SET_OBJECTID = `
      UPDATE brs.building_units
         SET object_id = $1, object_uri = $2
       WHERE building_unit_id = $3`;

    return await client.query(SET_OBJECTID, [objectId, objectUri, buildingUnitId]);
  }
}

export const db = new Db();
