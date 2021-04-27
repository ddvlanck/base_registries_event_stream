import xml2js from 'xml2js';
import { PoolClient } from 'pg';
import { db } from '../utils/DatabaseQueries';
import StraatnaamUtils from './StraatnaamUtils';

const parser = new xml2js.Parser();

const eventsToIgnore = [
  'StreetNameBecameComplete',
  'StreetNameBecameIncomplete'
]

export default class StraatnaamEventHandler {
  async processPage(client: PoolClient, entries: Array<any>) {
    await this.processEvents(client, entries);
  }

  async processEvents(client: PoolClient, entries: Array<any>) {
    const self = this;

    for (let event of entries) {
      const position = Number(event.id[0]);
      const eventName = event.title[0].replace(`-${position}`, '');

      if (event.content[0] === 'No data embedded') {
        console.log(`[StreetNameEventHandler]: Skipping ${eventName} at position ${position} because of missing embedded data.`);
        continue;
      }

      if(eventsToIgnore.includes(eventName)){
        console.log(`[StreetNameEventHandler]: Skipping ${eventName} at position ${position} because these events have to be ignored.`);
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
          console.error('[StreetNameEventHandler]: Failed to parse event.', event.content[0], err);
        });
    }
  }

  async processEvent(client: PoolClient, position: number, eventName: string, ev: any) {
    console.log(`[StreetNameEventHandler]: Processing ${eventName} at position ${position}.`);

    const eventBody = ev.Event[0][Object.keys(ev.Event[0])[0]][0];
    const objectBody = ev.Object[0];

    const addToDatabase = StraatnaamUtils.checkIfVersionCanBeAddedToDatabase(
      objectBody.Straatnamen[0].GeografischeNaam,
      objectBody.StraatnaamStatus[0],
      objectBody.NisCode[0]
    );

    if(!addToDatabase){
      console.log(`[StreetNameEventHandler]: Skipping ${eventName} at position ${position} due to not having a complete object`);
      return;
    }

    const streetNameId = eventBody.StreetNameId[0];

    const versionId = objectBody.Identificator[0].VersieId[0];
    const objectId = objectBody.Identificator[0].ObjectId[0];
    const objectUri = objectBody.Identificator[0].Id[0];

    let geographicalNames = []
    geographicalNames = StraatnaamUtils.mapGeographicalNames(objectBody.Straatnamen[0].GeografischeNaam);
    
    const streetNameStatus = StraatnaamUtils.mapStreetNameStatus(objectBody.StraatnaamStatus[0]);
    const nisCode = objectBody.NisCode[0];

    console.log(`[StreetNameEventHandler]: Adding object for ${streetNameId} at position ${position}.`);
    await db.addStreetName(
      client,
      position,
      eventName,
      versionId,
      streetNameId,
      objectId === '' ? null : objectId,
      objectUri,
      JSON.stringify(geographicalNames),
      streetNameStatus,
      nisCode
      );

    if (eventName === 'StreetNamePersistentLocalIdentifierWasAssigned') {
      console.log(`[StreetNameEventHandler]: Assigning ${objectUri} for ${streetNameId} at position ${position}.`);

      db.setStreetNamePersistentId(client, streetNameId, objectId, objectUri);
    }

    console.log(`[StreetNameEventHandler]: Adding object for ${streetNameId} at position ${position} for address-streetname.`);
    await db.updateAddressStreetnameTable(
      client,
      streetNameId,
      objectUri,
      nisCode,
      position,
      versionId
    );
  }
}
