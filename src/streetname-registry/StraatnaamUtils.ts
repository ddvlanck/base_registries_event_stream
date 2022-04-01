const hash = require('object-hash');

export const StraatnaamUtils = {
  checkIfVersionCanBeAddedToDatabase(
    geographicalNames: any[],
    status: any,
    nisCode: string,
  ): boolean {
    let versionObjectCanBePublished = true;

    if (geographicalNames === undefined) {
      versionObjectCanBePublished = false;
    }
    if (typeof status === 'object') {
      versionObjectCanBePublished = false;
    }
    if (nisCode === undefined) {
      versionObjectCanBePublished = false;
    }

    return versionObjectCanBePublished;
  },
  mapGeographicalNames(
    geographicalNames: any[],
  ): object[] {
    const mappedGeographicalNames = [];

    for (const geographicalName of geographicalNames) {
      let name: string = geographicalName.Spelling[0];

      if (name.includes('"')) {
        name = name.replace(/"/gu, '');
      }

      mappedGeographicalNames.push({
        '@language': geographicalName.Taal[0],
        '@value': name,
      });
    }

    return mappedGeographicalNames;
  },
  createObjectHash(streetnameObject: any) {
    return hash(streetnameObject);
  },
  mapStreetNameStatus(status: string): string {
    switch (status) {
      case 'InGebruik':
        return 'https://data.vlaanderen.be/id/concept/straatnaamstatus/inGebruik';

      case 'Gehistoreerd':
        return 'https://data.vlaanderen.be/id/concept/straatnaamstatus/gehistoreerd';

      case 'Voorgesteld':
        return 'https://data.vlaanderen.be/id/concept/straatnaamstatus/voorgesteld';

      default:
        throw new Error(`[StreetNameUtils]: streetname should have a status`);
    }
  },
  getStreetNameShape() {
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
        'sh:path': 'rdfs:label',
        'sh:datatype': 'rdf:langString',
        'sh:minCount': 1,
      },
      {
        'sh:path': 'adres:Straatnaam.status',
        'sh:class': 'skos:Concept',
        'sh:minCount': 1,
        'sh:maxCount': 1,
      },
      {
        'sh:path': 'prov:wasAttributedTo',
        'sh:nodeKind': 'sh:IRI',
        'sh:minCount': 1,
        'sh:maxCount': 1,
      },
      {
        'sh:path': 'adres:homoniemToevoeging',
        'sh:datatype': 'xsd:string',
        'sh:maxCount': 1,
      },
    ];
  },
  getStreetNameContext() {
    return {
      '@context': [
        {
          ldes: 'https://w3id.org/ldes#',
          tree: 'https://w3id.org/tree#',
          adres: 'https://data.vlaanderen.be/ns/adres#',
          xsd: 'http://www.w3.org/2001/XMLSchema#',
          prov: 'http://www.w3.org/ns/prov#',
          dct: 'http://purl.org/dc/terms/',
          adms: 'http://www.w3.org/ns/adms#',
          rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
          rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
          EventStream: 'ldes:EventStream',
          Node: 'tree:Node',
          eventName: 'adms:versionNotes',
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
          Straatnaam: 'adres:Straatnaam',
          straatnaam: {
            '@id': 'rdfs:label',
            '@type': 'rdf:langString',
            '@container': '@set',
          },
          status: {
            '@id': 'adres:Straatnaam.status',
            '@type': '@id',
          },
          isToegekendDoor: {
            '@id': 'prov:wasAttributedTo',
            '@type': '@id',
          },
          homoniemToevoeging: {
            '@id': 'adres:Straatnaam.homoniemToevoeging',
            '@type': 'xsd:string',
          },
          created: {
            '@id': 'dct:created',
            '@type': 'xsd:dateTime',
          },
        },
      ],
    };
  },
  getStreetNameShaclContext() {
    return {
      '@context': {
        sh: 'https://www.w3.org/ns/shacl#',
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
        tree: 'https://w3id.org/tree#',
        ldes: 'https://w3id.org/ldes#',
        skos: 'http://www.w3.org/2004/02/skos/core#',
        prov: 'http://www.w3.org/ns/prov#',
        dct: 'http://purl.org/dc/terms/',
        adms: 'http://www.w3.org/ns/adms#',
        adres: 'https://data.vlaanderen.be/ns/adres#',
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
};
