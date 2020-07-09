import {configuration} from "../utils/Configuration";
import {db} from "../utils/Db";
import {addNext, addPrevious} from "../utils/HypermediaControls";

const BASE_URL = `${configuration.domainName}/streetname`;
const PAGE_SIZE = 250;

// Get all events for all street names
export async function getStreetNamePage(req, res) {
  const page = parseInt(req.query.page, 10);

  if (!page) {
    res.redirect('?page=1');
  } else {
    const queryResponse = await db.getStreetNamesPaged(page, PAGE_SIZE);
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

  response["items"] = items.map((item) => createStreetNameEvent(item));
  response["items"].unshift(getShape(`${BASE_URL}?page=${page}`));

  return response;
}

function createStreetNameEvent(data){
  const streetNameEvent = {};

  streetNameEvent['isVersionOf'] = data.object_uri;
  streetNameEvent['generatedAtTime'] = data.timestamp;
  streetNameEvent['eventName'] = data.event_name;
  streetNameEvent['memberOf'] = BASE_URL;
  streetNameEvent['@type'] = 'Straatnaam';

  streetNameEvent['straatnaam'] = {
    '@language' : data.geographical_name_language,
    '@value' : data.geographical_name
  }

  streetNameEvent['isToegekendDoor'] = 'https://data.vlaanderen.be/id/gemeente/' + data.nis_code;
  switch (data.street_name_status) {
    case 'Voorgesteld':
      streetNameEvent['Straatnaam.status'] = 'http://inspire.ec.europa.eu/codelist/StatusValue/proposed';
      break;
    case 'InGebruik':
      streetNameEvent['Straatnaam.status'] = 'http://inspire.ec.europa.eu/codelist/StatusValue/current';
      break;
    case 'Gehistoreed':
      streetNameEvent['Straatnaam.status'] = 'http://inspire.ec.europa.eu/codelist/StatusValue/retired';
      break;
  }
  streetNameEvent['isCompleet'] = data.complete;
  return streetNameEvent;
}

function getShape(pageId: string){
  return {
    "@id": pageId,
    "tree:shape" : {
      "sh:property" : [
        {
          "sh:path": "http://purl.org/dc/terms/isVersionOf",
          "sh:nodeKind": "sh:IRI",
          "sh:minCount": 1,
          "sh:maxCount": 1,
        },
        {
          "sh:path": "http://www.w3.org/ns/prov#generatedAtTime",
          "sh:datatype": "xsd:dateTime",
          "sh:minCount": 1,
          "sh:maxCount": 1
        },
        {
          "sh:path": "http://www.w3.org/ns/adms#versionNotes",
          "sh:datatype": "xsd:string",
          "sh:minCount": 1,
          "sh:maxCount": 1
        },
        {
          "sh:path" : "http://www.w3.org/2000/01/rdf-schema#label",
          "sh:datatype" : "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
          "sh:minCount" : 1,
          "sh:maxCount" : 1
        },
        {
          "sh:path" : "https://data.vlaanderen.be/ns/adres#Straatnaam.status",
          "sh:datatype": "http://www.w3.org/2004/02/skos/core#Concept",
          "sh:minCount": 1,
          "sh:maxCount": 1
        },
        {
          "sh:path" : "http://www.w3.org/ns/prov#wasAttributedTo",
          "sh:nodeKind" : "sh:IRI",
          "sh:minCount": 1,
          "sh:maxCount": 1
        },
        {
          "sh:path": "https://basisregisters.vlaanderen.be/ns/addressenregister#isCompleet",
          "sh:datatype": "xsd:boolean",
          "sh:minCount": 1,
          "sh:maxCount": 1
        }
      ]
    }
  }
}

function getContext() {
  return {
    "@context": [
      "https://data.vlaanderen.be/context/adresregister.jsonld",
      {
        "xsd": "http://www.w3.org/2001/XMLSchema#",
        "prov" : "http://www.w3.org/ns/prov#",
        "eventName": "http://www.w3.org/ns/adms#versionNotes",
        "generatedAtTime" : "prov:generatedAtTime",
        "straatnaam" : "http://www.w3.org/2000/01/rdf-schema#label",
        "isCompleet": {
          "@id": "https://basisregisters.vlaanderen.be/ns/addressenregister#isCompleet",
          "@type": "xsd:boolean"
        },
        "isToegekendDoor" : {
          "@id" : "http://www.w3.org/ns/prov#wasAttributedTo",
          "@type" : "@id"
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
