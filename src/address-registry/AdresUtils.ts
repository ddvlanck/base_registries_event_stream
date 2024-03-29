const hash = require('object-hash');

export const AdresUtils = {
  checkIfVersionCanBePublished(
    straatnaamId: string,
    postalCode: string,
    houseNumber: string,
    officiallyAssigned: boolean,
    geometry: string,
    geometryMethod: string,
    geometrySpecification: string,
    addressStatus: string,
    objectId: string,
  ) {
    let versionCanBePublished = true;

    if (straatnaamId === null ||
      postalCode === null ||
      houseNumber === null ||
      !officiallyAssigned ||
      geometry === null ||
      geometryMethod === null ||
      geometrySpecification === null ||
      addressStatus === null ||
      typeof objectId === 'object') {
      versionCanBePublished = false;
    }

    return versionCanBePublished;
  },
  createObjectHash(addressObject: any) {
    return hash(addressObject);
  },
  mapAddressStatus(status: string) {
    switch (status) {
      case 'InGebruik':
        return 'https://data.vlaanderen.be/id/concept/adresstatus/inGebruik';

      case 'Gehistoreerd':
        return 'https://data.vlaanderen.be/id/concept/adresstatus/gehistoreerd';

      case 'Voorgesteld':
        return 'https://data.vlaanderen.be/id/concept/adresstatus/voorgesteld';

      default:
        throw new Error(`[AdresUtils]: address should have a status.`);
    }
  },
  mapGeometryPositionMethod(method: string) {
    switch (method) {
      case 'Geïnterpoleerd':
        return 'https://data.vlaanderen.be/id/conceptscheme/geometriemethode/geinterpoleerd';

      case 'AangeduidDoorBeheerder':
        return 'https://data.vlaanderen.be/id/conceptscheme/geometriemethode/aangeduidDoorBeheerder';

      case 'AfgeleidVanObject':
        return 'https://data.vlaanderen.be/id/conceptscheme/geometriemethode/afgeleidVanObject';

      default:
        throw new Error(`[AdresUtils]: address should have a geometry position method.`);
    }
  },
  mapGeometrySpecification(specification: string) {
    switch (specification) {
      case 'Ligplaats':
        return 'https://data.vlaanderen.be/id/conceptscheme/geometriespecificatie/ligplaats';

      case 'Gebouweenheid':
        return 'https://data.vlaanderen.be/id/conceptscheme/geometriespecificatie/gebouweenheid';

      case 'Ingang':
        return 'https://data.vlaanderen.be/id/conceptscheme/geometriespecificatie/ingang';

      case 'Lot':
        return 'https://data.vlaanderen.be/id/conceptscheme/geometriespecificatie/lot';

      case 'Gemeente':
        return 'https://data.vlaanderen.be/id/conceptscheme/geometriespecificatie/gemeente';

      case 'Perceel':
        return 'https://data.vlaanderen.be/id/conceptscheme/geometriespecificatie/perceel';

      case 'Wegsegment':
        return 'https://data.vlaanderen.be/id/conceptscheme/geometriespecificatie/wegsegment';

      case 'Standplaats':
        return 'https://data.vlaanderen.be/id/conceptscheme/geometriespecificatie/standplaats';

      default:
        throw new Error(`[AdresUtils]: address should have a geometry specification.`);
    }
  },
  getAddressShaclContext() {
    return {
      '@context': {
        tree: 'https://w3id.org/tree#',
        ldes: 'https://w3id.org/ldes#',
        adres: 'https://data.vlaanderen.be/ns/adres#',
        sh: 'https://www.w3.org/ns/shacl#',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
        skos: 'http://www.w3.org/2004/02/skos/core#',
        prov: 'http://www.w3.org/ns/prov#',
        dct: 'http://purl.org/dc/terms/',
        adms: 'http://www.w3.org/ns/adms#',
        generiek: 'https://data.vlaanderen.be/ns/generiek#',
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        EventStream: 'ldes:EventStream',
        NodeShape: 'sh:NodeShape',
        shape: 'tree:shape',
        'sh:nodeKind': {
          '@type': '@id',
        },
        'sh:path': {
          '@type': '@id',
        },
        'sh:datatype': {
          '@type': '@id',
        },
        'sh:class': {
          '@type': '@id',
        },
      },
    };
  },
  getAddressContext() {
    return {
      '@context': [
        // eslint-disable-next-line max-len
        'https://data.vlaanderen.be/doc/applicatieprofiel/generiek-basis/zonderstatus/2019-07-01/context/generiek-basis.jsonld',
        {
          ldes: 'https://w3id.org/ldes#',
          tree: 'https://w3id.org/tree#',
          adres: 'https://data.vlaanderen.be/ns/adres#',
          xsd: 'http://www.w3.org/2001/XMLSchema#',
          prov: 'http://www.w3.org/ns/prov#',
          dct: 'http://purl.org/dc/terms/',
          adms: 'http://www.w3.org/ns/adms#',
          rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
          Node: 'tree:Node',
          EventStream: 'ldes:EventStream',
          eventName: 'http://www.w3.org/ns/adms#versionNotes',
          view: 'tree:view',
          member: 'tree:member',
          relation: 'tree:relation',
          timestampPath: {
            '@id': 'ldes:timestampPath',
            '@type': '@id',
          },
          versionOfPath: {
            '@id': 'ldes:versionOfPath',
            '@type': '@id',
          },
          shape: {
            '@id': 'tree:shape',
            '@type': '@id'
          },
          "tree:node": {
            "@type": "@id"
          },
          "tree:path": {
            "@type": "@id"
          },
          "tree:value": {
            "@type": "xsd:dateTime"
          },
          generatedAtTime: {
            '@id': 'prov:generatedAtTime',
            '@type': 'xsd:dateTime',
          },
          isVersionOf: {
            '@id': 'dct:isVersionOf',
            '@type': '@id',
          },
          BelgischAdres: 'adres:Adres',
          Gemeentenaam: 'adres:Gemeentenaam',
          Postinfo: 'adres:Postinfo',
          busnummer: {
            '@id': 'adres:busnummer',
            '@type': 'xsd:string',
          },
          huisnummer: {
            '@id': 'adres:huisnummer',
            '@type': 'xsd:string',
          },
          heeftStraatnaam: {
            '@id': 'adres:heeftStraatnaam',
            '@type': '@id',
          },
          heeftGemeentenaam: {
            '@id': 'adres:heeftGemeentenaam',
            '@type': 'adres:Gemeentenaam',
          },
          heeftPostinfo: {
            '@id': 'adres:heeftPostinfo',
            '@type': 'adres:Postinfo',
          },
          isToegekendDoor: {
            '@id': 'http://www.w3.org/ns/prov#wasAttributedTo',
            '@type': '@id',
          },
          positie: {
            '@id': 'adres:positie',
            '@type': 'https://data.vlaanderen.be/ns/generiek#GeografischePositie',
          },
          GeografischePositie: 'https://data.vlaanderen.be/ns/generiek#GeografischePositie',
          officieelToegekend: {
            '@id': 'adres:officieelToegekend',
            '@type': 'xsd:boolean',
          },
          status: {
            '@id': 'adres:Adres.status',
            '@type': '@id',
          },
          gemeentenaam: {
            '@id': 'http://www.w3.org/2000/01/rdf-schema#label',
            '@type': 'rdf:langString',
            '@container': '@set',
          },
          isAfgeleidVan: {
            '@id': 'adres:isAfgeleidVan',
            '@type': '@id',
          },
          postcode: {
            '@id': 'adres:postcode',
            '@type': 'xsd:string',
          },
          default: {
            '@id': 'https://data.vlaanderen.be/ns/generiek#default',
            '@type': 'xsd:boolean',
          },
          Punt: 'http://www.opengis.net/ont/sf#Point',
          geometrie: {
            '@id': 'http://www.w3.org/ns/locn#geometry',
            '@type': 'http://www.opengis.net/ont/sf#Point',
          },

          gml: {
            '@id': 'http://www.opengis.net/ont/geosparql#asGML',
            '@type': 'http://www.opengis.net/ont/geosparql#gmlLiteral',
          },
          methode: {
            '@id': 'https://data.vlaanderen.be/ns/generiek#methode',
            '@type': '@id',
          },
          specificatie: {
            '@id': 'https://data.vlaanderen.be/ns/generiek#specificatie',
            '@type': '@id',
          },
          created: {
            '@id': 'dct:created',
            '@type': 'xsd:dateTime',
          },
        },
      ],
    };
  },
  getAddressShape() {
    return [
      {
        'sh:path': 'dct:isVersionOf',
        'sh:nodeKind': 'sh:IRI',
        'sh:minCount': 1,
        'sh:maxCount': 1,
      },
      {
        'sh:path': 'prov:generatedAtTime',
        'sh:datatype': 'xsd:dateTime',
        'sh:minCount': 1,
        'sh:maxCount': 1,
      },
      {
        'sh:path': 'dct:created',
        'sh:datatype': 'xsd:dateTime',
        'sh:minCount': 1,
        'sh:maxCount': 1,
      },
      {
        'sh:path': 'adms:versionNotes',
        'sh:datatype': 'xsd:string',
        'sh:minCount': 1,
        'sh:maxCount': 1,
      },
      {
        'sh:path': 'adres:heeftStraatnaam',
        'sh:nodeKind': 'sh:IRI',
        'sh:minCount': 1,
        'sh:maxCount': 1,
      },
      {
        'sh:path': 'adres:heeftGemeentenaam',
        'sh:node': {
          'sh:property': [
            {
              'sh:path': 'rdfs:label',
              'sh:datatype': 'rdf:langString',
              'sh:minCount': 1,
            },
            {
              'sh:path': 'adres:isAfgeleidVan',
              'sh:nodeKind': 'sh:IRI',
              'sh:minCount': 1,
              'sh:maxCount': 1,
            },
          ],
        },
      },
      {
        'sh:path': 'adres:heeftPostinfo',
        'sh:node': {
          'sh:property': {
            'sh:path': 'adres:postcode',
            'sh:datatype': 'xsd:string',
            'sh:minCount': 1,
            'sh:maxCount': 1,
          },
        },
      },
      {
        'sh:path': 'adres:huisnummer',
        'sh:datatype': 'xsd:string',
        'sh:minCount': 1,
        'sh:maxCount': 1,
      },
      {
        'sh:path': 'adres:busnummer',
        'sh:datatype': 'xsd:string',
        'sh:maxCount': 1,
      },
      {
        'sh:path': 'adres:positie',
        'sh:node': {
          'sh:property': [
            {
              'sh:path': 'generiek:default',
              'sh:datatype': 'xsd:boolean',
              'sh:minCount': 1,
              'sh:maxCount': 1,
            },
            {
              'sh:path': 'http://www.w3.org/ns/locn#geometry',
              'sh:node': {
                'sh:property': {
                  'sh:path': 'http://www.opengis.net/ont/geosparql#asGML',
                  'sh:datatype': 'http://www.opengis.net/ont/geosparql#gmlLiteral',
                  'sh:minCount': 1,
                  'sh:maxCount': 1,
                },
              },
              'sh:minCount': 1,
              'sh:maxCount': 1,
            },
            {
              'sh:path': 'generiek:methode',
              'sh:class': 'skos:Concept',
              'sh:minCount': 1,
              'sh:maxCount': 1,
            },
            {
              'sh:path': 'generiek:specificatie',
              'sh:class': 'skos:Concept',
              'sh:minCount': 1,
              'sh:maxCount': 1,
            },
          ],
        },
      },
      {
        'sh:path': 'adres:Adres.status',
        'sh:class': 'skos:Concept',
        'sh:minCount': 1,
        'sh:maxCount': 1,
      },
      {
        'sh:path': 'adres:officieelToegekend',
        'sh:datatype': 'xsd:boolean',
        'sh:minCount': 1,
        'sh:maxCount': 1,
      },
    ];
  },
};
