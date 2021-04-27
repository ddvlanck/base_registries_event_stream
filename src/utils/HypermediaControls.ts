export function addNext(tree: Array<object>, itemsLength: number, pageSize: number, page: number, baseUrl: string): void {
  if (itemsLength > 0 && itemsLength !== pageSize) return;

  const nextURL = `${baseUrl}?page=${(page + 1)}`;

  tree.push({
    '@type': 'tree:Relation',
    'tree:node': nextURL
  });
}

export function addPrevious(tree: Array<object>, itemsLength: number, page: number, baseUrl: string): void {
  if (page <= 1) return;

  const previousURL = `${baseUrl}?page=${(page - 1)}`;

  if (itemsLength > 0)
    tree.push({
      '@type': 'tree:Relation',
      'tree:node': previousURL
    });
}
