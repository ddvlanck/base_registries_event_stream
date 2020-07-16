export function addNext(context, tree, items, pageSize: number, page: number, base_url) {
  if (items.length !== pageSize) return;

  const nextURL = `${base_url}?page=${(page + 1)}`
  context['next_url'] = nextURL;

  tree.push({
    '@type': 'tree:GreaterOrEqualThanRelation',
    'tree:node': nextURL,
    'tree:path': 'prov:generatedAtTime',
    'tree:value': {
      '@value': items[items.length - 1]['timestamp'],
      '@type': 'xsd:dateTime',
    },
  });
}

export function addPrevious(context, tree, items, page: number, base_url) {
  if (page <= 1) return;

  const previousURL = `${base_url}?page=${(page - 1)}`;
  context['previous_url'] = previousURL;

  if (items.length) {
    tree.push({
      '@type': 'tree:LessOrEqualThanRelation',
      'tree:node': previousURL,
      'tree:path': 'prov:generatedAtTime',
      'tree:value': {
        '@value': items[0]['timestamp'],
        '@type': 'xsd:dateTime',
      },
    });
  }
}
