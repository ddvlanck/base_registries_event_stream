import {PoolClient} from "pg";
import {db} from "../utils/Db";
import {type} from "os";

const xml2js = require('xml2js');
const parser = new xml2js.Parser();

export default class GebouwEventHandler {
  async processPage(client: PoolClient, entries: Array<any>) {
    await this.processEvents(client, entries);
  }

  async processEvents(client: PoolClient, entries: Array<any>) {
    const self = this;

    for (let event of entries) {
      const position = Number(event.id[0]);
      const eventName = event.title[0].replace(`-${position}`, '');

      if (event.content[0] === 'No data embedded') {
        console.log(`[GebouwEventHandler]: Skipping ${eventName} at position ${position} because of missing embedded data.`);
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
          console.error('[GebouwEventHandler]: Failed to parse event.', event.content[0], err);
        });
    }
  }

  async processEvent(client: PoolClient, position: number, eventName: string, ev: any) {
    console.log(`[GebouwEventHandler]: Processing ${eventName} at position ${position}.`);

    const eventBody = ev.Event[0][Object.keys(ev.Event[0])[0]][0];
    const objectBody = ev.Object[0];

    // console.log(objectBody);

    const isComplete = objectBody.IsCompleet[0] === 'true';

    // Thanks to isComplete we always know if an object can be saved or not
    if (!isComplete) {
      console.log(`[GebouwEventHandler]: Skipping ${eventName} at position ${position} due to not having a complete object.`);
      return;
    }

    // We check if there is a building unit
    let buildingUnitObjects = [];
    let buildingUnitIDs = [];

    if (typeof objectBody.Gebouweenheden[0] === 'object') {
      const buildingUnits = objectBody.Gebouweenheden[0].Gebouweenheid

      for (let unit of buildingUnits){
        const isComplete = unit.IsCompleet[0] === 'true';

        if(!isComplete){
          console.log(`[GebouwEventHandler]: One of the building units is not complete yet, so skipping ${eventName} at position ${position} `)
          return;
        }


        const buildingUnitObjectId = unit.Identificator[0].ObjectId[0];
        const buildingUnitObjectUri = unit.Identificator[0].Id[0];

        const buildingUnitId = unit.Id[0];
        const buildingUnitStatus = unit.GebouweenheidStatus[0];
        const positionGeometryMethod = unit.PositieGeometrieMethode[0];
        const unitFunction = unit.Functie[0];
        let geometryPoint = null;

        if(unit.GeometriePunt[0].hasOwnProperty('point')){
          geometryPoint = unit.GeometriePunt[0].point[0].pos[0]
        }

        buildingUnitObjects.push({
          buildingUnitObjectId: buildingUnitObjectId,
          buildingUnitObjectUri: buildingUnitObjectUri,
          buildingUnitId: buildingUnitId,
          buildingUnitStatus: buildingUnitStatus,
          positionGeometryMethod: positionGeometryMethod,
          unitFunction: unitFunction,
          geometryPoint: geometryPoint,
          isComplete: isComplete
        })

        buildingUnitIDs.push(buildingUnitId);
        // Maybe add property for 'Locatieaanduiding' -- Address field in data
      }
    }


    const versieId = objectBody.Identificator[0].VersieId[0];
    const objectId = objectBody.Identificator[0].ObjectId[0];
    const objectUri = objectBody.Identificator[0].Id[0];

    const buildingId = eventBody.BuildingId[0];

    const buildingStatus = objectBody.GebouwStatus[0];
    const geometryMethod = objectBody.GeometrieMethode[0];
    const geometryPolygon = objectBody.GeometriePolygoon[0].polygon[0].exterior[0].LinearRing[0].posList[0]


    console.log(`[GebouwEventHandler]: Adding object for ${buildingId} at position ${position}.`);
    await db.addBuilding(
      client,
      position,
      eventName,
      buildingId,
      versieId,
      objectId === '' ? null : objectId,
      objectUri,
      buildingStatus,
      geometryMethod,
      geometryPolygon,
      buildingUnitIDs,
      isComplete
    );

    if(buildingUnitIDs.length > 0){
      console.log(`[GebouwEventHandler]: Adding ${buildingUnitIDs.length} building unit(s) for ${buildingId} at position ${position}.`);
      for(let unit of buildingUnitObjects){
        await db.addBuildingUnit(
          client,
          position,
          unit.buildingUnitId,
          buildingId,
          unit.buildingUnitObjectId === '' ? null: unit.buildingUnitObjectId,
          unit.buildingUnitObjectUri,
          unit.buildingUnitStatus,
          unit.positionGeometryMethod,
          unit.geometryPoint,
          unit.unitFunction,
          unit.isComplete
        )

        if(eventName === 'BuildingUnitPersistentLocalIdentifierWasAssigned' && unit.buildingUnitId === eventBody.BuildingUnitId[0]){
          console.log(`[GebouwEventHandler]: Assigning ${unit.buildingUnitObjectUri} for building unit ${unit.buildingUnitId} at position ${position}.`);
          db.setBuildingUnitPersistentId(client, unit.buildingUnitId, unit.buildingUnitObjectId, unit.buildingUnitObjectUri);
        }
      }
    }

    if(eventName === 'BuildingPersistentLocalIdentifierWasAssigned'){
      console.log(`[GebouwEventHandler]: Assigning ${objectUri} for building ${buildingId} at position ${position}.`);

      db.setBuildingPersistentId(client, buildingId, objectId, objectUri);
    }

    //TODO: process the event where PURI is assigned to building unit
    // need to add 2 extra columns: object_id and object_uri
  }
}
