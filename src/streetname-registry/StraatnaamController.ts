import type { Request, Response } from 'express';
import { configuration } from '../utils/Configuration';
import { db, DbTable } from '../utils/DatabaseQueries';
import { addContentTypeHeader, addResponseHeaders, setCacheControl } from '../utils/Headers';
import { buildFragment, handleRequestAndGetFragmentMetadata } from '../utils/Utils';
import { StraatnaamUtils } from './StraatnaamUtils';

const STREETNAME_PAGE_BASE_URL = `${configuration.domainName}/straatnaam`;
const STREETNAME_SHACL_BASE_URL = `${configuration.domainName}/straatnaam/shape`;
const MUNICIPALITY_NAMESPACE = `https://data.vlaanderen.be/id/gemeente`;
const STREETNAME_CONTEXT_URL = `${configuration.domainName}/straatnaam/context`;
const PAGE_SIZE = 250;

export async function getStreetNameFragment(req: Request, res: Response): Promise<void> {
  const fragmentMetadata = await handleRequestAndGetFragmentMetadata(req, res, DbTable.StreetName);

  // Redirects will have no metadata, so will not pass this check
  if (fragmentMetadata) {
    const items = (await db.getStreetNameItems(fragmentMetadata.index, configuration.pageSize)).rows;
    addResponseHeaders(res, fragmentMetadata);

    res.json(buildFragment(
      items,
      fragmentMetadata,
      STREETNAME_PAGE_BASE_URL,
      STREETNAME_CONTEXT_URL,
      STREETNAME_SHACL_BASE_URL,
      createStreetNameEvent,
    ));
  }
}

export async function getStreetNameShape(req, res): Promise<void> {
  addContentTypeHeader(res);
  setCacheControl(res);
  res.json(buildStreetNameShaclResponse());
}

export async function getStreetNameContext(req, res): Promise<void> {
  addContentTypeHeader(res);
  setCacheControl(res);
  res.json(StraatnaamUtils.getStreetNameContext());
}

function buildStreetNameShaclResponse(): any {
  const response: any = StraatnaamUtils.getStreetNameShaclContext();

  response['@id'] = STREETNAME_SHACL_BASE_URL;
  response['@type'] = 'NodeShape';
  response.shapeOf = STREETNAME_PAGE_BASE_URL;
  response['sh:property'] = StraatnaamUtils.getStreetNameShape();

  return response;
}

function createStreetNameEvent(data): any {
  const streetNameEvent: any = {};

  const hash = StraatnaamUtils.createObjectHash(data);

  streetNameEvent['@id'] = `${STREETNAME_PAGE_BASE_URL}#${hash}`;
  streetNameEvent.isVersionOf = data.object_uri;
  streetNameEvent.generatedAtTime = data.record_generated_time;
  streetNameEvent.created = data.timestamp;
  streetNameEvent.eventName = data.event_name;
  streetNameEvent.memberOf = STREETNAME_PAGE_BASE_URL;

  streetNameEvent['@type'] = 'Straatnaam';
  streetNameEvent.straatnaam = data.geographical_name;

  streetNameEvent.isToegekendDoor = `${MUNICIPALITY_NAMESPACE}/${data.nis_code}`;

  if (data.homonym !== null) {
    streetNameEvent.homoniemToevoeging = data.homonym;
  }
  streetNameEvent.status = data.street_name_status;

  return streetNameEvent;
}
