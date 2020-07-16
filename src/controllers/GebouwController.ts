import {configuration} from '../utils/Configuration';
import {db} from '../utils/Db';
import {addHeaders} from '../utils/Headers';
import {addNext, addPrevious} from '../utils/HypermediaControls';

const BASE_URL = `${configuration.domainName}/building`;
const PAGE_SIZE = 5;

export async function getBuildingPage(req, res) {
  const page = parseInt(req.query.page, 10);

  if (!page) {
    res.redirect('?page=1');
  } else {
    const queryResponse = await db.getBuildingsPaged(page, PAGE_SIZE);
    addHeaders(res, PAGE_SIZE, queryResponse.rows.length);
    res.json(await buildResponse(queryResponse.rows, PAGE_SIZE, page));
  }
}

async function buildResponse(items: any[], pageSize: number, page: number) {
  const response = getContext();
  response['feed_url'] = BASE_URL;
  response['@id'] = `${BASE_URL}?page=${page}`;

  const tree = [];

  addNext(response, tree, items, pageSize, page, BASE_URL);
  addPrevious(response, tree, items, page, BASE_URL);

  if (tree.length) {
    response['tree:relation'] = tree;
  }

  response['items'] = await Promise.all(items.map(item => createBuildingEvent(item)));
  response['items'].unshift(getShape(`${BASE_URL}?page=${page}`));
  return response;
}

async function createBuildingEvent(data) {
  const buildingEvent = {};

  buildingEvent['isVersionOf'] = data.object_uri;
  buildingEvent['generatedAtTime'] = data.timestamp;
  buildingEvent['eventName'] = data.event_name;
  buildingEvent['memberOf'] = BASE_URL;
  buildingEvent['@type'] = 'Gebouw';

  buildingEvent['status'] = data.building_status;
  buildingEvent['Gebouw.geometrie'] = {
    '@type': '2DGebouwgeometrie',
    'methode': data.geometry_method,
    'geometrie': {
      '@type': 'Geometrie',
      'gml': {
        '@type': 'http://www.opengis.net/ont/geosparql#gmlLiteral',
        '@value': data.geometry_polygon
      }
    }
  }

  let units = [];
  if (data.building_units.length) {
    for (let unitID of data.building_units) {
      var queryResult = await db.getBuildingUnitForBuildingVersion(unitID, data.event_id);
      units.push(createBuildingUnit(queryResult.rows[0]));
    }
    buildingEvent['bestaatUit'] = units;
  }

  return buildingEvent;
}

function createBuildingUnit(unit) {
  const buildingUnit = {};

  buildingUnit['isVersionOf'] = unit.object_uri;
  buildingUnit['@type'] = 'Gebouweenheid';
  buildingUnit['functie'] = unit.function;
  buildingUnit['Gebouweenheid.status'] = unit.building_unit_status;

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

  buildingUnit['Gebouweenheid.methode'] = geometryMethod;     // No definition found for method of building unit
  buildingUnit['Gebouweenheid.geometrie'] = {
    '@type': 'Geometrie',
    'gml': {
      '@type': 'http://www.opengis.net/ont/geosparql#gmlLiteral',
      '@value': unit.geometry_point
    }
  }

  return buildingUnit;
}

function getShape(pageId: string) {
  return {
    '@id': pageId,
    'tree:shape': {
      'sh:property': [
        {
          'sh:path': 'http://purl.org/dc/terms/isVersionOf',
          'sh:nodeKind': 'sh:IRI',
          'sh:minCount': 1,
          'sh:maxCount': 1,
        },
        {
          'sh:path': 'http://www.w3.org/ns/prov#generatedAtTime',
          'sh:datatype': 'xsd:dateTime',
          'sh:minCount': 1,
          'sh:maxCount': 1
        },
        {
          'sh:path': 'http://www.w3.org/ns/adms#versionNotes',
          'sh:datatype': 'xsd:string',
          'sh:minCount': 1,
          'sh:maxCount': 1
        },
        {
          'sh:path': 'https://data.vlaanderen.be/ns/gebouw#Gebouw.status',
          'sh:datatype': 'http://www.w3.org/2004/02/skos/core#Concept',
          'sh:minCount': 1,
          'sh:maxCount': 1
        },
        {
          'sh:path': 'https://data.vlaanderen.be/ns/gebouw#Gebouw.geometrie',
          'sh:node': {
            'sh:property': [
              {
                'sh:path': 'https://data.vlaanderen.be/ns/gebouw#methode',
                'sh:datatype': 'http://www.w3.org/2004/02/skos/core#Concept',
                'sh:minCount': 1,
                'sh:maxCount': 1
              },
              {
                'sh:path': 'http://www.w3.org/ns/locn#geometry',
                'sh:node': {
                  'sh:property': {
                    'sh:path': 'http://www.opengis.net/ont/geosparql#asGML',
                    'sh:datatype': 'xsd:string',
                    'sh:minCount': 1,
                    'sh:maxCount': 1
                  }
                }
              }
            ]
          }
        },
        {
          'sh:path' : 'https://data.vlaanderen.be/ns/gebouw#bestaatUit',
          'sh:node' : {
            'sh:property' : [
              {
                'sh:path': 'http://purl.org/dc/terms/isVersionOf',
                'sh:nodeKind': 'sh:IRI',
                'sh:minCount': 1,
                'sh:maxCount': 1,
              },
              {
                'sh:path': 'https://data.vlaanderen.be/ns/gebouw#functie',
                'sh:datatype' : 'http://www.w3.org/2004/02/skos/core#Concept',
                'sh:minCount': 1,
                'sh:maxCount': 1
              },
              {
                'sh:path': 'https://data.vlaanderen.be/ns/gebouw#Gebouweenheid.status',
                'sh:datatype': 'http://www.w3.org/2004/02/skos/core#Concept',
                'sh:minCount': 1,
                'sh:maxCount': 1
              },
              {
                'sh:path': 'http://example.org/Gebouweenheid#methode',
                'sh:datatype' : 'http://www.w3.org/2004/02/skos/core#Concept',
                'sh:minCount': 1,
                'sh:maxCount': 1
              },
              {
                'sh:path': 'https://data.vlaanderen.be/ns/gebouw#Gebouweenheid.geometrie',
                'sh:node': {
                  'sh:property': {
                    'sh:path': 'http://www.opengis.net/ont/geosparql#asGML',
                    'sh:datatype': 'xsd:string',
                    'sh:minCount': 1,
                    'sh:maxCount': 1
                  }
                }
              }
            ]
          }
        }
      ]
    }
  }
}

function getContext() {
  return {
    '@context': [
      'https://data.vlaanderen.be/doc/applicatieprofiel/gebouwenregister',
      'https://data.vlaanderen.be/context/generiek-basis.jsonld',
      {
        'xsd': 'http://www.w3.org/2001/XMLSchema#',
        'prov': 'http://www.w3.org/ns/prov#',
        'eventName': 'http://www.w3.org/ns/adms#versionNotes',
        'generatedAtTime': 'prov:generatedAtTime',
        '2DGebouwgeometrie': 'https://data.vlaanderen.be/ns/gebouw#2DGebouwgeometrie',
        'Geometrie': 'http://www.w3.org/ns/locn#Geometry',
        'Gebouweenheid.methode': {
          '@id': 'http://example.org/Gebouweenheid#methode',
          '@type': 'http://www.w3.org/2004/02/skos/core#Concept'
        },
        'status': {
          '@id': 'https://data.vlaanderen.be/ns/gebouw#Gebouw.status',
          '@type': 'http://www.w3.org/2004/02/skos/core#Concept'
        },
        'methode': {
          '@id': 'https://data.vlaanderen.be/ns/gebouw#methode',
          '@type': 'http://www.w3.org/2004/02/skos/core#Concept'
        },
        'isCompleet': {
          '@id': 'https://basisregisters.vlaanderen.be/ns/gebouwenregister#isCompleet',
          '@type': 'xsd:boolean'
        },
        'items': {
          '@id': '@graph'
        },
        'isVersionOf': {
          '@id': 'http://purl.org/dc/terms/isVersionOf',
          '@type': '@id'
        },
        'hydra': 'http://www.w3.org/ns/hydra/core#',
        'next_url': {
          '@id': 'hydra:next',
          '@type': '@id'
        },
        'previous_url': {
          '@id': 'hydra:previous',
          '@type': '@id'
        },
        'tree': 'https://w3id.org/tree#',
        'feed_url': {
          '@reverse': 'tree:view',
          '@type': '@id'
        },
        'memberOf': {
          '@reverse': 'tree:member',
          '@type': '@id'
        },
        'tree:node': {
          '@type': '@id'
        },
        'tree:path': {
          '@type': '@id'
        },
        'sh': 'https://www.w3.org/ns/shacl#',
        'sh:nodeKind': {
          '@type': '@id',
        },
        'sh:path': {
          '@type': '@id',
        },
        'sh:datatype': {
          '@type': '@id',
        },
      }
    ]
  }
}
