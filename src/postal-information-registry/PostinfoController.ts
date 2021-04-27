import { configuration } from '../utils/Configuration';
import { db } from '../utils/DatabaseQueries';
import { addNext, addPrevious } from '../utils/HypermediaControls';
import { addHeaders } from '../utils/Headers';
import PostinfoUtils from './PostinfoUtils';

const POSTAL_INFO_PAGE_BASE_URL = `${configuration.domainName}/postinfo`;
const POSTAL_INFO_SHACL_BASE_URL = `${configuration.domainName}/postinfo/shacl`;
const PAGE_SIZE = 250;

export async function getPostalInfoPage(req, res) {
  const page = parseInt(req.query.page, 10);

  if (!page) {
    res.redirect('?page=1');
  } else {
    const queryResponse = await db.getPostalInformationPaged(page, PAGE_SIZE);
    addHeaders(res, PAGE_SIZE, queryResponse.rows.length);
    res.json(buildPostalInfoPageResponse(queryResponse.rows, PAGE_SIZE, page));
  }
}

export async function getPostalInfoShape(req, res){
  res.json(buildPostalInfoShaclResponse());
}

function buildPostalInfoPageResponse(items: any[], pageSize: number, page: number) {
  const response = PostinfoUtils.getPostalInfoContext();
  
  response['@id'] = `${POSTAL_INFO_PAGE_BASE_URL}?page=${page}`;
  response['viewOf'] = POSTAL_INFO_PAGE_BASE_URL;

  const tree = [];

  addNext(tree, items.length, pageSize, page, POSTAL_INFO_PAGE_BASE_URL);
  addPrevious(tree, items.length, page, POSTAL_INFO_PAGE_BASE_URL);

  if (tree.length) {
    response['tree:relation'] = tree;
  }

  response['shacl'] = {
    '@id' : POSTAL_INFO_PAGE_BASE_URL,
    'tree:shape' : POSTAL_INFO_SHACL_BASE_URL
  }
  response['items'] = items.map(item => createPostalInformationEvent(item));

  return response;
}

function buildPostalInfoShaclResponse(){
  const response = PostinfoUtils.getPostalInfoShaclContext();

  response['@id'] = POSTAL_INFO_SHACL_BASE_URL;
  response['@type'] = "NodeShape";
  response['shapeOf'] = POSTAL_INFO_PAGE_BASE_URL;
  response['sh:property'] = PostinfoUtils.getPostalInfoShape();

  return response;
}

function createPostalInformationEvent(data) {
  const postInfoEvent = {}

  const hash = PostinfoUtils.createObjectHash(data);
  
  postInfoEvent['@id'] = `${POSTAL_INFO_PAGE_BASE_URL}#${hash}`;
  postInfoEvent['isVersionOf'] = data.object_uri;
  postInfoEvent['generatedAtTime'] = data.timestamp;
  postInfoEvent['eventName'] = data.event_name;
  postInfoEvent['memberOf'] = POSTAL_INFO_PAGE_BASE_URL;

  postInfoEvent['@type'] = 'Postinfo';
  postInfoEvent['postcode'] = parseInt(data.postal_code);

  if (data.postal_names.length ) {
    postInfoEvent['postnaam'] = data.postal_names;
  }

  postInfoEvent['status'] = data.status;
  return postInfoEvent;
}
