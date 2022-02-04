import type { Request, Response } from 'express';
import { configuration } from '../utils/Configuration';
import { db, DbTable } from '../utils/DatabaseQueries';
import { addContentTypeHeader, setCacheControl, addResponseHeaders } from '../utils/Headers';
import { buildFragment, handleRequestAndGetFragmentMetadata } from '../utils/Utils';
import { AdresUtils } from './AdresUtils';

const ADDRESS_PAGE_BASE_URL = `${configuration.domainName}/adres`;
const ADDRESS_SHACL_BASE_URL = `${configuration.domainName}/adres/shape`;
const ADDRESS_CONTEXT_URL = `${configuration.domainName}/adres/context`;

export async function getAddressFragment(req: Request, res: Response): Promise<void> {
  const fragmentMetadata = await handleRequestAndGetFragmentMetadata(req, res, DbTable.Address);

  // Redirects will have no metadata, so will not pass this check
  if (fragmentMetadata) {
    const items = (await db.getAddressItems(fragmentMetadata.index, configuration.pageSize)).rows;
    addResponseHeaders(res, fragmentMetadata);

    res.json(buildFragment(
      items,
      fragmentMetadata,
      ADDRESS_PAGE_BASE_URL,
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

function buildAddressShaclResponse(): any {
  const response: any = AdresUtils.getAddressShaclContext();

  response['@id'] = ADDRESS_SHACL_BASE_URL;
  response['@type'] = 'NodeShape';
  response.shapeOf = ADDRESS_PAGE_BASE_URL;
  response['sh:property'] = AdresUtils.getAddressShape();

  return response;
}

function createAddressEvent(data: any): any {
  const addressEvent: any = {};

  const hash = AdresUtils.createObjectHash(data);

  addressEvent['@id'] = `${ADDRESS_PAGE_BASE_URL}#${hash}`;
  addressEvent.isVersionOf = data.object_uri;
  addressEvent.generatedAtTime = data.record_generated_time;
  addressEvent.created = data.timestamp;
  addressEvent.eventName = data.event_name;
  addressEvent.memberOf = ADDRESS_PAGE_BASE_URL;

  addressEvent['@type'] = 'BelgischAdres';

  if (data.box_number) {
    addressEvent.busnummer = data.box_number;
  }

  if (data.house_number) {
    addressEvent.huisnummer = data.house_number;
  }

  addressEvent.heeftStreetnaam = data.streetname_puri;
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
