import type { PoolClient } from 'pg';
import { Parser } from 'xml2js';
import { db } from '../utils/DatabaseQueries';
import { GemeenteUtils } from './GemeenteUtils';

const parser = new Parser();

export default class GemeenteEventHandler {
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
        console.log(`[GemeenteEventHandler]: Skipping ${eventName} at position ${position} because of missing embedded data.`);
        continue;
      }

      await parser
        .parseStringPromise(event.content[0])
        .then(async ev => {
          await this.processEvent(client, position, eventName, ev.Content);
        })
        .catch(error => {
          console.error('[GemeenteEventHandler]: Failed to parse event.', event.content[0], error);
        });
    }
  }

  private async processEvent(client: PoolClient, position: number, eventName: string, ev: any): Promise<void> {
    console.log(`[GemeenteEventHandler]: Processing ${eventName} at position ${position}.`);

    const eventBody = ev.Event[0][Object.keys(ev.Event[0])[0]][0];
    const objectBody = ev.Object[0];

    const status = typeof objectBody.GemeenteStatus[0] === 'object' ? null : objectBody.GemeenteStatus[0];

    // Thanks to status we always know if an object can be processed or not
    if (!status) {
      console.log(`[GemeenteEventHandler]: Skipping ${eventName} at position ${position} due to not having a status (and thus not complete).`);
      return;
    }

    const municipalityId = eventBody.MunicipalityId[0];

    const versieId = objectBody.Identificator[0].VersieId[0];
    const objectId = objectBody.Identificator[0].ObjectId[0];
    const objectUri = objectBody.Identificator[0].Id[0];
    const officialLangues = typeof objectBody.OfficieleTalen[0] === 'object' ?
      GemeenteUtils.extractLanguages(objectBody.OfficieleTalen) :
      null;
    const facilityLanguages = typeof objectBody.FaciliteitenTalen[0] === 'object' ?
      GemeenteUtils.extractLanguages(objectBody.FaciliteitenTalen) :
      null;
    const municipalityNames = typeof objectBody.Gemeentenamen[0] === 'object' ?
      GemeenteUtils.mapGeographicalNames(objectBody.Gemeentenamen) :
      null;
    const mappedStatus = GemeenteUtils.mapStatus(status);

    // Extra check to verify whether the object is actually complete and can therefore be saved
    const complete = GemeenteUtils.checkIfVersionCanBeAddedToDatabase(
      officialLangues,
      municipalityNames,
      status,
    );

    if (!complete) {
      console.log(`[GemeenteEventHandler]: Skipping ${eventName} at position ${position} because other checks have shown that this event does not contain a complete object.`);
      return;
    }

    console.log(`[GemeenteEventHandler]: Adding object for ${municipalityId} at position ${position}.`);

    const recordTimestamp = new Date(Date.now()).toISOString();
    await db.addMunicipality(
      client,
      position,
      eventName,
      versieId,
      municipalityId,
      objectId,
      objectUri,
      officialLangues,
      facilityLanguages,
      JSON.stringify(municipalityNames),
      mappedStatus,
      this.indexNumber,
      recordTimestamp,
    );

    this.indexNumber++;

    console.log(`[GemeenteEventHandler]: Adding object for ${municipalityId} at position ${position} in address-municipality table`);
    await db.updateAddressMunicipalityTable(
      client,
      municipalityId,
      objectUri,
      objectId,
      JSON.stringify(municipalityNames),
      position,
      versieId,
    );
  }
}
