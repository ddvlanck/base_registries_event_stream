import { configuration } from '../utils/Configuration';
import { db } from '../utils/DatabaseQueries';
import { addContentTypeHeader, addHeaders, setCacheControl } from '../utils/Headers';
import { addNext, addPrevious } from '../utils/HypermediaControls';
import { StraatnaamUtils } from './StraatnaamUtils';

const STREETNAME_PAGE_BASE_URL = `${configuration.domainName}/straatnaam`;
const STREETNAME_SHACL_BASE_URL = `${configuration.domainName}/straatnaam/shape`;
const MUNICIPALITY_NAMESPACE = `https://data.vlaanderen.be/id/gemeente`;
const STREETNAME_CONTEXT_URL = `${configuration.domainName}/straatnaam/context`;
const PAGE_SIZE = 250;

// Get all events for all street names
export async function getStreetNamePage(req, res): Promise<void> {
  const page = Number.parseInt(req.query.page, 10);

  if (!page) {
    res.redirect('?page=1');
  } else {
    const items = [];
    const stream = await db.getStreetNamesPaged(page, PAGE_SIZE);
    stream.on('data', data => {
      items.push(createStreetNameEvent(data));
    });

    stream.on('end', () => {
      console.log(`[StraatnaamController]: Done transforming objects. Start creating page ${page}.`);
      addHeaders(res, PAGE_SIZE, items.length);
      res.json(buildStreetNamePageResponse(items, PAGE_SIZE, page));
    });
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

function buildStreetNamePageResponse(items: any[], pageSize: number, page: number): any {
  const response: any = {};
  response['@context'] = `${STREETNAME_CONTEXT_URL}`;

  response['@id'] = `${STREETNAME_PAGE_BASE_URL}?page=${page}`;
  response['@type'] = 'Node';
  response.viewOf = `${STREETNAME_PAGE_BASE_URL}`;

  const tree = [];

  addNext(tree, items.length, pageSize, page, STREETNAME_PAGE_BASE_URL);
  addPrevious(tree, items.length, page, STREETNAME_PAGE_BASE_URL);

  if (tree.length > 0) {
    response['tree:relation'] = tree;
  }

  response.collectionInfo = {
    '@id': STREETNAME_PAGE_BASE_URL,
    shape: STREETNAME_SHACL_BASE_URL,
    '@type': 'EventStream',
    timestampPath: 'prov:generatedAtTime',
    versionOfPath: 'dct:isVersionOf',
  };

  response.items = items;

  return response;
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
