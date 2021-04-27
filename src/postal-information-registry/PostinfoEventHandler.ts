import xml2js from 'xml2js';
import { PoolClient } from 'pg';

import { db } from '../utils/DatabaseQueries';
import PostinfoUtils from './PostinfoUtils';

const parser = new xml2js.Parser();

export default class PostinfoEventHandler {
  async processPage(client: PoolClient, entries: Array<any>) {
    await this.processEvents(client, entries);
  }

  async processEvents(client: PoolClient, entries: Array<any>) {
    const self = this;

    for (let event of entries) {
      const position = Number(event.id[0]);
      const eventName = event.title[0].replace(`-${position}`, '');

      if (event.content[0] === 'No data embedded') {
        console.log(`[PostinfoEventHandler]: Skipping ${eventName} at position ${position} because of missing embedded data.`);
        continue;
      }

      await parser
        .parseStringPromise(event.content[0])
        .then(async function (ev) {
          try {
            await self.processEvent(client, position, eventName, ev.Content);
          } catch {
            return;
          }
        })
        .catch(function (err) {
          console.error('[PostinfoEventHandler]: Failed to parse event.', event.content[0], err);
        });
    }
  }

  async processEvent(client: PoolClient, position: number, eventName: string, ev: any) {
    console.log(`[PostinfoEventHandler]: Processing ${eventName} at position ${position}.`);

    const eventBody = ev.Event[0][Object.keys(ev.Event[0])[0]][0];
    const objectBody = ev.Object[0];

    const status = typeof objectBody.PostInfoStatus[0] === 'object' ? null : objectBody.PostInfoStatus[0];

    // In the OSLO data model, postal names is optional
    // So whenever a postal information object contains a status, it is stored in the
    if (!status) {
      console.log(`[PostinfoEventHandler]: Skipping ${eventName} at position ${position} due to not having a complete object.`);
      return;
    }

    const postalCode = eventBody.PostalCode[0];

    const versionId = objectBody.Identificator[0].VersieId[0];
    const objectId = objectBody.Identificator[0].ObjectId[0];
    const objectUri = objectBody.Identificator[0].Id[0];
    const statusUri = PostinfoUtils.mapStatus(status);

    let postalNames = [];

    if (typeof objectBody.Postnamen[0] === 'object')
      postalNames = PostinfoUtils.mapPostnamen(objectBody.Postnamen[0].Postnaam);

    console.log(`[PostinfoEventHandler]: Adding object for ${postalCode} at position ${position}.`);

    await db.addPostalInformation(
      client,
      position,
      eventName,
      versionId,
      postalCode,
      objectId,
      objectUri,
      JSON.stringify(postalNames),
      statusUri
    );
  }
}
