import type { Request, Response } from 'express';
import { configuration } from './Configuration';
import type { DbTable } from './DatabaseQueries';
import { db } from './DatabaseQueries';
import type { IFragmentMetadata } from './FragmentMetadata';
import { addTreeRelations } from './HypermediaControls';

export function redirect(response: Response, to: string): void {
  response.statusCode = 302;
  response.redirect(`?generatedAtTime=${to}`);
}

export async function handleRequestAndGetFragmentMetadata(
  req: Request,
  res: Response,
  entity: DbTable,
): Promise<IFragmentMetadata> {
  const distinctGeneratedAtTimesIndexNumber: any[] =
    (await db.getDistinctGeneratedAtTimesWithIndexNumber(entity, configuration.pageSize)).rows;
  const distinctGeneratedAtTimes: string[] =
    distinctGeneratedAtTimesIndexNumber.map(object => object.record_generated_time);

  // If there is no query parameter, we redirect to the oldest fragment
  if (!req.query.generatedAtTime) {
    redirect(res, distinctGeneratedAtTimes[0]);
    return;
  }

  const generatedAtTime = new Date(decodeURIComponent(<string>req.query.generatedAtTime));
  const fragment =
    (await db.getClosestFragment(
      entity,
      generatedAtTime.toISOString(),
      distinctGeneratedAtTimes,
    )).rows[0];

  // We could not find a fragment, so we redirect to the oldest fragment
  if (fragment.time === null) {
    redirect(res, distinctGeneratedAtTimes[0]);
  }

  const fragmentTime = new Date(fragment.time);

  if (fragmentTime.toISOString() !== generatedAtTime.toISOString()) {
    redirect(res, fragmentTime.toISOString());
  }

  const fragmentIndexNumber =
    Number.parseInt(distinctGeneratedAtTimesIndexNumber
      .find(({ record_generated_time }) => record_generated_time === fragmentTime.toISOString()).index_number, 10);

  // We calculcate the index in the distinctGeneratedTimesArray for the fragment
  // This way, we know whether or not it has previous and/or next fragments
  const arrayIndex = distinctGeneratedAtTimes.indexOf(fragmentTime.toISOString());
  const hasPreviousFragment = arrayIndex > 0;
  const hasNextFragment = arrayIndex < distinctGeneratedAtTimes.length - 1;

  return {
    time: fragmentTime,
    index: fragmentIndexNumber,
    previousFragment: {
      present: hasPreviousFragment,
      ...hasPreviousFragment && { value: distinctGeneratedAtTimes[arrayIndex - 1] },
    },
    nextFragment: {
      present: hasNextFragment,
      ...hasNextFragment && { value: distinctGeneratedAtTimes[arrayIndex + 1] },
    },
  };
}

export function buildFragment(
  items: any[],
  fragmentMetadata: IFragmentMetadata,
  pageUrl: string,
  contextUrl: string,
  shaclUrl: string,
  createMember: (data: any) => any,
): any {
  const fragment: any = {};

  fragment['@context'] = contextUrl;
  fragment['@id'] = `${pageUrl}?generatedAtTime=${fragmentMetadata.time.toISOString()}`;
  fragment['@type'] = 'Node';
  fragment.viewOf = pageUrl;

  const relations = addTreeRelations(fragmentMetadata, pageUrl);

  if (relations.length > 0) {
    fragment['tree:relation'] = relations;
  }

  fragment.collectionInfo = {
    '@id': pageUrl,
    '@type': 'EventStream',
    shape: shaclUrl,
    timestampPath: 'prov:generatedAtTime',
    versionOfPath: 'dct:isVersionOf',
  };

  fragment.items = items.map(item => createMember(item));

  return fragment;
}

export function buildVersionObjectSubjectPage(versionObject: any, contextUrl: string): any {
  let subjectPage: any = {};

  subjectPage['@context'] = contextUrl;
  subjectPage = { ...subjectPage, ...versionObject };

  return subjectPage;
}
