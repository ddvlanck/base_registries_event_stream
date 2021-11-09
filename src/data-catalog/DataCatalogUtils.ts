export const DataCatalogUtils = {
  getDataCatalogContext() {
    return {
      '@context': [
        'https://data.vlaanderen.be/doc/applicatieprofiel/DCAT-AP-VL/standaard/2019-06-13/context/DCAT-AP-VL.jsonld',
        {
          rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
          titel: {
            '@id': 'Distributie.titel',
            '@type': 'rdf:langString',
            '@container': ['@set', '@language'],
          },
        },
      ],
    };
  },
};
