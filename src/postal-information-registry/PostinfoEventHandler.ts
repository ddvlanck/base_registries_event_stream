import type { PoolClient } from 'pg';
import { Parser } from 'xml2js';

import { db } from '../utils/DatabaseQueries';
import { PostinfoUtils } from './PostinfoUtils';

const parser = new Parser();

export default class PostinfoEventHandler {
  private indexNumber: number;

  public constructor() {
    this.indexNumber = 1;
  }

  public async processPage(client: PoolClient, entries: any[]): Promise<void> {
    await this.processEvents(client, entries);
  }

  private async processEvents(client: PoolClient, entries: any[]): Promise<void> {
    for (const event of entries) {
      const position = Number(event.id[0]);
      const eventName = event.title[0].replace(`-${position}`, '');

      if (event.content[0] === 'No data embedded') {
        console.log(`[PostinfoEventHandler]: Skipping ${eventName} at position ${position} because of missing embedded data.`);
        continue;
      }

      await parser
        .parseStringPromise(event.content[0])
        .then(async ev => {
          await this.processEvent(client, position, eventName, ev.Content);
        })
        .catch(error => {
          console.error('[PostinfoEventHandler]: Failed to parse event.', event.content[0], error);
        });
    }
  }

  private async processEvent(client: PoolClient, position: number, eventName: string, ev: any): Promise<void> {
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

    if (typeof objectBody.Postnamen[0] === 'object') {
      postalNames = PostinfoUtils.mapPostnamen(objectBody.Postnamen[0].Postnaam);
    }

    console.log(`[PostinfoEventHandler]: Adding object for ${postalCode} at position ${position}.`);

    const recordTimestamp = new Date(Date.now()).toISOString();
    await db.addPostalInformation(
      client,
      position,
      eventName,
      versionId,
      postalCode,
      objectId,
      objectUri,
      JSON.stringify(postalNames),
      statusUri,
      this.indexNumber,
      recordTimestamp,
    );

    this.indexNumber++;
  }
}
