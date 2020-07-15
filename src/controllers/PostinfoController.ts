import { configuration } from '../utils/Configuration';
import { db } from '../utils/Db';
import { addNext, addPrevious } from '../utils/HypermediaControls';
import { addHeaders } from '../utils/Headers';

const BASE_URL = `${configuration.domainName}/postalInfo`;
const PAGE_SIZE = 250;

export async function getPostalInfoPage(req, res) {
  const page = parseInt(req.query.page, 10);

  if (!page) {
    res.redirect('?page=1');
  } else {
    const queryResponse = await db.getPostalInformationsPaged(page, PAGE_SIZE);
    addHeaders(res, PAGE_SIZE, queryResponse.rows.length);
    res.json(buildResponse(queryResponse.rows, PAGE_SIZE, page));
  }
}

function buildResponse(items, pageSize, page) {
  const response = getContext();
  response['feed_url'] = BASE_URL;
  response['@id'] = `${BASE_URL}?page=${page}`;

  const tree = [];

  addNext(response, tree, items, pageSize, page, BASE_URL);
  addPrevious(response, tree, items, page, BASE_URL);

  if (tree.length) {
    response['tree:relation'] = tree;
  }

  response['items'] = items.map((item) => createPostalInformationEvent(item));
  response['items'].unshift(getShape(`${BASE_URL}?page=${page}`));

  return response;
}

function createPostalInformationEvent(data) {
  const postInfoEvent = {}

  postInfoEvent['isVersionOf'] = data.object_uri;
  postInfoEvent['generatedAtTime'] = data.timestamp;
  postInfoEvent['eventName'] = data.event_name;
  postInfoEvent['memberOf'] = BASE_URL;

  postInfoEvent['@type'] = 'Postinfo';
  postInfoEvent['postcode'] = parseInt(data.postal_id);

  if (data.postal_names.length && data.postal_names_language.length ) {
    let names = [];
    for (let i = 0; i < data.postal_names.length ; i++) {
      names.push({'@language': data.postal_names_language[i], '@value': data.postal_names[i]});
    }
    postInfoEvent['postnaam'] = names;
  }
  return postInfoEvent;
}

function getShape(pageId: string) {
    return {
      '@id' : pageId,
      'tree:shape' : {
        'sh:property' : [
          {
            'sh:path': 'http://purl.org/dc/terms/isVersionOf',
            'sh:nodeKind': 'sh:IRI',
            'sh:minCount': 1,
            'sh:maxCount': 1,
          },
          {
            'sh:path': 'http://www.w3.org/ns/prov#generatedAtTime',
            'sh:datatype': 'xsd:dateTime',
            'sh:minCount': 1,
            'sh:maxCount': 1
          },
          {
            'sh:path': 'http://www.w3.org/ns/adms#versionNotes',
            'sh:datatype': 'xsd:string',
            'sh:minCount': 1,
            'sh:maxCount': 1
          },
          {
            'sh:path' : 'https://data.vlaanderen.be/ns/adres#postcode',
            'sh:datatype' : 'xsd:integer',
            'sh:minCount': 1,
            'sh:maxCount' : 1
          },
          {
            'sh:path' : 'https://data.vlaanderen.be/ns/adres#postnaam',
            'sh:datatype': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString'
          }
        ]
      }
    }
}

function getContext() {
  return {
    '@context' :
      {
        'xsd': 'http://www.w3.org/2001/XMLSchema#',
        'prov' : 'http://www.w3.org/ns/prov#',
        'eventName': 'http://www.w3.org/ns/adms#versionNotes',
        'generatedAtTime' : 'prov:generatedAtTime',
        'Postinfo' : 'https://data.vlaanderen.be/ns/adres#Postinfo',
        'postcode' : 'https://data.vlaanderen.be/ns/adres#postcode',
        'postnaam' : 'https://data.vlaanderen.be/ns/adres#postnaam',
        'isCompleet': {
          '@id': 'https://basisregisters.vlaanderen.be/ns/addressenregister#isCompleet',
          '@type': 'xsd:boolean'
        },
        'items': {
          '@id': '@graph'
        },
        'isVersionOf': {
          '@id': 'http://purl.org/dc/terms/isVersionOf',
          '@type': '@id'
        },
        'hydra': 'http://www.w3.org/ns/hydra/core#',
        'next_url': {
          '@id': 'hydra:next',
          '@type': '@id'
        },
        'previous_url': {
          '@id': 'hydra:previous',
          '@type': '@id'
        },
        'tree': 'https://w3id.org/tree#',
        'feed_url': {
          '@reverse': 'tree:view',
          '@type': '@id'
        },
        'memberOf': {
          '@reverse': 'tree:member',
          '@type': '@id'
        },
        'tree:node': {
          '@type': '@id'
        },
        'tree:path': {
          '@type': '@id'
        },
        'sh': 'https://www.w3.org/ns/shacl#',
        'sh:nodeKind': {
          '@type': '@id',
        },
        'sh:path': {
          '@type': '@id',
        },
        'sh:datatype': {
          '@type': '@id',
        },
      }
  };
}
