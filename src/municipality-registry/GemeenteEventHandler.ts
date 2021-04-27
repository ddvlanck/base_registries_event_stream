import xml2js from 'xml2js';
import { PoolClient } from 'pg';
import { db } from '../utils/DatabaseQueries';
import GemeenteUtils from './GemeenteUtils';

const parser = new xml2js.Parser();

export default class GemeenteEventHandler {
  async processPage(client: PoolClient, entries: Array<any>) {
    await this.processEvents(client, entries);
  }

  //TODO: check whether it is better to update existing record when event is 'MunicipalityWasNamed'
  async processEvents(client: PoolClient, entries: Array<any>) {
    const self = this;

    for (let event of entries) {
      const position = Number(event.id[0]);
      const eventName = event.title[0].replace(`-${position}`, '');

      if (event.content[0] === 'No data embedded') {
        console.log(`[GemeenteEventHandler]: Skipping ${eventName} at position ${position} because of missing embedded data.`);
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
          console.error('[GemeenteEventHandler]: Failed to parse event.', event.content[0], err);
        });
    }
  }

  async processEvent(client: PoolClient, position: number, eventName: string, ev: any) {
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
    const officialLangues = typeof objectBody.OfficieleTalen[0] === 'object' ? GemeenteUtils.extractLanguages(objectBody.OfficieleTalen): null;
    const facilityLanguages = typeof objectBody.FaciliteitenTalen[0] === 'object' ? GemeenteUtils.extractLanguages(objectBody.FaciliteitenTalen): null;
    const municipalityNames = typeof objectBody.Gemeentenamen[0] === 'object' ? GemeenteUtils.mapGeographicalNames(objectBody.Gemeentenamen): null;
    const mappedStatus = GemeenteUtils.mapStatus(status);

    // Extra check to verify whether the object is actually complete and can therefore be saved
    const complete = GemeenteUtils.checkIfVersionCanBeAddedToDatabase(
      officialLangues,
      municipalityNames,
      status
    );

    if(!complete){
      console.log(`[GemeenteEventHandler]: Skipping ${eventName} at position ${position} because other checks have shown that this event does not contain a complete object.`);
      return;
    }
    
    console.log(`[GemeenteEventHandler]: Adding object for ${municipalityId} at position ${position}.`);
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
      mappedStatus
    );

    console.log(`[GemeenteEventHandler]: Adding object for ${municipalityId} at position ${position} in address-municipality table`);
    await db.updateAddressMunicipalityTable(
      client,
      municipalityId,
      objectUri,
      objectId,
      JSON.stringify(municipalityNames),
      position,
      versieId
    )
  }
}
