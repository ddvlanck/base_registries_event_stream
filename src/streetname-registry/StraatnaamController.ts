import { configuration } from '../utils/Configuration';
import { db } from '../utils/DatabaseQueries';
import { addNext, addPrevious } from '../utils/HypermediaControls';
import { addHeaders } from '../utils/Headers';
import StraatnaamUtils from './StraatnaamUtils';

const STREETNAME_PAGE_BASE_URL = `${configuration.domainName}/straatnaam`;
const STREETNAME_SHACL_BASE_URL = `${configuration.domainName}/straatnaam/shape`;
const MUNICIPALITY_NAMESPACE = `https://data.vlaanderen.be/id/gemeente`;
const STREETNAME_CONTEXT_URL = `${configuration.domainName}/straatnaam/context`;
const PAGE_SIZE = 250;

// Get all events for all street names
export async function getStreetNamePage(req, res) {
  const page = parseInt(req.query.page, 10);

  if (!page) {
    res.redirect('?page=1');
  } else {
    const queryResponse = await db.getStreetNamesPaged(page, PAGE_SIZE);
    addHeaders(res, PAGE_SIZE, queryResponse.rows.length);
    res.json(buildStreetNamePageResponse(queryResponse.rows, PAGE_SIZE, page));
  }
}

export async function getStreetNameShape(req, res){
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/ld+json'
  });
  res.json(buildStreetNameShaclResponse());
}

export async function getStreetNameContext(req, res){
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/ld+json'
  });
  res.json(StraatnaamUtils.getStreetNameContext());
}

function buildStreetNamePageResponse(items: any[], pageSize: number, page: number) {
  //const response = StraatnaamUtils.getStreetNameContext();
  const response = {};
  response['@context'] = `${STREETNAME_CONTEXT_URL}`;
  
  response['@id'] = `${STREETNAME_PAGE_BASE_URL}?page=${page}`;
  response['viewOf'] = `${STREETNAME_PAGE_BASE_URL}`;

  const tree = [];

  addNext( tree, items.length, pageSize, page, STREETNAME_PAGE_BASE_URL);
  addPrevious( tree, items.length, page, STREETNAME_PAGE_BASE_URL);

  if (tree.length) {
    response['tree:relation'] = tree;
  }

  response['shacl'] = {
    '@id' : STREETNAME_PAGE_BASE_URL,
    'shape' : STREETNAME_SHACL_BASE_URL
  }

  response['items'] = items.map((item) => createStreetNameEvent(item));

  return response;
}

function buildStreetNameShaclResponse(){
  const response = StraatnaamUtils.getStreetNameShaclContext();

  response['@id'] = STREETNAME_SHACL_BASE_URL;
  response['@type'] = "NodeShape";
  response['shapeOf'] = STREETNAME_PAGE_BASE_URL;
  response['sh:property'] = StraatnaamUtils.getStreetNameShape();

  return response;
}

function createStreetNameEvent(data) {
  const streetNameEvent = {};

  const hash = StraatnaamUtils.createObjectHash(data);

  streetNameEvent['@id'] = `${STREETNAME_PAGE_BASE_URL}#${hash}`;
  streetNameEvent['isVersionOf'] = data.object_uri;
  streetNameEvent['generatedAtTime'] = data.timestamp;
  streetNameEvent['eventName'] = data.event_name;
  streetNameEvent['memberOf'] = STREETNAME_PAGE_BASE_URL;
  
  streetNameEvent['@type'] = 'Straatnaam';
  streetNameEvent['straatnaam'] = data.geographical_name;

  streetNameEvent['isToegekendDoor'] = `${MUNICIPALITY_NAMESPACE}/${data.nis_code}`;
  streetNameEvent['status'] = data.street_name_status;

  return streetNameEvent;
}

function getShape(pageId: string) {
  return {
    '@id': pageId,
    'tree:shape' : {
      'sh:property' : [
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
          'sh:path' : 'http://www.w3.org/2000/01/rdf-schema#label',
          'sh:datatype' : 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
          'sh:minCount' : 1,
          'sh:maxCount' : 1
        },
        {
          'sh:path' : 'https://data.vlaanderen.be/ns/adres#Straatnaam.status',
          'sh:datatype': 'http://www.w3.org/2004/02/skos/core#Concept',
          'sh:minCount': 1,
          'sh:maxCount': 1
        },
        {
          'sh:path' : 'http://www.w3.org/ns/prov#wasAttributedTo',
          'sh:nodeKind' : 'sh:IRI',
          'sh:minCount': 1,
          'sh:maxCount': 1
        },
        {
          'sh:path': 'https://basisregisters.vlaanderen.be/ns/addressenregister#isCompleet',
          'sh:datatype': 'xsd:boolean',
          'sh:minCount': 1,
          'sh:maxCount': 1
        }
      ]
    }
  }
}

function getContext() {
  return {
    '@context': [
      'https://data.vlaanderen.be/context/adresregister.jsonld',
      {
        'xsd': 'http://www.w3.org/2001/XMLSchema#',
        'prov' : 'http://www.w3.org/ns/prov#',
        'eventName': 'http://www.w3.org/ns/adms#versionNotes',
        'generatedAtTime' : {
          '@id' : 'prov:generatedAtTime',
          '@type' : 'xsd:dateTime'
        },
        'straatnaam' : 'http://www.w3.org/2000/01/rdf-schema#label',
        'isCompleet': {
          '@id': 'https://basisregisters.vlaanderen.be/ns/addressenregister#isCompleet',
          '@type': 'xsd:boolean'
        },
        'isToegekendDoor' : {
          '@id' : 'http://www.w3.org/ns/prov#wasAttributedTo',
          '@type' : '@id'
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
