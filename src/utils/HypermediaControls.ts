import type { IFragmentMetadata } from './FragmentMetadata';

export function addTreeRelations(
  fragmentMetadata: IFragmentMetadata,
  baseUrl: string,
): object[] {
  const relations: object[] = [];

  if (fragmentMetadata.previousFragment.present) {
    const previousFragmentTime = fragmentMetadata.previousFragment.value;
    relations.push({
      '@type': 'tree:LessThanRelation',
      'tree:node': `${baseUrl}?generatedAtTime=${previousFragmentTime}`,
      'tree:path': 'prov:generatedAtTime',
      'tree:value': previousFragmentTime,
    });
  }

  if (fragmentMetadata.nextFragment.present) {
    const nextFragmentTime = fragmentMetadata.nextFragment.value;
    relations.push({
      '@type': 'tree:GreaterThanRelation',
      'tree:node': `${baseUrl}?generatedAtTime=${nextFragmentTime}`,
      'tree:path': 'prov:generatedAtTime',
      'tree:value': nextFragmentTime,
    });
  }

  return relations;
}
