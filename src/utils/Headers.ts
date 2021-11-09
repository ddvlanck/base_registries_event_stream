export function addHeaders(response, pageSize: number, numberOfObjects: number): void {
  addContentTypeHeader(response);
  // This header is automatically set, so no need to do this again
  // Response.setHeader('Access-Control-Allow-Origin', '*');

  // When the number of objects returned is lower than the page size
  // We reached the last page
  if (numberOfObjects === pageSize) {
    setCacheControl(response);
  }

  // We can't cache the last page, because it can still change, but we don't know when.
  // With the ETag header present by the NGINX cache, the browser will check on the server if the page was changed.
  // If not changed, then the local version is used, else the newest version is downloaded from the server
}

export function addContentTypeHeader(response): void {
  response.setHeader('Content-Type', 'application/ld+json');
}

export function setCacheControl(response): void {
  // Cache it for one year
  response.setHeader('Cache-control', 'public, max-age=31557600, immutable');
}

export function setNoCache(response): void {
  response.setHeader('Cache-control', 'no-cache');
}
