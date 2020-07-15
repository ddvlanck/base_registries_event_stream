import {configuration} from "../utils/Configuration";
import {db} from "../utils/Db";
import {addHeaders} from "../utils/Headers";
import {addNext, addPrevious} from "../utils/HypermediaControls";

const BASE_URL = `${configuration.domainName}/building`;
const PAGE_SIZE = 5;

export async function getBuildingPage(req, res){
  const page = parseInt(req.query.page, 10);

  if (!page) {
    res.redirect('?page=1');
  } else {
    const queryResponse = await db.getBuildingsPaged(page, PAGE_SIZE);
    addHeaders(res, PAGE_SIZE, queryResponse.rows.length);
    res.json(buildResponse(queryResponse.rows, PAGE_SIZE, page));
  }
}

function buildResponse(items, pageSize, page){
  const response = getContext();
  response["feed_url"] = BASE_URL;
  response['@id'] = `${BASE_URL}?page=${page}`;

  const tree = [];

  addNext(response, tree, items, pageSize, page, BASE_URL);
  addPrevious(response, tree, items, page, BASE_URL);

  if (tree.length) {
    response["tree:relation"] = tree;
  }

  response["items"] = items.map((item) => createBuildingEvent(item));
  //response["items"].unshift(getShape(`${BASE_URL}?page=${page}`));
  //TODO: enabe getshape
  return response;
}

function createBuildingEvent(data){
  const buildingEvent = {};

  buildingEvent['isVersionOf'] = data.object_uri;
  buildingEvent['generatedAtTime'] = data.timestamp;
  buildingEvent['eventName'] = data.event_name;
  buildingEvent['memberOf'] = BASE_URL;
  buildingEvent['@type'] = 'Gebouw';

  buildingEvent['gebouwstatus'] = data.building_status;
  buildingEvent['geometrie'] = {
    '@type' : '2D-Gebouwgeometrie',
    'methode' : data.geometry_method,
    'geometrie' : {
      '@type' : 'Geometrie',
      'gml' : {
        '@type' : 'http://www.opengis.net/ont/geosparql#gmlLiteral',
        '@value' : data.geometry_polygon
      }
    }
  }

  //TODO: have to wait for the response, but method does not include building units
  if(data.building_units.length){
    for(let unitID of data.building_units){
      db.getBuildingUnitsForBuildingVersion(unitID, data.event_id).then(response => {
        buildingEvent['bestaat_uit'] = response.rows.map((unit) => createBuildingUnit(unit));
        console.log(buildingEvent['bestaat_uit']);
      });
    }
  }
  return buildingEvent;
}

function createBuildingUnit(unit){
  const buildingUnit = {};

  buildingUnit['isVersionOf'] = unit.object_uri;
  buildingUnit['@type'] = 'Gebouweenheid';
  buildingUnit['functie'] = unit.function;
  buildingUnit['status'] = unit.building_unit_status;

  let geometryMethod;
  switch (unit.position_geometry_method) {
    case 'AangeduidDoorBeheerder':
      geometryMethod = 'http://inspire.ec.europa.eu/codelist/GeometryMethodValue/byAdministrator';
      break;
    case 'AfgeleidVanObject':
      geometryMethod = 'http://inspire.ec.europa.eu/codelist/GeometryMethodValue/fromFeature';
      break;
    default:
      geometryMethod = '';
      break;
  }

  buildingUnit['positie'] = {
    '@type' : 'GeografischePositie',
    'methode' : geometryMethod,
    'geometrie' : {
      '@type' : 'Point',
      'gml' : unit.geometry_point
    }
  }

  return buildingUnit;
}

function getShape(pageId: string){

}

function getContext(){
  return {
    "@context": [
      "http://data.vlaanderen.be/context/gebouw.jsonld",
      {
        "xsd": "http://www.w3.org/2001/XMLSchema#",
        "prov" : "http://www.w3.org/ns/prov#",
        "eventName": "http://www.w3.org/ns/adms#versionNotes",
        "generatedAtTime" : "prov:generatedAtTime",
        "isCompleet": {
          "@id": "https://basisregisters.vlaanderen.be/ns/gebouwenregister#isCompleet",
          "@type": "xsd:boolean"
        },
        "items": {
          "@id": "@graph"
        },
        "isVersionOf": {
          "@id": "http://purl.org/dc/terms/isVersionOf",
          "@type": "@id"
        },
        "hydra": "http://www.w3.org/ns/hydra/core#",
        "next_url": {
          "@id": "hydra:next",
          "@type": "@id"
        },
        "previous_url": {
          "@id": "hydra:previous",
          "@type": "@id"
        },
        "tree": "https://w3id.org/tree#",
        "feed_url": {
          "@reverse": "tree:view",
          "@type": "@id"
        },
        "memberOf": {
          "@reverse": "tree:member",
          "@type": "@id"
        },
        "tree:node": {
          "@type": "@id"
        },
        "tree:path": {
          "@type": "@id"
        },
        "sh": "https://www.w3.org/ns/shacl#",
        "sh:nodeKind": {
          "@type": "@id",
        },
        "sh:path": {
          "@type": "@id",
        },
        "sh:datatype": {
          "@type": "@id",
        },
      }
    ]
  }
}
