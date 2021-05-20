const hash = require('object-hash');

export default class StraatnaamUtils {
  public static checkIfVersionCanBeAddedToDatabase(
    geographicalNames: Array<any>,
    status: any,
    nisCode: string
  ): boolean {
    let versionObjectCanBePublished = true;

    if (geographicalNames == undefined) versionObjectCanBePublished = false;
    if (typeof status == "object") versionObjectCanBePublished = false;
    if (nisCode == undefined) versionObjectCanBePublished = false;

    return versionObjectCanBePublished;
  }

  public static mapGeographicalNames(
    geographicalNames: Array<any>
  ): Array<object> {
    let mappedGeographicalNames = [];

    for (let geographicalName of geographicalNames) {
      mappedGeographicalNames.push({
        "@language": geographicalName.Taal[0],
        "@value": geographicalName.Spelling[0],
      });
    }

    return mappedGeographicalNames;
  }

  public static createObjectHash(streetnameObject: any) {
    return hash(streetnameObject);
  }

  public static mapStreetNameStatus(status: string): string {
    switch (status) {
      case "InGebruik":
        return "https://data.vlaanderen.be/id/concept/straatnaamstatus/inGebruik";

      case "Gehistoreerd":
        return "https://data.vlaanderen.be/id/concept/straatnaamstatus/gehistoreerd";

      case "Voorgesteld":
        "https://data.vlaanderen.be/id/concept/straatnaamstatus/voorgesteld";

      default:
        throw new Error(`[StreetNameUtils]: streetname should have a status`);
    }
  }

  public static getStreetNameShape() {
    return [
      {
        "sh:path": "dct:isVersionOf",
        "sh:nodeKind": "sh:IRI",
        "sh:minCount": 1,
        "sh:maxCount": 1,
      },
      {
        "sh:path": "prov:generatedAtTime",
        "sh:datatype": "xsd:dateTime",
        "sh:minCount": 1,
        "sh:maxCount": 1,
      },
      {
        "sh:path": "adms:versionNotes",
        "sh:datatype": "xsd:string",
        "sh:minCount": 1,
        "sh:maxCount": 1,
      },
      {
        "sh:path": "adres:straatnaam",
        "sh:datatype": "rdf:langString",
        "sh:minCount": 1,
      },
      {
        "sh:path": "adres:Straatnaam.status",
        "sh:class": "skos:Concept",
        "sh:minCount": 1,
        "sh:maxCount": 1,
      },
      {
        "sh:path": "prov:wasAttributedTo",
        "sh:nodeKind": "sh:IRI",
        "sh:minCount": 1,
        "sh:maxCount": 1,
      }
    ];
  }

  public static getStreetNameContext() {
    return {
      "@context": [
        "https://raw.githubusercontent.com/Informatievlaanderen/OSLO-Generated/test/doc/applicatieprofiel/adressenregister/ontwerpdocument/niet-bepaald/context/adressenregister.jsonld",
        {
          tree: "https://w3id.org/tree#",
          xsd: "http://www.w3.org/2001/XMLSchema#",
          prov: "http://www.w3.org/ns/prov#",
          dct: "http://purl.org/dc/terms/",
          adms: "http://www.w3.org/ns/adms#",
          rdf : "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
          items: "@included",
          shacl: "@included",
          viewOf: {
            "@reverse": "tree:view",
            "@type": "@id",
          },
          memberOf: {
            "@reverse": "tree:member",
            "@type": "@id",
          },
          generatedAtTime: {
            "@id": "prov:generatedAtTime",
            "@type": "xsd:dateTime",
          },
          eventName: "adms:versionNotes",
          straatnaam : {
            "@id" : "Straatnaam.straatnaam",
            "@type" : "rdf:langString",
            "@container" : "@set"
          },
          status : {
            "@id" : "Straatnaam.status",
            "@type" : "@id"
          },
          isToegekendDoor: {
            "@id": "prov:wasAttributedTo",
            "@type": "@id",
          },
          isVersionOf: {
            "@id": "dct:isVersionOf",
            "@type": "@id",
          },
          shape : {
            "@id" : "tree:shape",
            "@type" : "@id"
          },
          "tree:node": {
            "@type": "@id",
          }
        },
      ],
    };
  }

  public static getStreetNameShaclContext() {
    return {
      "@context": {
        sh: "https://www.w3.org/ns/shacl#",
        rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        xsd: "http://www.w3.org/2001/XMLSchema#",
        tree: "https://w3id.org/tree#",
        skos: "http://www.w3.org/2004/02/skos/core#",
        prov: "http://www.w3.org/ns/prov#",
        dct: "http://purl.org/dc/terms/",
        adms: "http://www.w3.org/ns/adms#",
        adres: "https://data.vlaanderen.be/ns/adres#",
        rdfs: "http://www.w3.org/2000/01/rdf-schema#",
        shapeOf: {
          "@reverse": "tree:shape",
          "@type": "@id",
        },
        NodeShape: "sh:NodeShape",
        "sh:nodeKind": {
          "@type": "@id",
        },
        "sh:path": {
          "@type": "@id",
        },
        "sh:datatype": {
          "@type": "@id",
        },
        "sh:class" : {
          "@type" : "@id"
        }
      },
    };
  }
}