import xml2js from 'xml2js';
import { PoolClient } from 'pg';
import { db } from '../utils/DatabaseQueries';
import AdresUtils from './AdresUtils';

const parser = new xml2js.Parser();

const eventsToIgnore = [
  'AddressBecameComplete'
]

export default class AddressEventHandler {
  private indexNumber: number;

  constructor() {
    this.indexNumber = 1;
  }

  async processPage(client: PoolClient, entries: Array<any>) {
    await this.processEvents(client, entries);
  }

  async processEvents(client: PoolClient, entries: Array<any>) {
    const self = this;

    for (let event of entries) {
      const position = Number(event.id[0]);
      const eventName = event.title[0].replace(`-${position}`, '');

      if (event.content[0] === 'No data embedded') {
        console.log(`[AdresEventHandler]: Skipping ${eventName} at position ${position} because of missing embedded data.`);
        continue;
      }

      if (eventsToIgnore.includes(eventName)) {
        console.log(`[AdresEventHandler]: Skipping ${eventName} at position ${position}, because it is included in the list of events which should be skipped.`);
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
          console.error('[AdresEventHandler]: Failed to parse event.', event.content[0], err);
        });
    }
  }

  async processEvent(client: PoolClient, position: number, eventName: string, ev: any) {
    console.log(`[AdresEventHandler]: Processing ${eventName} at position ${position}.`);

    const eventBody = ev.Event[0][Object.keys(ev.Event[0])[0]][0];
    const objectBody = ev.Object[0];

    const addressId = eventBody.AddressId[0];

    const versieId = objectBody.Identificator[0].VersieId[0];
    const objectId = objectBody.Identificator[0].ObjectId[0];
    const objectUri = objectBody.Identificator[0].Id[0];

    const streetnameId = objectBody.StraatnaamId[0];
    const postalCode = typeof objectBody.PostCode[0] === 'object' ? null : objectBody.PostCode[0];
    const houseNumber = typeof objectBody.Huisnummer[0] === 'object' ? null : objectBody.Huisnummer[0];
    const boxNumber = typeof objectBody.Busnummer[0] === 'object' ? null : objectBody.Busnummer[0];
    const addressStatus = typeof objectBody.AdresStatus[0] === 'object' ? null : objectBody.AdresStatus[0];
    const addressPosition = objectBody.AdresPositie[0].hasOwnProperty('point') === false ? null : this.createGmlString(objectBody.AdresPositie[0]);
    const positionGeometryMethod = typeof objectBody.PositieGeometrieMethode[0] === 'object' ? null : objectBody.PositieGeometrieMethode[0];
    const positionSpecification = typeof objectBody.PositieSpecificatie[0] === 'object' ? null : objectBody.PositieSpecificatie[0];
    const officiallyAssigned = objectBody.OfficieelToegekend[0] === 'true';

    let versionCanBePublished = AdresUtils.checkIfVersionCanBePublished(
      streetnameId,
      postalCode,
      houseNumber,
      officiallyAssigned,
      addressPosition,
      positionGeometryMethod,
      positionSpecification,
      addressStatus,
      objectId
    );

    if (!versionCanBePublished) {
      console.log(`[AdresEventHandler]: Object verification have shown that object for ${addressId} at position ${position} is not complete or does not have a persistent URI yet and can therefore not be published.`);
      return;
    }

    const mappedStatus = AdresUtils.mapAddressStatus(addressStatus);
    const mappedPositionGeometryMethod = AdresUtils.mapGeometryPositionMethod(positionGeometryMethod);
    const mappedGeometrySpecification = AdresUtils.mapGeometrySpecification(positionSpecification);

    console.log(`[AdresEventHandler]: Adding object for ${addressId} at position ${position}.`);

    const recordTimestamp = new Date(Date.now()).toISOString();
    await db.addAddress(
      client,
      position,
      eventName,
      addressId,
      versieId,
      typeof objectId === 'object' ? null : objectId,
      objectUri,
      streetnameId,
      postalCode,
      houseNumber,
      boxNumber,
      mappedStatus,
      addressPosition,
      mappedPositionGeometryMethod,
      mappedGeometrySpecification,
      officiallyAssigned,
      versionCanBePublished,
      this.indexNumber,
      recordTimestamp
    );

    this.indexNumber++;

    /*
      That event will always happen immediately after the original initialization. This is because, for example, a mistake was made and then corrected.
    */
    if (eventName === 'AddressWasRemoved') {
      console.log(`[AdresEventHandler]: Records for ${addressId} (position = ${position}) will not be published anymore because it was removed.`);
      db.addressWasRemoved(client, addressId);
    }
  }

  private createGmlString(position) {
    const coords = position.point[0].pos[0];
    return `<gml:Point><gml:pos srsDimension='2'>${coords}</gml:pos></gml:Point>`
  }
}
