import {PoolClient} from "pg";
import {db} from "../utils/DatabaseQueries";
import xml2js from "xml2js";

const parser = new xml2js.Parser();

export default class GebouweenheidEventHandler {

  // This function is a little
  async processEvent(client: PoolClient, position: number, eventName: string, ev: any) {
    console.log(`[GebouweenheidEventHandler]: Processing ${eventName} at position ${position}.`);

    // We check if there is a building unit
    /*let buildingUnitObjects = [];
    let buildingUnitIDs = [];

    if (typeof objectBody.Gebouweenheden[0] === 'object') {
      const buildingUnits = objectBody.Gebouweenheden[0].Gebouweenheid

      for (let unit of buildingUnits) {
        const isComplete = unit.IsCompleet[0] === 'true';

        if (!isComplete) {
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

        if (unit.GeometriePunt[0].hasOwnProperty('point')) {
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
    }*/
  }



}
