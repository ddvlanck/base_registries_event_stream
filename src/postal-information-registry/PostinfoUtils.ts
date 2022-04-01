const hash = require('object-hash');

export const PostinfoUtils = {
  mapPostnamen(xmlPostnamen: any) {
    const postalNames = [];

    for (const postnaam of xmlPostnamen) {
      postalNames.push({
        '@value': postnaam.GeografischeNaam[0].Spelling[0],
        '@language': postnaam.GeografischeNaam[0].Taal[0],
      });
    }

    return postalNames;
  },
  mapStatus(status: string): string {
    switch (status.toLowerCase()) {
      case 'gerealiseerd':
        return 'https://data.vlaanderen.be/id/concept/binairestatus/gerealiseerd';

      case 'gehistoreerd':
        return 'https://data.vlaanderen.be/id/concept/binairestatus/gehistoreerd';

      default:
        throw new Error(
          `[PostInfoEventHandler]: version object must have a status.`,
        );
    }
  },
  createObjectHash(postalInfoObject: any) {
    return hash(postalInfoObject);
  },
  getPostalInfoShape() {
    return [
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
        'sh:maxCount': 1,
      },
      {
        'sh:path': 'http://purl.org/dc/terms/created',
        'sh:datatype': 'xsd:dateTime',
        'sh:minCount': 1,
        'sh:maxCount': 1,
      },
      {
        'sh:path': 'http://www.w3.org/ns/adms#versionNotes',
        'sh:datatype': 'xsd:string',
        'sh:minCount': 1,
        'sh:maxCount': 1,
      },
      {
        'sh:path': 'https://data.vlaanderen.be/ns/adres#postcode',
        'sh:datatype': 'xsd:integer',
        'sh:minCount': 1,
        'sh:maxCount': 1,
      },
      {
        'sh:path': 'https://data.vlaanderen.be/ns/adres#postnaam',
        'sh:datatype': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
      },
      {
        'sh:path': 'https://basisregisters.vlaanderen.be/ns/adres#Postinfo.status',
        'sh:class': 'skos:Concept',
        'sh:minCount': 1,
        'sh:maxCount': 1,
      },
    ];
  },
  getPostalInfoContext() {
    return {
      '@context': {
        tree: 'https://w3id.org/tree#',
        ldes: 'https://w3id.org/ldes#',
        br: 'https://basisregisters.vlaanderen.be/ns/adres#',
        adres: 'https://data.vlaanderen.be/ns/adres#',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
        prov: 'http://www.w3.org/ns/prov#',
        skos: 'http://www.w3.org/2004/02/skos/core#',
        dct: 'http://purl.org/dc/terms/',
        adms: 'http://www.w3.org/ns/adms#',
        Node: "tree:Node",
        EventStream: 'ldes:EventStream',
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
        Postinfo: 'adres:Postinfo',
        postcode: 'adres:postcode',
        postnaam: 'adres:postnaam',
        status: {
          '@id': 'br:Postinfo.status',
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
  getPostalInfoShaclContext() {
    return {
      '@context': {
        sh: 'https://www.w3.org/ns/shacl#',
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
        tree: 'https://w3id.org/tree#',
        ldes: 'https://w3id.org/ldes#',
        skos: 'http://www.w3.org/2004/02/skos/core#',
        EventStream: 'ldes:EventStream',
        shape: 'tree:shape',
        NodeShape: 'sh:NodeShape',
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
