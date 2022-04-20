export const DataCatalogUtils = {
  getDataCatalogContext() {
    return {
      '@context': [
        'https://data.vlaanderen.be/doc/applicatieprofiel/metadata-dcat/erkendestandaard/2021-04-22/context/metadata-voor-services-ap.jsonld',
        {
          rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
          skos: 'http://www.w3.org/2004/02/skos/core#',
          beschrijving: {
            '@id': 'Catalogus.beschrijving',
            '@type': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
            '@container': ['@set', '@language'],
          },
          titel: {
            '@id': 'Catalogus.titel',
            '@type': 'rdf:langString',
            '@container': ['@set', '@language'],
          },
          identificator: '@id',
          licentie: {
            '@id': 'Catalogus.licentie',
            '@type': '@id',
          },
          heeftDataset: {
            '@id': 'Catalogus.heeftDataset',
            '@container': '@set',
            '@context': {
              beschrijving: {
                '@id': 'Dataset.beschrijving',
                '@type': 'rdf:langString',
                '@container': ['@set', '@language'],
              },
              identificator: '@id',
              titel: {
                '@id': 'Dataset.titel',
                '@type': 'rdf:langString',
                '@container': ['@set', '@language'],
              },
              uitgever: {
                '@id': 'CatalogusResource.uitgever',
                '@type': '@id',
              },
              contactinformatie: {
                '@id': 'Dataset.contactinformatie',
                '@type': 'Contactinfo',
              },
              email: {
                '@id': 'Contactinfo.eMail',
                '@type': 'http://www.w3.org/2001/XMLSchema#anyURI',
              },
              toegankelijkheid: {
                '@id': 'Dataset.toegankelijkheid',
                '@type': '@id',
              },
            },
          },
          heeftDataservice: {
            '@reverse': 'Dataservice.biedtInformatieAanOver',
            '@container': '@set',
            '@context': {
              identificator: '@id',
              titel: {
                '@id': 'Dataservice.titel',
                '@type': 'rdf:langString',
                '@container': ['@set', '@language'],
              },
              conformAanProtocol: {
                '@id': 'Dataservice.conformAanProtocol',
                '@type': '@id',
              },
              endpointUrl: {
                '@id': 'Dataservice.endpointUrl',
                '@type': '@id',
              },
            },
          },
        },
      ],
    };
  },
};
