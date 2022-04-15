import { configuration } from '../utils/Configuration';
import { addContentTypeHeader, setCacheControl } from '../utils/Headers';
import { DataCatalogUtils } from './DataCatalogUtils';

const DATA_CATALOG_URL = `${configuration.domainName}`;
const DATA_CATALOG_CONTEXT_URL = `${configuration.domainName}/context`;
const LDES_SPEC = `https://data.vlaanderen.be/doc/applicatieprofiel/ldes/ontwerpstandaard/2022-03-15`;

export async function getDataCatalogPage(req, res): Promise<void> {
  addContentTypeHeader(res);
  setCacheControl(res);
  res.json(buildDataCatalogResponse());
}

export async function getDataCatalogContext(req, res): Promise<void> {
  addContentTypeHeader(res);
  setCacheControl(res);
  res.json(DataCatalogUtils.getDataCatalogContext());
}

function buildDataCatalogResponse(): any {
  const response = {};
  response['@context'] = DATA_CATALOG_CONTEXT_URL;

  response['@type'] = 'Catalogus';
  response['identificator'] = DATA_CATALOG_URL;

  response['titel'] = {
    'nl': `Prototype Linked Data Event Streams Gebouwen- en Adressenregister`
  };
  response['beschrijving'] = {
    'nl': `Catalogus van Linked Data Event Streams van het Gebouwen- en Adressenregister`
  };
  response['licentie'] = 'https://data.vlaanderen.be/id/licentie/creative-commons-zero-verklaring/v1.0';
  response['heeftDataset'] = getDatasets();

  return response;
}

function getDatasets(): any {
  return [
    {
      'identificator': `${configuration.domainName}/gemeente`,
      '@type': 'Dataset',
      'titel': {
        'nl': 'Dataset van gemeentes in Vlaanderen',
        'en': 'Municipalities in Flanders dataset'
      },
      'beschrijving': {
        'nl': 'Dataset die informatie bevat over de gemeentes in Vlaanderen',
        'en': 'Dataset that contains information about the municipalities in Flanders'
      },
      'toegankelijkheid': 'https://op.europa.eu/web/eu-vocabularies/concept/-/resource?uri=http://publications.europa.eu/resource/authority/access-right/PUBLIC',
      'heeftDataservice': [
        {
          'identificator': `${configuration.domainName}/gemeente/time`,
          '@type': 'Dataservice',
          'titel': {
            'nl': 'Linked Data Event Stream van gemeentes volgens een tijdsgebaseerde index',
            'en': 'Time-based fragmentation of the Linked Data Event Stream of municipalities '
          },
          'conformAanProtocol': LDES_SPEC,
          'endpointUrl': `${configuration.domainName}/gemeente/time`
        }
      ]
    },
    {
      '@id': `${configuration.domainName}/straatnamen`,
      '@type': 'Dataset',
      'titel': {
        'nl': 'Dataset van straatnamen in Vlaanderen',
        'en': 'Street names in Flanders dataset'
      },
      'beschrijving': {
        'nl': 'Dataset die informatie bevat over de straatnamen in Vlaanderen',
        'en': 'Dataset that contains information about the street names in Flanders'
      },
      'toegankelijkheid': 'https://op.europa.eu/web/eu-vocabularies/concept/-/resource?uri=http://publications.europa.eu/resource/authority/access-right/PUBLIC',
      'heeftDataservice': [
        {
          'identificator': `${configuration.domainName}/straatnaam/time`,
          '@type': 'Dataservice',
          'titel': {
            'nl': 'Linked Data Event Stream van straatnamen volgens een tijdsgebaseerde index',
            'en': 'Time-based fragmentation of the Linked Data Event Stream of street names '
          },
          'conformAanProtocol': LDES_SPEC,
          'endpointUrl': `${configuration.domainName}/straatnaam/time`
        }
      ]
    },
    {
      '@id': `${configuration.domainName}/postinfo`,
      '@type': 'Dataset',
      'titel': {
        'nl': 'Dataset van postinfo in Vlaanderen',
        'en': 'Postal information of Flanders dataset'
      },
      'beschrijving': {
        'nl': 'Dataset die informatie bevat over de postinfo in Vlaanderen',
        'en': 'Dataset that contains information about the postal information in Flanders'
      },
      'toegankelijkheid': 'https://op.europa.eu/web/eu-vocabularies/concept/-/resource?uri=http://publications.europa.eu/resource/authority/access-right/PUBLIC',
      'heeftDataservice': [
        {
          'identificator': `${configuration.domainName}/postinfo/time`,
          '@type': 'Dataservice',
          'titel': {
            'nl': 'Linked Data Event Stream van postinfo volgens een tijdsgebaseerde index',
            'en': 'Time-based fragmentation of the Linked Data Event Stream of postal information'
          },
          'conformAanProtocol': LDES_SPEC,
          'endpointUrl': `${configuration.domainName}/postinfo/time`
        }
      ]
    },
    {
      '@id': `${configuration.domainName}/adressen`,
      '@type': 'Dataset',
      'titel': {
        'nl': 'Dataset van adressen in Vlaanderen',
        'en': 'Dataset of addresses in Flanders'
      },
      'beschrijving': {
        'nl': 'Dataset die informatie bevat over de adressen in Vlaanderen',
        'en': 'Dataset that contains information about the addresses in Flanders'
      },
      'toegankelijkheid': 'https://op.europa.eu/web/eu-vocabularies/concept/-/resource?uri=http://publications.europa.eu/resource/authority/access-right/PUBLIC',
      'heeftDataservice': [
        {
          'identificator': `${configuration.domainName}/adres/time`,
          '@type': 'Dataservice',
          'titel': {
            'nl': 'Linked Data Event Stream van adressen volgens een tijdsgebaseerde index',
            'en': 'Time-based fragmentation of the Linked Data Event Stream of adressen'
          },
          'conformAanProtocol': LDES_SPEC,
          'endpointUrl': `${configuration.domainName}/adres/time`
        }
      ]
    },
  ];
}
