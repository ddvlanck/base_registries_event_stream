import type { Request, Response } from 'express';
import { configuration } from '../utils/Configuration';
import { db, DbTable } from '../utils/DatabaseQueries';
import { addContentTypeHeader, addResponseHeaders, setCacheControl } from '../utils/Headers';
import { buildFragment, handleRequestAndGetFragmentMetadata } from '../utils/Utils';
import { PostinfoUtils } from './PostinfoUtils';

const POSTAL_INFO_PAGE_BASE_URL = `${configuration.domainName}/postinfo`;
const POSTAL_INFO_SHACL_BASE_URL = `${configuration.domainName}/postinfo/shape`;
const POSTAL_INFO_CONTEXT_URL = `${configuration.domainName}/postinfo/context`;

export async function getPostalInfoFragment(req: Request, res: Response): Promise<void> {
  const fragmentMetadata = await handleRequestAndGetFragmentMetadata(req, res, DbTable.PostalInformation);

  // Redirects will have no metadata, so will not pass this check
  if (fragmentMetadata) {
    const items = (await db.getPostalInfoItems(fragmentMetadata.index, configuration.pageSize)).rows;
    addResponseHeaders(res, fragmentMetadata);

    res.json(buildFragment(
      items,
      fragmentMetadata,
      POSTAL_INFO_PAGE_BASE_URL,
      POSTAL_INFO_CONTEXT_URL,
      POSTAL_INFO_SHACL_BASE_URL,
      createPostalInformationEvent,
    ));
  }
}

export async function getPostalInfoShape(req: Request, res: Response): Promise<void> {
  addContentTypeHeader(res);
  setCacheControl(res);
  res.json(buildPostalInfoShaclResponse());
}

export async function getPostalInfoContext(req: Request, res: Response): Promise<void> {
  addContentTypeHeader(res);
  setCacheControl(res);
  res.json(PostinfoUtils.getPostalInfoContext());
}

function buildPostalInfoShaclResponse(): any {
  const response: any = PostinfoUtils.getPostalInfoShaclContext();

  response['@id'] = POSTAL_INFO_SHACL_BASE_URL;
  response['@type'] = 'NodeShape';
  response.shapeOf = POSTAL_INFO_PAGE_BASE_URL;
  response['sh:property'] = PostinfoUtils.getPostalInfoShape();

  return response;
}

function createPostalInformationEvent(data: any): any {
  const postInfoEvent: any = {};

  const hash = PostinfoUtils.createObjectHash(data);

  postInfoEvent['@id'] = `${POSTAL_INFO_PAGE_BASE_URL}#${hash}`;
  postInfoEvent.isVersionOf = data.object_uri;
  postInfoEvent.generatedAtTime = data.record_generated_time;
  postInfoEvent.created = data.timestamp;
  postInfoEvent.eventName = data.event_name;
  postInfoEvent.memberOf = POSTAL_INFO_PAGE_BASE_URL;

  postInfoEvent['@type'] = 'Postinfo';
  postInfoEvent.postcode = Number.parseInt(data.postal_code, 10);

  if (data.postal_names.length > 0) {
    postInfoEvent.postnaam = data.postal_names;
  }

  postInfoEvent.status = data.status;
  return postInfoEvent;
}
