import { configuration } from '../utils/Configuration';
import { db } from '../utils/DatabaseQueries';
import { addContentTypeHeader, addHeaders, setCacheControl } from '../utils/Headers';
import { addNext, addPrevious } from '../utils/HypermediaControls';
import { GemeenteUtils } from './GemeenteUtils';

const MUNICIPALITY_PAGE_BASE_URL = `${configuration.domainName}/gemeente`;
const MUNICIPALITY_SHACL_BASE_URL = `${configuration.domainName}/gemeente/shape`;
const MUNICIPALITY_CONTEXT_URL = `${configuration.domainName}/gemeente/context`;
const PAGE_SIZE = 250;

export async function getMunicipalityPage(req, res): Promise<void> {
  const page = Number.parseInt(req.query.page, 10);

  if (!page) {
    res.redirect('?page=1');
  } else {
    const items = [];
    const stream = await db.getMunicipalitiesPaged(page, PAGE_SIZE);
    stream.on('data', data => {
      items.push(createMunicipalityEvent(data));
    });

    stream.on('end', () => {
      console.log(`[GemeenteController]: Done transforming objects. Start creating page ${page}.`);
      addHeaders(res, PAGE_SIZE, items.length);
      res.json(buildMunicipalityPageResponse(items, PAGE_SIZE, page));
    });
  }
}

export async function getMunicipalityShape(req, res): Promise<void> {
  addContentTypeHeader(res);
  setCacheControl(res);
  res.json(buildMunicipalityShaclResponse());
}

export async function getMunicipalityContext(req, res): Promise<void> {
  addContentTypeHeader(res);
  setCacheControl(res);
  res.json(GemeenteUtils.getMunicipalityContext());
}

function buildMunicipalityPageResponse(items: any[], pageSize: number, page: number): any {
  const response: any = {};
  response['@context'] = `${MUNICIPALITY_CONTEXT_URL}`;

  response['@id'] = `${MUNICIPALITY_PAGE_BASE_URL}?page=${page}`;
  response['@type'] = 'Node';
  response.viewOf = `${MUNICIPALITY_PAGE_BASE_URL}`;

  const tree = [];

  addNext(tree, items.length, pageSize, page, MUNICIPALITY_PAGE_BASE_URL);
  addPrevious(tree, items.length, page, MUNICIPALITY_PAGE_BASE_URL);

  if (tree.length > 0) {
    response['tree:relation'] = tree;
  }

  response.collectionInfo = {
    '@id': MUNICIPALITY_PAGE_BASE_URL,
    '@type': 'EventStream',
    shape: MUNICIPALITY_SHACL_BASE_URL,
    timestampPath: 'prov:generatedAtTime',
    versionOfPath: 'dct:isVersionOf',
  };

  response.items = items;

  return response;
}

function buildMunicipalityShaclResponse(): any {
  const response: any = GemeenteUtils.getMunicipalityShaclContext();

  response['@id'] = MUNICIPALITY_SHACL_BASE_URL;
  response['@type'] = 'NodeShape';
  response.shapeOf = MUNICIPALITY_PAGE_BASE_URL;
  response['sh:property'] = GemeenteUtils.getMunicipalityShape();

  return response;
}

function createMunicipalityEvent(data): any {
  const municipalityEvent: any = {};

  const hash = GemeenteUtils.createObjectHash(data);

  municipalityEvent['@id'] = `${MUNICIPALITY_PAGE_BASE_URL}#${hash}`;
  municipalityEvent.isVersionOf = data.object_uri;
  municipalityEvent.generatedAtTime = data.record_generated_time;
  municipalityEvent.created = data.timestamp;
  municipalityEvent.eventName = data.event_name;
  municipalityEvent.memberOf = MUNICIPALITY_PAGE_BASE_URL;

  municipalityEvent['@type'] = 'Gemeente';
  municipalityEvent.gemeentenaam = data.municipality_name;
  municipalityEvent.officieleTaal = data.official_language;

  if (data.facility_language !== null) {
    municipalityEvent.faciliteitenTaal = data.facility_language;
  }
  municipalityEvent.status = data.status;

  return municipalityEvent;
}
