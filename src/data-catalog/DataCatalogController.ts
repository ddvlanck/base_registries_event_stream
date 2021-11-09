import { configuration } from '../utils/Configuration';
import { addContentTypeHeader, setCacheControl } from '../utils/Headers';
import { DataCatalogUtils } from './DataCatalogUtils';

const DATA_CATALOG_URL = `${configuration.domainName}`;

export async function getDataCatalogPage(req, res): Promise<void> {
  addContentTypeHeader(res);
  setCacheControl(res);
  res.json(buildDataCatalogResponse());
}

function buildDataCatalogResponse(): any {
  const response = DataCatalogUtils.getDataCatalogContext();

  response['@id'] = `${DATA_CATALOG_URL}`;
  response['@type'] = 'Datasetcatalogus';

  response['Datasetcatalogus.titel'] = `Linked Data Event Streams Gebouwen- en Adressenregister`;
  response['Datasetcatalogus.beschrijving'] = `Catalogus van Linked Data Event Streams van het Gebouwen- en Adressenregister`;
  response['Datasetcatalogus.heeftLicentie'] =
    'https://data.vlaanderen.be/id/licentie/creative-commons-zero-verklaring/v1.0';
  response['Datasetcatalogus.heeftUitgever'] = 'https://data.vlaanderen.be/doc/organisatie/OVO002949';
  response['Datasetcatalogus.heeftDataset'] = getDatasets();

  return response;
}

function getDatasets(): any {
  return [
    {
      '@id': `https://api.basisregisters.vlaanderen.be/v1/gemeenten`,
      '@type': 'Dataset',
      'Dataset.titel': 'API Gemeentes',
      'Dataset.beschrijving': 'Het API endpoint voor het opvragen van informatie over gemeenten',
      'Dataset.heeftUitgever': 'https://data.vlaanderen.be/doc/organisatie/OVO002949',
      'Dataset.thema': 'http://publications.europa.eu/resource/authority/data-theme/GOVE',
      'Dataset.heeftDistributie': {
        '@type': 'Distributie',
        titel: {
          nl: 'Linked Data Event Stream van gemeenten',
        },
        'Distributie.heeftLicentie': 'https://data.vlaanderen.be/id/licentie/creative-commons-zero-verklaring/v1.0',
        'Distributie.toegangsUrl': `${configuration.domainName}/gemeente`,
      },
    },
    {
      '@id': `https://api.basisregisters.vlaanderen.be/v1/straatnamen`,
      '@type': 'Dataset',
      'Dataset.titel': 'API Straatnamen',
      'Dataset.beschrijving': 'Het API endpoint voor het opvragen van informatie over straatnamen',
      'Dataset.heeftUitgever': 'https://data.vlaanderen.be/doc/organisatie/OVO002949',
      'Dataset.thema': 'http://publications.europa.eu/resource/authority/data-theme/GOVE',
      'Dataset.heeftDistributie': {
        '@type': 'Distributie',
        titel: {
          nl: 'Linked Data Event Stream van straatnamen',
        },
        'Distributie.heeftLicentie': 'https://data.vlaanderen.be/id/licentie/creative-commons-zero-verklaring/v1.0',
        'Distributie.toegangsUrl': `${configuration.domainName}/straatnaam`,
      },
    },
    {
      '@id': `https://api.basisregisters.vlaanderen.be/v1/postinfo`,
      '@type': 'Dataset',
      'Dataset.titel': 'API Postinformatie',
      'Dataset.beschrijving': 'Het API endpoint voor het opvragen van informatie over postcodes',
      'Dataset.heeftUitgever': 'https://data.vlaanderen.be/doc/organisatie/OVO002949',
      'Dataset.thema': 'http://publications.europa.eu/resource/authority/data-theme/GOVE',
      'Dataset.heeftDistributie': {
        '@type': 'Distributie',
        titel: {
          nl: 'Linked Data Event Stream van postinformatie',
        },
        'Distributie.heeftLicentie': 'https://data.vlaanderen.be/id/licentie/creative-commons-zero-verklaring/v1.0',
        'Distributie.toegangsUrl': `${configuration.domainName}/postinfo`,
      },
    },
    {
      '@id': `https://api.basisregisters.vlaanderen.be/v1/adressen`,
      '@type': 'Dataset',
      'Dataset.titel': 'API Adressen',
      'Dataset.beschrijving': 'Het API endpoint voor het opvragen van informatie over adressen',
      'Dataset.heeftUitgever': 'https://data.vlaanderen.be/doc/organisatie/OVO002949',
      'Dataset.thema': 'http://publications.europa.eu/resource/authority/data-theme/GOVE',
      'Dataset.heeftDistributie': {
        '@type': 'Distributie',
        titel: {
          nl: 'Linked Data Event Stream van adressen',
        },
        'Distributie.heeftLicentie': 'https://data.vlaanderen.be/id/licentie/creative-commons-zero-verklaring/v1.0',
        'Distributie.toegangsUrl': `${configuration.domainName}/adres`,
      },
    },
  ];
}
