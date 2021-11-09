import type { PoolClient } from 'pg';
import { Parser } from 'xml2js';
import { db } from '../utils/DatabaseQueries';
import { AdresUtils } from './AdresUtils';

const parser = new Parser();

const eventsToIgnore = new Set([
  'AddressBecameComplete',
]);

export default class AddressEventHandler {
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
        console.log(`[AdresEventHandler]: Skipping ${eventName} at position ${position} because of missing embedded data.`);
        continue;
      }

      if (eventsToIgnore.has(eventName)) {
        console.log(`[AdresEventHandler]: Skipping ${eventName} at position ${position}, because it is included in the list of events which should be skipped.`);
        continue;
      }

      await parser
        .parseStringPromise(event.content[0])
        .then(async ev => {
          await this.processEvent(client, position, eventName, ev.Content);
        })
        .catch(error => {
          console.error('[AdresEventHandler]: Failed to parse event.', event.content[0], error);
        });
    }
  }

  private async processEvent(client: PoolClient, position: number, eventName: string, ev: any): Promise<void> {
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
    // eslint-disable-next-line unicorn/prefer-object-has-own
    const addressPosition = Object.prototype.hasOwnProperty.call(objectBody.AdresPositie[0], 'point') === false ?
      null :
      this.createGmlString(objectBody.AdresPositie[0]);
    const positionGeometryMethod = typeof objectBody.PositieGeometrieMethode[0] === 'object' ?
      null :
      objectBody.PositieGeometrieMethode[0];
    const positionSpecification = typeof objectBody.PositieSpecificatie[0] === 'object' ?
      null :
      objectBody.PositieSpecificatie[0];
    const officiallyAssigned = objectBody.OfficieelToegekend[0] === 'true';

    const versionCanBePublished = AdresUtils.checkIfVersionCanBePublished(
      streetnameId,
      postalCode,
      houseNumber,
      officiallyAssigned,
      addressPosition,
      positionGeometryMethod,
      positionSpecification,
      addressStatus,
      objectId,
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
      recordTimestamp,
    );

    this.indexNumber++;

    //
    // That event will always happen immediately after the original initialization.
    // This is because, for example, a mistake was made and then corrected.
    //
    if (eventName === 'AddressWasRemoved') {
      console.log(`[AdresEventHandler]: Records for ${addressId} (position = ${position}) will not be published anymore because it was removed.`);
      await db.addressWasRemoved(client, addressId);
    }
  }

  private createGmlString(position): string {
    const coords = position.point[0].pos[0];
    return `<gml:Point><gml:pos srsDimension='2'>${coords}</gml:pos></gml:Point>`;
  }
}
