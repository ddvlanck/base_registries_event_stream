import { db } from "../utils/Postgres";

const BASE_URL = 'http://localhost:3000/address';

export async function getAddressPage(req, res) {
  const pageSize = 25;
  const page = parseInt(req.query.page, 10);

  // if (!page) {
  //   res.redirect('?page=1');
  // } else {
  //   const query = `SELECT * from brs."Addresses" ORDER BY "EventID" asc LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;
  //   const queryResponse = await db.query(query);
  //   const items = queryResponse.rows;

  //   const blob = getContext();
  //   blob["feed_url"] = BASE_URL;
  //   blob['@id'] = `${BASE_URL}?page=${page}`;

  //   const tree = [];
  //   if (items.length === pageSize) {
  //     const nextURL = `${BASE_URL}?page=${(page + 1)}`
  //     blob['next_url'] = nextURL;

  //     tree.push({
  //       "@type": "tree:GreaterThanRelation",
  //       "tree:node": nextURL,
  //       "tree:path": "prov:generatedAtTime",
  //       "tree:value": {
  //         "@value": items[items.length - 1]["Timestamp"],
  //         "@type": "xsd:dateTime",
  //       },
  //     });
  //   }

  //   if (page > 1) {
  //     const previousURL = `${BASE_URL}?page=${(page - 1)}`;
  //     blob['previous_url'] = previousURL;

  //     if (items.length) {
  //       tree.push({
  //         "@type": "tree:LessThanRelation",
  //         "tree:node": previousURL,
  //         "tree:path": "prov:generatedAtTime",
  //         "tree:value": {
  //           "@value": items[0]["Timestamp"],
  //           "@type": "xsd:dateTime",
  //         },
  //       });
  //     }
  //   }

  //   if (tree.length) {
  //     blob["tree:relation"] = tree;
  //   }

  //   blob["items"] = items.map((item) => createAddressEvent(item));
  //   res.json(blob);

  // }

}

function createAddressEvent(data) {
  const addressEvent = {};

  addressEvent['prov:generatedAtTime'] = data.Timestamp;
  addressEvent['memberOf'] = BASE_URL;
  addressEvent['eventName'] = data.EventName
  addressEvent['isVersionOf'] = data.AddressURI;
  addressEvent['@type'] = 'Adres';

  if (data.FlatNumber) {
    addressEvent['busnummer'] = data.FlatNumber
  }

  if (data.HouseNumber) {
    addressEvent['huisnummer'] = data.HouseNumber;
  }

  if (data.PostalCode) {
    addressEvent['heeftPostinfo'] = {
      postcode: data.PostalCode
    }
  }

  if (data.PositionGeometryMethod) {
    switch (data.positionGeometryMethod) {
      case 'AfgeleidVanObject':
        addressEvent['methode'] = 'http://inspire.ec.europa.eu/codelist/GeometryMethodValue/fromFeature';
        break;
      case 'AangeduidDoorBeheerder':
        addressEvent['methode'] = 'http://inspire.ec.europa.eu/codelist/GeometryMethodValue/byAdministrator';
        break;
    }
  }

  addressEvent['officieelToegekend'] = data.OfficiallyAssigned;
  addressEvent['isCompleet'] = data.IsComplete;
  addressEvent['status'] = data.AddressStatus; //TODO: map to codelist

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
