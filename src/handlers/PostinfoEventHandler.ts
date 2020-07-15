import xml2js from 'xml2js';
import { PoolClient } from 'pg';
import { type } from 'os';

import { db } from '../utils/Db';

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

    // console.log(objectBody);

    const status = typeof objectBody.PostInfoStatus[0] === 'object' ? null : objectBody.PostInfoStatus[0];

    // Thanks to status we always know if an object can be saved or not
    if (!status) {
      console.log(`[PostinfoEventHandler]: Skipping ${eventName} at position ${position} due to not having a complete object.`);
      return;
    }

    const postInfoId = eventBody.PostalCode[0];

    const versieId = objectBody.Identificator[0].VersieId[0];
    const objectId = objectBody.Identificator[0].ObjectId[0];
    const objectUri = objectBody.Identificator[0].Id[0];
    const nisCode = typeof objectBody.NisCode[0] === 'object' ? null: objectBody.NisCode[0];

    let postNamen = [];
    let postNamenTaal = [];

    if (typeof objectBody.Postnamen[0] === 'object') {
      const postnamen = objectBody.Postnamen[0].Postnaam;

      for (let postnaam of postnamen) {
        postNamen.push(postnaam.GeografischeNaam[0].Spelling[0]);
        postNamenTaal.push(postnaam.GeografischeNaam[0].Taal[0]);
      }
    }

    console.log(`[PostinfoEventHandler]: Adding object for ${postInfoId} at position ${position}.`);
    await db.addPostalInformation(
      client,
      position,
      eventName,
      versieId,
      postInfoId,
      objectId,
      objectUri,
      postNamen,
      postNamenTaal,
      nisCode,
      status
    );
  }
}
