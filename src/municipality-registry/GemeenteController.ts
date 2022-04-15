import type { Request, Response } from 'express';
import { configuration } from '../utils/Configuration';
import { db, DbTable } from '../utils/DatabaseQueries';
import { addContentTypeHeader, addResponseHeaders, setCacheControl } from '../utils/Headers';
import { buildFragment, buildVersionObjectSubjectPage, handleRequestAndGetFragmentMetadata } from '../utils/Utils';
import { GemeenteUtils } from './GemeenteUtils';

const MUNICIPALITY_LDES_URL = `${configuration.domainName}/gemeente`;
const MUNICIPALITY_PAGE_BASE_URL = `${configuration.domainName}/gemeente/time`;
const MUNICIPALITY_SHACL_BASE_URL = `${configuration.domainName}/gemeente/shape`;
const MUNICIPALITY_CONTEXT_URL = `${configuration.domainName}/gemeente/context`;
const MUNICIPALITY_ID = `${configuration.domainName}/id/gemeente`;

export async function getMunicipalityFragment(req: Request, res: Response): Promise<void> {
  const fragmentMetadata = await handleRequestAndGetFragmentMetadata(req, res, DbTable.Municipality);

  // Redirects will have no metadata, so will not pass this check
  if (fragmentMetadata) {
    const items = (await db.getMunicipalityItems(fragmentMetadata.index, configuration.pageSize)).rows;
    const path = `${configuration.domainName}${req.path}`;
    addResponseHeaders(res, fragmentMetadata);

    res.json(buildFragment(
      items,
      fragmentMetadata,
      MUNICIPALITY_LDES_URL,
      path,
      MUNICIPALITY_CONTEXT_URL,
      MUNICIPALITY_SHACL_BASE_URL,
      createMunicipalityEvent,
    ));
  }
}

export async function getMunicipalityShape(req: Request, res: Response): Promise<void> {
  addContentTypeHeader(res);
  setCacheControl(res);
  res.json(buildMunicipalityShaclResponse());
}

export async function getMunicipalityContext(req: Request, res: Response): Promise<void> {
  addContentTypeHeader(res);
  setCacheControl(res);
  res.json(GemeenteUtils.getMunicipalityContext());
}

export async function getMunicipalityVersionObject(req: Request, res: Response): Promise<void> {
  const municipalityId = req.params.municipalityId;
  const versionTimestamp = req.params.versionTimestamp;

  const versionObjectData = (await db.getVersionObject(DbTable.Municipality, municipalityId, versionTimestamp)).rows[0];
  const versionObject = createMunicipalityEvent(versionObjectData);

  res.json(buildVersionObjectSubjectPage(versionObject, MUNICIPALITY_CONTEXT_URL));
}

function buildMunicipalityShaclResponse(): any {
  const response: any = GemeenteUtils.getMunicipalityShaclContext();

  response['@id'] = MUNICIPALITY_LDES_URL;
  response['@type'] = 'EventStream'
  response.shape = {
    '@id': MUNICIPALITY_SHACL_BASE_URL,
    '@type': 'NodeShape',
    'sh:property': GemeenteUtils.getMunicipalityShape()
  }

  return response;
}

function createMunicipalityEvent(data: any): any {
  const municipalityEvent: any = {};

  municipalityEvent['@id'] = `${MUNICIPALITY_ID}/${data.object_id}/${data.record_generated_time}`;
  municipalityEvent.isVersionOf = data.object_uri;
  municipalityEvent.generatedAtTime = data.record_generated_time;
  municipalityEvent.created = data.timestamp;
  municipalityEvent.eventName = data.event_name;

  municipalityEvent['@type'] = 'Gemeente';
  municipalityEvent.gemeentenaam = data.municipality_name;
  municipalityEvent.officieleTaal = data.official_language;

  if (data.facility_language !== null) {
    municipalityEvent.faciliteitenTaal = data.facility_language;
  }
  municipalityEvent.status = data.status;

  return municipalityEvent;
}
