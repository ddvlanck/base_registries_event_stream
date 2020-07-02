import xml2js from 'xml2js';
import { PoolClient } from 'pg';

import { db } from '../utils/Db';

const parser = new xml2js.Parser();

export default class AddressEventHandler {
  async processPage(client: PoolClient, entries: Array<any>) {
    await this.processEvents(client, entries);
  }

  async processEvents(client: PoolClient, entries: Array<any>) {
    const self = this;

    for (let event of entries) {
      const position = Number(event.id[0]);
      const eventName = event.title[0].replace(`-${position}`, '');

      if (event.content[0] === 'No data embedded') {
        console.log(`Skipping ${eventName} at position ${position} because of missing embedded data.`);
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
          console.error('Failed to parse event.', event.content[0], err);
        });
    }
  }

  async processEvent(client: PoolClient, position: number, eventName: string, ev: any) {
    console.log(`Processing ${eventName} at position ${position}.`);

    const eventBody = ev.Event[0][Object.keys(ev.Event[0])[0]][0];
    const objectBody = ev.Object[0];

    // console.log(objectBody);

    const isComplete = objectBody.IsCompleet[0] === 'true';

    // Thanks to isComplete we always know if an object can be saved or not
    if (!isComplete) {
      console.log(`Skipping ${eventName} at position ${position} due to not having a complete object.`);
      return;
    }

    const addressId = eventBody.AddressId[0];

    const versieId = objectBody.Identificator[0].VersieId[0];
    const objectId = objectBody.Identificator[0].ObjectId[0];
    const objectUri = objectBody.Identificator[0].Id[0];

    const streetnameId = objectBody.StraatnaamId[0];
    const postalCode = typeof objectBody.PostCode[0] === 'object' ? null : objectBody.PostCode[0];
    const houseNumber = typeof objectBody.Huisnummer[0] === 'object' ? null : objectBody.Huisnummer[0];
    const boxNumber = typeof objectBody.Busnummer[0] === 'object' ? null : objectBody.Busnummer[0];
    const addressStatus = objectBody.AdresStatus[0];
    const addressPosition = this.createPoint(objectBody.AdresPositie[0]);
    const positionGeometryMethod = objectBody.PositieGeometrieMethode[0];
    const positionSpecification = objectBody.PositieSpecificatie[0];
    const officiallyAssigned = objectBody.OfficieelToegekend[0] === 'true';

    console.log(`Adding object for ${addressId} at position ${position}.`);
    await db.addAddress(
      client,
      position,
      eventName,
      addressId,
      versieId,
      objectId === '' ? null : objectId,
      objectUri,
      streetnameId,
      postalCode,
      houseNumber,
      boxNumber,
      addressStatus,
      addressPosition,
      positionGeometryMethod,
      positionSpecification,
      isComplete,
      officiallyAssigned);

    if (eventName === 'AddressPersistentLocalIdentifierWasAssigned') {
      console.log(`Assigning ${objectUri} for ${addressId} at position ${position}.`);

      db.setAddressPersistentId(client, addressId, objectId, objectUri);
    }
  }

  private createPoint(position) {
    const [X, Y] = position.point[0].pos[0].split(' ');
    return '(' + X + ',' + Y + ')';
  }
}
