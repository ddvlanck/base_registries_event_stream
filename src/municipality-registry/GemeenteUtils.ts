const hash = require('object-hash');

export const GemeenteUtils = {
  checkIfVersionCanBeAddedToDatabase(
    officialLanguages: any[],
    municipalityNames: any[],
    municipalityStatus: string,
  ): boolean {
    let versionObjectCanBePublished = true;

    if (
      officialLanguages.length === 0 ||
      municipalityNames.length === 0 ||
      !municipalityStatus
    ) {
      versionObjectCanBePublished = false;
    }

    return versionObjectCanBePublished;
  },
  extractLanguages(languageObject: any[]): string[] {
    return languageObject[0].Taal;
  },
  mapGeographicalNames(
    geographicalNames: any[],
  ): object[] {
    const mappedNames = [];

    for (const nameObject of geographicalNames[0].GeografischeNaam) {
      mappedNames.push({
        '@language': nameObject.Taal[0],
        '@value': nameObject.Spelling[0],
      });
    }

    return mappedNames;
  },
  mapStatus(status: string): string {
    switch (status) {
      case 'InGebruik':
        return 'https://data.vlaanderen.be/id/concept/gemeentestatus/inGebruik';

      case 'Gehistoreerd':
        return 'https://data.vlaanderen.be/id/concept/gemeentestatus/gehistoreerd';

      case 'Voorgesteld':
        return 'https://data.vlaanderen.be/id/concept/gemeentestatus/voorgesteld';

      default:
        throw new Error(
          `[MunicipalityUtils]: municipality should have a status`,
        );
    }
  },
  createObjectHash(municipalityObject: any) {
    return hash(municipalityObject);
  },
  getMunicipalityShape() {
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
        'sh:path': 'br:Gemeente.officieleTaal',
        'sh:datatype': 'xsd:string',
        'sh:minCount': 1,
      },
      {
        'sh:path': 'br:Gemeente.faciliteitenTaal',
        'sh:datatype': 'xsd:string',
      },
      {
        'sh:path': 'br:Gemeente.status',
        'sh:class': 'skos:Concept',
        'sh:minCount': 1,
        'sh:maxCount': 1,
      },
    ];
  },
  getMunicipalityContext() {
    return {
      '@context': {
        tree: 'https://w3id.org/tree#',
        ldes: 'https://w3id.org/ldes#',
        br: 'https://basisregisters.vlaanderen.be/ns/adres#',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
        prov: 'http://www.w3.org/ns/prov#',
        skos: 'http://www.w3.org/2004/02/skos/core#',
        dct: 'http://purl.org/dc/terms/',
        adms: 'http://www.w3.org/ns/adms#',
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        "Node": "tree:Node",
        "EventStream": "ldes:EventStream",
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
          '@type': '@id',
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
        Gemeente: 'https://data.vlaanderen.be/ns/generiek#Gemeente',
        gemeentenaam: {
          '@id': 'rdfs:label',
          '@type': 'rdf:langString',
          '@container': '@set',
        },
        officieleTaal: {
          '@id': 'br:Gemeente.officieleTaal',
          '@type': 'xsd:string',
          '@container': '@set',
        },
        faciliteitenTaal: {
          '@id': 'br:Gemeente.faciliteitenTaal',
          '@type': 'xsd:string',
          '@container': '@set',
        },
        status: {
          '@id': 'br:Gemeente.status',
          '@type': '@id',
        },
        isVersionOf: {
          '@id': 'dct:isVersionOf',
          '@type': '@id',
        },
        created: {
          '@id': 'dct:created',
          '@type': 'xsd:dateTime',
        },
      },
    };
  },
  getMunicipalityShaclContext() {
    return {
      '@context': {
        sh: 'https://www.w3.org/ns/shacl#',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
        skos: 'http://www.w3.org/2004/02/skos/core#',
        prov: 'http://www.w3.org/ns/prov#',
        dct: 'http://purl.org/dc/terms/',
        adms: 'http://www.w3.org/ns/adms#',
        br: 'https://basisregisters.vlaanderen.be/ns/adres#',
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        tree: 'https://w3id.org/tree#',
        ldes: 'https://w3id.org/ldes#',
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
