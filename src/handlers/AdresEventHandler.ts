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

      await parser
        .parseStringPromise(event.content[0])
        .then(async function (ev) {
          await self.processEvent(client, position, eventName, ev);
        })
        .catch(function (err) {
          console.log('Failed to parse event.', err);
        });
    }
  }

  async processEvent(client: PoolClient, position: number, eventName: string, ev: any) {
    console.log(`Processing ${eventName} at position ${position}.`);

    const eventBody = ev.Event[0];
    const objectBody = ev.Object[0];

    const isComplete = objectBody.IsCompleet[0] === 'true';

    // Thanks to isComplete we always know if an object can be saved or not
    if (!isComplete)
      return;

    const addressId = eventBody[0].AddressId[0];

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

    await db.addAddress(
      client,
      addressId,
      versieId,
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
      isComplete,
      officiallyAssigned);

    if (eventName === '') {
      db.setAddressPersistentId(client, addressId, objectId, objectUri);
    }
  }

  private createPoint(position) {
    const [X, Y] = position.point[0].pos[0].split(' ');
    return '(' + X + ',' + Y + ')';
  }
}
