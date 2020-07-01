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
      WHERE feed = $1;`;

    try {
      return await client.query(PROJECTION_STATUS, [feed]);
    } finally {
      client.release();
    }
  }

  async initProjectionStatus(feed: string) {
    const client = await pool.connect()
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
    addressId: string,
    timestamp: string,
    objectId: number,
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
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`;

    return await client.query(
      ADD_ADDRESS,
      [
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

  async setAddressPersistentId(client: PoolClient, addressId: string, objectId: number, objectUri: string) {
    const SET_OBJECTID = `
      UPDATE brs.addresses
         SET object_id = $1, object_uri = $2
       WHERE address_id = $3`;

    return await client.query(SET_OBJECTID, [objectId, objectUri, addressId]);
  }
}

export const db = new Db();
