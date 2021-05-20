import { configuration } from '../utils/Configuration';
import { db } from '../utils/DatabaseQueries';
import { addNext, addPrevious } from '../utils/HypermediaControls';
import { addContentTypeHeader, addHeaders, setCacheControl } from '../utils/Headers';
import StraatnaamUtils from './StraatnaamUtils';

const STREETNAME_PAGE_BASE_URL = `${configuration.domainName}/straatnaam`;
const STREETNAME_SHACL_BASE_URL = `${configuration.domainName}/straatnaam/shape`;
const MUNICIPALITY_NAMESPACE = `https://data.vlaanderen.be/id/gemeente`;
const STREETNAME_CONTEXT_URL = `${configuration.domainName}/straatnaam/context`;
const PAGE_SIZE = 250;

// Get all events for all street names
export async function getStreetNamePage(req, res) {
  const page = parseInt(req.query.page, 10);

  if (!page) {
    res.redirect('?page=1');
  } else {
    const queryResponse = await db.getStreetNamesPaged(page, PAGE_SIZE);
    addHeaders(res, PAGE_SIZE, queryResponse.rows.length);
    res.json(buildStreetNamePageResponse(queryResponse.rows, PAGE_SIZE, page));
  }
}

export async function getStreetNameShape(req, res){
  addContentTypeHeader(res);
  setCacheControl(res);
  res.json(buildStreetNameShaclResponse());
}

export async function getStreetNameContext(req, res){
  addContentTypeHeader(res);
  setCacheControl(res);
  res.json(StraatnaamUtils.getStreetNameContext());
}

function buildStreetNamePageResponse(items: any[], pageSize: number, page: number) {
  //const response = StraatnaamUtils.getStreetNameContext();
  const response = {};
  response['@context'] = `${STREETNAME_CONTEXT_URL}`;
  
  response['@id'] = `${STREETNAME_PAGE_BASE_URL}?page=${page}`;
  response['viewOf'] = `${STREETNAME_PAGE_BASE_URL}`;

  const tree = [];

  addNext( tree, items.length, pageSize, page, STREETNAME_PAGE_BASE_URL);
  addPrevious( tree, items.length, page, STREETNAME_PAGE_BASE_URL);

  if (tree.length) {
    response['tree:relation'] = tree;
  }

  response['shacl'] = {
    '@id' : STREETNAME_PAGE_BASE_URL,
    'shape' : STREETNAME_SHACL_BASE_URL
  }

  response['items'] = items.map((item) => createStreetNameEvent(item));

  return response;
}

function buildStreetNameShaclResponse(){
  const response = StraatnaamUtils.getStreetNameShaclContext();

  response['@id'] = STREETNAME_SHACL_BASE_URL;
  response['@type'] = "NodeShape";
  response['shapeOf'] = STREETNAME_PAGE_BASE_URL;
  response['sh:property'] = StraatnaamUtils.getStreetNameShape();

  return response;
}

function createStreetNameEvent(data) {
  const streetNameEvent = {};

  const hash = StraatnaamUtils.createObjectHash(data);

  streetNameEvent['@id'] = `${STREETNAME_PAGE_BASE_URL}#${hash}`;
  streetNameEvent['isVersionOf'] = data.object_uri;
  streetNameEvent['generatedAtTime'] = data.timestamp;
  streetNameEvent['eventName'] = data.event_name;
  streetNameEvent['memberOf'] = STREETNAME_PAGE_BASE_URL;
  
  streetNameEvent['@type'] = 'Straatnaam';
  streetNameEvent['straatnaam'] = data.geographical_name;

  streetNameEvent['isToegekendDoor'] = `${MUNICIPALITY_NAMESPACE}/${data.nis_code}`;
  streetNameEvent['status'] = data.street_name_status;

  return streetNameEvent;
}
