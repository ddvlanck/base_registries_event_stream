import {db} from "../utils/Db";
import {configuration} from '../utils/Configuration';
import {addNext, addPrevious} from "../utils/HypermediaControls";

const BASE_URL = `${configuration.domainName}/address`;
const PAGE_SIZE = 25;

// Get all events for a specific address (based on object_id)
export async function getAddress(req, res) {
  const page = parseInt(req.query.page, 10);

  if (!page) {
    res.redirect('?page=1');
  } else {
    const queryResponse = await db.getAddressPaged(req.params.objectId, page, PAGE_SIZE);
    res.json(buildResponse(queryResponse.rows, PAGE_SIZE, page));
  }
}

// Get all events for all addresses
export async function getAddressPage(req, res) {
  const page = parseInt(req.query.page, 10);

  if (!page) {
    res.redirect('?page=1');
  } else {
    const queryResponse = await db.getAddressesPaged(page, PAGE_SIZE);
    res.json(buildResponse(queryResponse.rows, PAGE_SIZE, page));
  }
}

function buildResponse(items, pageSize, page) {
  const response = getContext();
  response["feed_url"] = BASE_URL;
  response['@id'] = `${BASE_URL}?page=${page}`;

  const tree = [];

  addNext(response, tree, items, pageSize, page, BASE_URL);
  addPrevious(response, tree, items, page, BASE_URL);

  if (tree.length) {
    response["tree:relation"] = tree;
  }

  response["items"] = items.map((item) => createAddressEvent(item));
  response["items"].unshift(getShape(`${BASE_URL}?page=${page}`));

  return response;
}

function createAddressEvent(data) {
  const addressEvent = {};

  addressEvent['isVersionOf'] = data.object_uri;
  addressEvent['generatedAtTime'] = data.timestamp;
  addressEvent['eventName'] = data.event_name;
  addressEvent['memberOf'] = BASE_URL;
  addressEvent['@type'] = 'Adres';

  if (data.box_number) {
    addressEvent['Adres.busnummer'] = data.box_number
  }

  if (data.house_number) {
    addressEvent['Adres.huisnummer'] = data.house_number;
  }

  if (data.postal_code) {
    addressEvent['heeftPostinfo'] = {
      'Postinfo.postcode': data.postal_code
    }
  }

  addressEvent['positie'] = {
    "@type": "GeografischePositie",
    "geometrie": {
      "@type": "Punt",
      "gml" : {
        "@type" : "http://www.opengis.net/ont/geosparql#gmlLiteral",
        "@value" : data.address_position
      }
    }
  }

  if (data.position_geometry_method) {
    switch (data.position_geometry_method) {
      case 'AfgeleidVanObject':
        addressEvent['positie']['methode'] = 'http://inspire.ec.europa.eu/codelist/GeometryMethodValue/fromFeature';
        break;

      case 'AangeduidDoorBeheerder':
        addressEvent['positie']['methode'] = 'http://inspire.ec.europa.eu/codelist/GeometryMethodValue/byAdministrator';
        break;
      case 'Geïnterpoleerd':
        addressEvent['positie']['methode'] = "";
        break;
    }
  }

  if (data.position_specification) {
    switch (data.position_specification) {
      case 'Ingang':
        addressEvent['positie']['specificatie'] = "http://inspire.ec.europa.eu/codelist/GeometrySpecificationValue/entrance";
        break;
      case 'Gebouweenheid':
        addressEvent['positie']['specificatie'] = "http://inspire.ec.europa.eu/codelist/GeometrySpecificationValue/building";
        break;
      case 'Perceel':
        addressEvent['positie']['specificatie'] = "http://inspire.ec.europa.eu/codelist/GeometrySpecificationValue/parcel";
        break;
      case 'Wegsegment':
        addressEvent['positie']['specificatie'] = "https://inspire.ec.europa.eu/codelist/GeometrySpecificationValue/segment";
        break;
    }
  }

  addressEvent['officieelToegekend'] = data.officially_assigned;
  addressEvent['isCompleet'] = data.complete;

  switch (data.address_status) {
    case 'Gehistoreed':
      addressEvent['Adres.status'] = 'http://inspire.ec.europa.eu/codelist/StatusValue/retired';
      break;
    case 'InGebruik':
      addressEvent['Adres.status'] = 'https://inspire.ec.europa.eu/codelist/StatusValue/current'
  }

  return addressEvent;
}

function getShape(pageId: string) {
  return {
    "@id": pageId,
    "tree:shape": {
      "sh:property": [
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
          "sh:path": "https://data.vlaanderen.be/ns/adres#huisnummer",
          "sh:datetype": "xsd:string",
          "sh:maxCount": 1
        },
        {
          "sh:path": "https://data.vlaanderen.be/ns/adres#huisnummer",
          "sh:datatype": "xsd:string",
          "sh:maxCount": 1
        },
        {
          "sh:path": "https://data.vlaanderen.be/ns/adres#heeftPostinfo",
          "sh:node": {
            "sh:property": {
              "sh:path": "https://data.vlaanderen.be/ns/adres#postcode",
              "sh:datatype": "xsd:string",
              "sh:minCount": 1,
              "sh:maxCount": 1
            }
          },
          "sh:minCount": 1,
          "sh:maxCount": 1
        },
        {
          "sh:path" : "https://data.vlaanderen.be/ns/adres#positie",
          "sh:node": {
            "sh:property" : [
              {
                "sh:path" : "http://www.w3.org/ns/locn#Geometry",
                "sh:node" : {
                  "sh:property" : {
                    "sh:path" : "http://www.opengis.net/ont/geosparql#asGML",
                    "sh:datatype" : "xsd:string",
                    "sh:minCount" : 1,
                    "sh:maxCount" : 1
                  }
                }
              },
              {
                "sh:path" : "https://data.vlaanderen.be/ns/generiek#methode",
                "sh:nodeKind" : "sh:IRI",
                "sh:minCount" : 1,
                "sh:maxCount" : 1
              },
              {
                "sh:path" : "https://data.vlaanderen.be/ns/generiek#specificatie",
                "sh:nodeKind" : "sh:IRI",
                "sh:minCount" : 1,
                "sh:maxCount" : 1
              }
            ]
          }
        },
        {
          "sh:path": "https://data.vlaanderen.be/ns/adres#officieelToegekend",
          "sh:datatype": "xsd:boolean",
          "sh:minCount": 1,
          "sh:maxCount": 1
        },
        {
          "sh:path": "https://basisregisters.vlaanderen.be/ns/addressenregister#isCompleet",
          "sh:datatype": "xsd:boolean",
          "sh:minCount": 1,
          "sh:maxCount": 1
        },
        {
          "sh:path": "https://data.vlaanderen.be/ns/adres#Adres.status",
          "sh:datatype": "xsd:string",
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
        "Punt": "http://www.opengis.net/ont/sf#Point",
        "GeografischePositie" : "https://data.vlaanderen.be/ns/generiek#GeografischePositie",
        "gml" : "https://data.vlaanderen.be/doc/applicatieprofiel/generiek-basis/#Geometrie%3Agml",
        "eventName": "http://www.w3.org/ns/adms#versionNotes",
        "methode": {
          "@id": "https://data.vlaanderen.be/ns/generiek#methode",
          "@type": "@id"
        },
        "specificatie": {
          "@id": "https://data.vlaanderen.be/ns/generiek#specificatie",
          "@type": "@id"
        },
        "isCompleet": {
          "@id": "https://basisregisters.vlaanderen.be/ns/addressenregister#isCompleet",
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
