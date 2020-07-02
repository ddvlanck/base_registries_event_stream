import { db } from "../utils/Db";

const BASE_URL = 'http://localhost:8000/address';
const PAGE_SIZE = 25;

export async function getAddress(req, res) {
  const page = parseInt(req.query.page, 10);

  if (!page) {
    res.redirect('?page=1');
  } else {
    const queryResponse = await db.getAddressPaged(req.params.objectId, page, PAGE_SIZE);
    res.json(buildResponse(queryResponse.rows, PAGE_SIZE, page));
  }
}

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
  const context = getContext();
  context["feed_url"] = BASE_URL;
  context['@id'] = `${BASE_URL}?page=${page}`;

  const tree = [];

  addNext(context, tree, items, pageSize, page);
  addPrevious(context, tree, items, page);

  if (tree.length) {
    context["tree:relation"] = tree;
  }

  context["items"] = items.map((item) => createAddressEvent(item));

  return context;
}

function addNext(context, tree, items, pageSize, page) {
  if (items.length !== pageSize) return;

  const nextURL = `${BASE_URL}?page=${(page + 1)}`
  context['next_url'] = nextURL;

  tree.push({
    "@type": "tree:GreaterThanRelation",
    "tree:node": nextURL,
    "tree:path": "prov:generatedAtTime",
    "tree:value": {
      "@value": items[items.length - 1]["Timestamp"],
      "@type": "xsd:dateTime",
    },
  });
}

function addPrevious(context, tree, items, page) {
  if (page <= 1) return;

  const previousURL = `${BASE_URL}?page=${(page - 1)}`;
  context['previous_url'] = previousURL;

  if (items.length) {
    tree.push({
      "@type": "tree:LessThanRelation",
      "tree:node": previousURL,
      "tree:path": "prov:generatedAtTime",
      "tree:value": {
        "@value": items[0]["Timestamp"],
        "@type": "xsd:dateTime",
      },
    });
  }
}

function createAddressEvent(data) {
  const addressEvent = {};

  addressEvent['prov:generatedAtTime'] = data.timestamp;
  addressEvent['memberOf'] = BASE_URL;
  addressEvent['eventName'] = data.event_name
  addressEvent['isVersionOf'] = data.object_uri;
  addressEvent['@type'] = 'Adres';

  if (data.FlatNumber) {
    addressEvent['busnummer'] = data.box_number
  }

  if (data.HouseNumber) {
    addressEvent['huisnummer'] = data.house_number;
  }

  if (data.PostalCode) {
    addressEvent['heeftPostinfo'] = {
      postcode: data.postal_code
    }
  }

  if (data.position_geometry_method) {
    switch (data.position_geometry_method) {
      case 'AfgeleidVanObject':
        addressEvent['methode'] = 'http://inspire.ec.europa.eu/codelist/GeometryMethodValue/fromFeature';
        break;

      case 'AangeduidDoorBeheerder':
        addressEvent['methode'] = 'http://inspire.ec.europa.eu/codelist/GeometryMethodValue/byAdministrator';
        break;
    }
  }

  addressEvent['officieelToegekend'] = data.officially_assigned;
  addressEvent['isCompleet'] = data.complete;
  addressEvent['status'] = data.address_status; //TODO: map to codelist

  //TODO: add position

  return addressEvent;
}

function getContext() {
  return {
    "@context": {
      "prov": "http://www.w3.org/ns/prov#",
      "xsd": "http://www.w3.org/2001/XMLSchema#",
      "generatedAtTime": {
        "@id": "prov:generatedAtTime",
        "@type": "xsd:dateTime"
      },
      "eventName": "http://www.w3.org/ns/adms#versionNotes",
      "Adres": "https://data.vlaanderen.be/ns/adres#Adres",
      "busnummer": "https://data.vlaanderen.be/ns/adres#busnummer",
      "huisnummer": "https://data.vlaanderen.be/ns/adres#huisnummer",
      "heeftPostinfo": "https://data.vlaanderen.be/ns/adres#Postinfo",
      "postcode": "https://data.vlaanderen.be/ns/adres#postcode",
      "officieelToegekend": "https://data.vlaanderen.be/ns/adres#officieelToegekend",
      "status": "https://data.vlaanderen.be/ns/adres#Straatnaam.status",
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
      }
    }
  }
}
