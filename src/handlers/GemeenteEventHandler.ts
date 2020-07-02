import {PoolClient} from "pg";
import {db} from "../utils/Db";

const xml2js = require('xml2js');
const parser = new xml2js.Parser();

export default class GemeenteEventHandler {
  async processPage(client: PoolClient, entries: Array<any>) {
    await this.processEvents(client, entries);
  }

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
          console.error('Failed to parse event.', event.content[0], err);
        });
    }
  }

  async processEvent(client: PoolClient, position: number, eventName: string, ev: any) {
    console.log(`Processing ${eventName} at position ${position}.`);

    const eventBody = ev.Event[0][Object.keys(ev.Event[0])[0]][0];
    const objectBody = ev.Object[0];

    const status = typeof objectBody.GemeenteStatus[0] === 'object' ? null : objectBody.GemeenteStatus[0];

    //console.log(objectBody);

    // Thanks to hasStatus we always know if an object can be saved or not
    if (!status) {
      console.log(`Skipping ${eventName} at position ${position} due to not having a status (and thus not complete).`);
      return;
    }

    const municipalityId = eventBody.MunicipalityId[0];

    const versieId = objectBody.Identificator[0].VersieId[0];
    const objectId = objectBody.Identificator[0].ObjectId[0];
    const objectUri = objectBody.Identificator[0].Id[0];
    const officialLangues = typeof objectBody.OfficieleTalen[0] === 'object' ? objectBody.OfficieleTalen[0].Taal: null;
    const facilityLanguages = typeof objectBody.FaciliteitenTalen[0] === 'object' ? objectBody.FaciliteitenTalen[0].Taal: null;
    const geographicalNames = typeof objectBody.Gemeentenamen[0] === 'object' ? objectBody.Gemeentenamen[0].GeografischeNaam[0].Spelling[0]: null;
    const geographicalNameLanguages = typeof objectBody.Gemeentenamen[0] === 'object' ? objectBody.Gemeentenamen[0].GeografischeNaam[0].Taal[0]: null;

    console.log(`Adding object for ${municipalityId} at position ${position}.`);
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
      geographicalNames,
      geographicalNameLanguages,
      status
    );



  }
}
