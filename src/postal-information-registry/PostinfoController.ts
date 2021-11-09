import { configuration } from '../utils/Configuration';
import { db } from '../utils/DatabaseQueries';
import { addContentTypeHeader, addHeaders, setCacheControl } from '../utils/Headers';
import { addNext, addPrevious } from '../utils/HypermediaControls';
import { PostinfoUtils } from './PostinfoUtils';

const POSTAL_INFO_PAGE_BASE_URL = `${configuration.domainName}/postinfo`;
const POSTAL_INFO_SHACL_BASE_URL = `${configuration.domainName}/postinfo/shape`;
const POSTAL_INFO_CONTEXT_URL = `${configuration.domainName}/postinfo/context`;
const PAGE_SIZE = 250;

export async function getPostalInfoPage(req, res): Promise<void> {
  const page = Number.parseInt(req.query.page, 10);

  if (!page) {
    res.redirect('?page=1');
  } else {
    const items = [];
    const stream = await db.getPostalInformationPaged(page, PAGE_SIZE);
    stream.on('data', data => {
      items.push(createPostalInformationEvent(data));
    });

    stream.on('end', () => {
      console.log(`[PostinfoController]: Done transforming objects. Start creating page ${page}.`);
      addHeaders(res, PAGE_SIZE, items.length);
      res.json(buildPostalInfoPageResponse(items, PAGE_SIZE, page));
    });
  }
}

export async function getPostalInfoShape(req, res): Promise<void> {
  addContentTypeHeader(res);
  setCacheControl(res);
  res.json(buildPostalInfoShaclResponse());
}

export async function getPostalInfoContext(req, res): Promise<void> {
  addContentTypeHeader(res);
  setCacheControl(res);
  res.json(PostinfoUtils.getPostalInfoContext());
}

function buildPostalInfoPageResponse(items: any[], pageSize: number, page: number): any {
  // Const response = PostinfoUtils.getPostalInfoContext();
  const response: any = {};
  response['@context'] = `${POSTAL_INFO_CONTEXT_URL}`;

  response['@id'] = `${POSTAL_INFO_PAGE_BASE_URL}?page=${page}`;
  response['@type'] = 'Node';
  response.viewOf = POSTAL_INFO_PAGE_BASE_URL;

  const tree = [];

  addNext(tree, items.length, pageSize, page, POSTAL_INFO_PAGE_BASE_URL);
  addPrevious(tree, items.length, page, POSTAL_INFO_PAGE_BASE_URL);

  if (tree.length > 0) {
    response['tree:relation'] = tree;
  }

  response.collectionInfo = {
    '@id': POSTAL_INFO_PAGE_BASE_URL,
    '@type': 'EventStream',
    shape: POSTAL_INFO_SHACL_BASE_URL,
    timestampPath: 'prov:generatedAtTime',
    versionOfPath: 'dct:isVersionOf',
  };
  response.items = items;

  return response;
}

function buildPostalInfoShaclResponse(): any {
  const response: any = PostinfoUtils.getPostalInfoShaclContext();

  response['@id'] = POSTAL_INFO_SHACL_BASE_URL;
  response['@type'] = 'NodeShape';
  response.shapeOf = POSTAL_INFO_PAGE_BASE_URL;
  response['sh:property'] = PostinfoUtils.getPostalInfoShape();

  return response;
}

function createPostalInformationEvent(data): any {
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
