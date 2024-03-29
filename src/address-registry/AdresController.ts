import type { Request, Response } from 'express';
import { configuration } from '../utils/Configuration';
import { db, DbTable } from '../utils/DatabaseQueries';
import { addContentTypeHeader, setCacheControl, addResponseHeaders } from '../utils/Headers';
import { buildFragment, buildVersionObjectSubjectPage, handleRequestAndGetFragmentMetadata } from '../utils/Utils';
import { AdresUtils } from './AdresUtils';

const ADDRESS_LDES_URL = `${configuration.domainName}/adres`;
const ADDRESS_PAGE_BASE_URL = `${configuration.domainName}/adres/time`;
const ADDRESS_SHACL_BASE_URL = `${configuration.domainName}/adres/shape`;
const ADDRESS_CONTEXT_URL = `${configuration.domainName}/adres/context`;
const ADDRESS_ID = `${configuration.domainName}/id/adres`;

export async function getAddressFragment(req: Request, res: Response): Promise<void> {
  const fragmentMetadata = await handleRequestAndGetFragmentMetadata(req, res, DbTable.Address);

  // Redirects will have no metadata, so will not pass this check
  if (fragmentMetadata) {
    const items = (await db.getAddressItems(fragmentMetadata.index, configuration.pageSize)).rows;
    const path = `${configuration.domainName}${req.path}`;
    addResponseHeaders(res, fragmentMetadata);

    res.json(buildFragment(
      items,
      fragmentMetadata,
      ADDRESS_LDES_URL,
      path,
      ADDRESS_CONTEXT_URL,
      ADDRESS_SHACL_BASE_URL,
      createAddressEvent,
    ));
  }
}

// Get SHACL shape for address objects
export async function getAddressShape(req: Request, res: Response): Promise<void> {
  addContentTypeHeader(res);
  setCacheControl(res);
  res.json(buildAddressShaclResponse());
}

export async function getAddressContext(req: Request, res: Response): Promise<void> {
  addContentTypeHeader(res);
  setCacheControl(res);
  res.json(AdresUtils.getAddressContext());
}

export async function getAddressVersionObject(req: Request, res: Response): Promise<void> {
  const addressId = req.params.addressId;
  const versionTimestamp = req.params.versionTimestamp;

  const versionObjectData = (await db.getAddressVersionObject(addressId, versionTimestamp)).rows[0];
  const versionObject = createAddressEvent(versionObjectData);

  res.json(buildVersionObjectSubjectPage(versionObject, ADDRESS_CONTEXT_URL));
}

function buildAddressShaclResponse(): any {
  const response: any = AdresUtils.getAddressShaclContext();

  response['@id'] = ADDRESS_LDES_URL;
  response['@type'] = 'EventStream';
  response.shape = {
    '@id': ADDRESS_SHACL_BASE_URL,
    '@type': 'NodeShape',
    'sh:property': AdresUtils.getAddressShape()
  }

  return response;
}

function createAddressEvent(data: any): any {
  const addressEvent: any = {};

  addressEvent['@id'] = `${ADDRESS_ID}/${data.object_id}/${data.record_generated_time}`;
  addressEvent.isVersionOf = data.object_uri;
  addressEvent.generatedAtTime = data.record_generated_time;
  addressEvent.created = data.timestamp;
  addressEvent.eventName = data.event_name;

  addressEvent['@type'] = 'BelgischAdres';

  if (data.box_number) {
    addressEvent.busnummer = data.box_number;
  }

  if (data.house_number) {
    addressEvent.huisnummer = data.house_number;
  }

  addressEvent.heeftStraatnaam = data.streetname_puri;
  addressEvent.heeftGemeentenaam = {
    '@type': 'Gemeentenaam',
    gemeentenaam: JSON.parse(data.municipality_name),
    isAfgeleidVan: data.municipality_puri,
  };

  if (data.postal_code) {
    addressEvent.heeftPostinfo = {
      '@type': 'Postinfo',
      postcode: data.postal_code,
    };
  }

  addressEvent.isToegekendDoor = data.municipality_puri;

  addressEvent.positie = {
    '@type': 'GeografischePositie',
    default: true,
    geometrie: {
      '@type': 'Punt',
      gml: data.address_geometry,
    },
    methode: data.position_geometry_method,
    specificatie: data.position_specification,
  };

  addressEvent.officieelToegekend = data.officially_assigned;
  addressEvent.status = data.address_status;

  return addressEvent;
}
