import { db } from '../utils/DatabaseQueries';
import { configuration } from '../utils/Configuration';
import { addNext, addPrevious } from '../utils/HypermediaControls';
import { addHeaders, addContentTypeHeader, setCacheControl } from '../utils/Headers';
import AdresUtils from './AdresUtils';

const ADDRESS_PAGE_BASE_URL = `${configuration.domainName}/adres`;
const ADDRESS_SHACL_BASE_URL = `${configuration.domainName}/adres/shape`;
const ADDRESS_CONTEXT_URL = `${configuration.domainName}/adres/context`;
const PAGE_SIZE = 250;


// Get all events for all addresses
export async function getAddressPage(req, res) {
  const page = parseInt(req.query.page, 10);

  if (!page) {
    res.redirect('?page=1');
  } else {
    const items = [];
    const stream = await db.getAddressesPaged(page, PAGE_SIZE);
    stream.on('data', (data) => {
      items.push(createAddressEvent(data));
    });

    stream.on('end', () => {
      console.log(`[AdresController]: Done transforming objects. Start creating page ${page}.`);
      addHeaders(res, PAGE_SIZE, items.length);
      res.json(buildAddressPageResponse(items, PAGE_SIZE, page));
    });
  }
}

// Get SHACL shape for address objects
export function getAddressShape(req, res) {
  addContentTypeHeader(res);
  setCacheControl(res);
  res.json(buildAddressShaclResponse());
}

export async function getAddressContext(req, res) {
  addContentTypeHeader(res);
  setCacheControl(res);
  res.json(AdresUtils.getAddressContext());
}

function buildAddressPageResponse(items: any[], pageSize: number, page: number) {
  //const response = AdresUtils.getAddressContext();
  const response = {};
  response['@context'] = `${ADDRESS_CONTEXT_URL}`;

  response['@id'] = `${ADDRESS_PAGE_BASE_URL}?page=${page}`;
  response['viewOf'] = `${ADDRESS_PAGE_BASE_URL}`;

  const tree = [];

  addNext(tree, items.length, pageSize, page, ADDRESS_PAGE_BASE_URL);
  addPrevious(tree, items.length, page, ADDRESS_PAGE_BASE_URL);

  if (tree.length) {
    response['tree:relation'] = tree;
  }

  response['shacl'] = {
    '@id': ADDRESS_PAGE_BASE_URL,
    'shape': ADDRESS_SHACL_BASE_URL
  };

  response['items'] = items;

  return response;
}

function buildAddressShaclResponse() {
  const response = AdresUtils.getAddressShaclContext();

  response['@id'] = ADDRESS_SHACL_BASE_URL;
  response['@type'] = "NodeShape";
  response['shapeOf'] = ADDRESS_PAGE_BASE_URL;
  response['sh:property'] = AdresUtils.getAddressShape();

  return response;
}

function createAddressEvent(data) {
  const addressEvent = {};

  const hash = AdresUtils.createObjectHash(data);

  addressEvent['@id'] = `${ADDRESS_PAGE_BASE_URL}#${hash}`;
  addressEvent['isVersionOf'] = data.object_uri;
  addressEvent['generatedAtTime'] = data.record_generated_time;
  addressEvent['created'] = data.timestamp;
  addressEvent['eventName'] = data.event_name;
  addressEvent['memberOf'] = ADDRESS_PAGE_BASE_URL;

  addressEvent['@type'] = 'BelgischAdres';

  if (data.box_number) {
    addressEvent['busnummer'] = data.box_number
  }

  if (data.house_number) {
    addressEvent['huisnummer'] = data.house_number;
  }

  addressEvent['heeftStreetnaam'] = data.streetname_puri;
  addressEvent['heeftGemeentenaam'] = {
    "@type": "Gemeentenaam",
    "gemeentenaam": JSON.parse(data.municipality_name),
    "isAfgeleidVan": data.municipality_puri
  }

  if (data.postal_code) {
    addressEvent['heeftPostinfo'] = {
      "@type": "Postinfo",
      'postcode': data.postal_code
    }
  }

  addressEvent['isToegekendDoor'] = data.municipality_puri;

  addressEvent['positie'] = {
    '@type': 'GeografischePositie',
    'default': true,
    'geometrie': {
      '@type': 'Punt',
      'gml': data.address_geometry
    },
    'methode': data.position_geometry_method,
    'specificatie': data.position_specification
  }

  addressEvent['officieelToegekend'] = data.officially_assigned;
  addressEvent['status'] = data.address_status;

  return addressEvent;
}
