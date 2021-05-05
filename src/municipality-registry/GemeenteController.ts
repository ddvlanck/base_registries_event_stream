import {configuration} from "../utils/Configuration";
import {db} from "../utils/DatabaseQueries";
import {addHeaders} from "../utils/Headers";
import {addNext, addPrevious} from "../utils/HypermediaControls";
import GemeenteUtils from "./GemeenteUtils";

const MUNICIPALITY_PAGE_BASE_URL = `${configuration.domainName}/gemeente`;
const MUNICIPALITY_SHACL_BASE_URL = `${configuration.domainName}/gemeente/shape`;
const PAGE_SIZE = 250;

export async function getMunicipalityPage(req, res) {
  const page = parseInt(req.query.page, 10);

  if (!page) {
    res.redirect('?page=1');
  } else {
    const queryResponse = await db.getMunicipalitiesPaged(page, PAGE_SIZE);
    addHeaders(res, PAGE_SIZE, queryResponse.rows.length);
    res.json(buildMunicipalityPageResponse(queryResponse.rows, PAGE_SIZE, page));
  }
}

export async function getMunicipalityShape(req, res){
  res.json(buildMunicipalityShaclResponse());
}

function buildMunicipalityPageResponse(items: any[], pageSize: number, page: number){
  const response = GemeenteUtils.getMunicipalityContext();
  
  response['@id'] = `${MUNICIPALITY_PAGE_BASE_URL}?page=${page}`;
  response['viewOf'] = `${MUNICIPALITY_PAGE_BASE_URL}`;

  const tree = [];

  addNext( tree, items.length, pageSize, page, MUNICIPALITY_PAGE_BASE_URL);
  addPrevious( tree, items.length, page, MUNICIPALITY_PAGE_BASE_URL);

  if (tree.length) {
    response['tree:relation'] = tree;
  }

  response['shacl'] = {
    '@id' : MUNICIPALITY_PAGE_BASE_URL,
    'tree:shape' : MUNICIPALITY_SHACL_BASE_URL
  }

  response['items'] = items.map(item => createMunicipalityEvent(item));

  return response;
}

function buildMunicipalityShaclResponse(){
  const response = GemeenteUtils.getMunicipalityShaclContext();

  response['@id'] = MUNICIPALITY_SHACL_BASE_URL;
  response['@type'] = "NodeShape";
  response['shapeOf'] = MUNICIPALITY_PAGE_BASE_URL;
  response['sh:property'] = GemeenteUtils.getMunicipalityShape();

  return response;
}

function createMunicipalityEvent(data) {
  const municipalityEvent = {};

  const hash = GemeenteUtils.createObjectHash(data);

  municipalityEvent['@id'] = `${MUNICIPALITY_PAGE_BASE_URL}#${hash}`;
  municipalityEvent['isVersionOf'] = data.object_uri;
  municipalityEvent['generatedAtTime'] = data.timestamp;
  municipalityEvent['eventName'] = data.event_name;
  municipalityEvent['memberOf'] = MUNICIPALITY_PAGE_BASE_URL;

  municipalityEvent['@type'] = 'Gemeente';
  municipalityEvent['gemeentenaam'] = data.municipality_name;
  municipalityEvent['officieleTalen'] = data.official_language

  if(data.facility_language !== null){
    municipalityEvent['faciliteitenTalen'] = data.facility_language
  }
  municipalityEvent['status'] = data.status;

  return municipalityEvent;
}
